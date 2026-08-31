// DJ Kelly Kay — site logic.
//
// Single-page app: the nav, footer and audio player live in the
// persistent shell (index.html); only #view is swapped between the
// home and mixtape views. Because the page never reloads while you
// browse, whatever is playing keeps playing as you move around.
//
// Routing is hash-based (works on GitHub Pages with no server rules):
//   #/            -> home
//   #/tape/<id>   -> a mixtape's page
// Renders the catalog from js/data.js. No build step, no dependencies.

(function () {
  "use strict";

  var TAPES = window.MIXTAPES || [];
  var currentView = null; // "home" | "tape"
  var pendingScroll = null;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function getTape(id) {
    for (var i = 0; i < TAPES.length; i++) {
      if (TAPES[i].id === id) return TAPES[i];
    }
    return null;
  }

  function tapeHref(id) {
    return "#/tape/" + encodeURIComponent(id);
  }

  // ---------- shared SVG snippets ----------

  var svgPlay = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M3 1.5l11 6.5-11 6.5z"></path></svg>';
  var svgPause = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M3.5 2h3v12h-3zM9.5 2h3v12h-3z"></path></svg>';
  var svgDownload = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v8M4.5 7L8 10.5 11.5 7M2.5 13.5h11"></path></svg>';
  var svgBack = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3L5 8l5 5"></path></svg>';
  var svgArrowDown = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3v10M3.5 8.5L8 13l4.5-4.5"></path></svg>';

  function coverHTML(tape) {
    if (tape.coverImage) {
      return '<img class="cover cover-img" src="' + esc(tape.coverImage) + '" alt="' + esc(tape.coverAlt || tape.title + " — mixtape cover art") + '" loading="lazy">';
    }
    var border = tape.coverBorder ? "border: 1px solid " + tape.coverBorder + ";" : "";
    return (
      '<div class="cover" style="background: ' + tape.coverBg + "; color: " + tape.coverInk + ";" + border + '">' +
      '<div class="cover-top"><span>' + esc(tape.catalog) + "</span><span>" + esc(tape.runtime) + "</span></div>" +
      '<svg class="cover-window" viewBox="0 0 120 44" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><rect x="4" y="4" width="112" height="36" rx="18"></rect><circle cx="34" cy="22" r="10"></circle><circle cx="86" cy="22" r="10"></circle></svg>' +
      '<div class="cover-bottom"><div class="cover-num">' + esc(tape.vol) + '</div><div class="cover-title">' + esc(tape.title) + "</div></div>" +
      "</div>"
    );
  }

  // A track may be a plain "Artist - Title" string or a
  // { artist, title, time } object. Normalize to the object form.
  function trackParts(tr) {
    if (typeof tr === "string") {
      var i = tr.indexOf(" - ");
      if (i === -1) return { artist: "", title: tr, time: "" };
      return { artist: tr.slice(0, i), title: tr.slice(i + 3), time: "" };
    }
    return { artist: tr.artist || "", title: tr.title || "", time: tr.time || "" };
  }

  // Meta line under a tape name. Only states what the data actually
  // has: track count / length when known, else the tape's subtitle.
  function factsLine(tape, extra) {
    var parts = [];
    if (tape.trackCount) parts.push(tape.trackCount + " tracks");
    if (tape.minutes) parts.push(tape.minutes + " min");
    if (!parts.length && tape.subtitle) parts.push(tape.subtitle);
    if (extra) parts.push(extra);
    return esc(parts.join(" · "));
  }

  // ---------- toast ----------

  var toastEl = null;
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 3200);
  }

  // ---------- player (persists across view changes) ----------

  var audio = new Audio();
  var player = { el: null, tape: null, toggleBtn: null, seek: null, timeCur: null, timeDur: null, seeking: false };

  function fmtTime(sec) {
    if (!isFinite(sec)) return "0:00";
    sec = Math.floor(sec);
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function buildPlayer() {
    if (player.el) return;
    var el = document.createElement("div");
    el.className = "player";
    el.innerHTML =
      '<div class="player-inner">' +
      '<div class="player-cover"></div>' +
      '<div class="player-info"><div class="player-title"></div><div class="player-sub"></div></div>' +
      '<button class="player-toggle" type="button" aria-label="Pause">' + svgPause + "</button>" +
      '<div class="player-time current">0:00</div>' +
      '<input class="player-seek" type="range" min="0" max="1000" value="0" aria-label="Seek">' +
      '<div class="player-time duration">0:00</div>' +
      "</div>";
    document.body.appendChild(el);
    player.el = el;
    player.toggleBtn = el.querySelector(".player-toggle");
    player.seek = el.querySelector(".player-seek");
    player.timeCur = el.querySelector(".player-time.current");
    player.timeDur = el.querySelector(".player-time.duration");

    player.toggleBtn.addEventListener("click", function () {
      if (audio.paused) { audio.play(); } else { audio.pause(); }
    });
    player.seek.addEventListener("input", function () { player.seeking = true; });
    player.seek.addEventListener("change", function () {
      if (isFinite(audio.duration)) {
        audio.currentTime = (player.seek.value / 1000) * audio.duration;
      }
      player.seeking = false;
    });

    audio.addEventListener("timeupdate", function () {
      player.timeCur.textContent = fmtTime(audio.currentTime);
      if (!player.seeking && isFinite(audio.duration) && audio.duration > 0) {
        player.seek.value = Math.round((audio.currentTime / audio.duration) * 1000);
      }
    });
    audio.addEventListener("durationchange", function () {
      player.timeDur.textContent = fmtTime(audio.duration);
    });
    audio.addEventListener("play", function () {
      player.toggleBtn.innerHTML = svgPause;
      player.toggleBtn.setAttribute("aria-label", "Pause");
    });
    audio.addEventListener("pause", function () {
      player.toggleBtn.innerHTML = svgPlay;
      player.toggleBtn.setAttribute("aria-label", "Play");
    });
    audio.addEventListener("error", function () {
      if (player.tape) toast("Couldn't load the audio for " + player.tape.title + ". Check its streamUrl in js/data.js.");
    });
  }

  function playTape(tape) {
    if (!tape.streamUrl) {
      toast("No audio linked yet for “" + tape.title + "” — add its streamUrl in js/data.js.");
      return;
    }
    buildPlayer();
    if (player.tape && player.tape.id === tape.id) {
      if (audio.paused) { audio.play(); } else { audio.pause(); }
      return;
    }
    player.tape = tape;
    var coverEl = player.el.querySelector(".player-cover");
    if (tape.coverImage) {
      coverEl.style.background = "url('" + tape.coverImage + "') center / cover no-repeat";
      coverEl.textContent = "";
    } else {
      coverEl.style.background = tape.coverBg;
      coverEl.style.color = tape.coverInk;
      coverEl.textContent = tape.vol;
    }
    player.el.querySelector(".player-title").textContent = tape.title;
    player.el.querySelector(".player-sub").textContent = [tape.vol ? "Vol. " + tape.vol : tape.released, tape.runtime].filter(Boolean).join(" · ");
    player.el.classList.add("active");
    document.body.classList.add("has-player");
    audio.src = tape.streamUrl;
    audio.play();
  }

  function downloadTape(tape) {
    if (!tape.downloadUrl) {
      toast("No download linked yet for “" + tape.title + "” — add its downloadUrl in js/data.js.");
      return;
    }
    window.open(tape.downloadUrl, "_blank", "noopener");
  }

  // ---------- view builders ----------

  function featuredHTML(latest) {
    return (
      '<a class="cover-link" href="' + tapeHref(latest.id) + '" aria-label="View ' + esc(latest.title) + '">' + coverHTML(latest) + "</a>" +
      '<div class="featured-meta">' +
      '<div class="stack">' +
      '<div class="eyebrow">LATEST' + (latest.vol ? " · VOL. " + esc(latest.vol) : "") + "</div>" +
      '<div class="tape-name"><a href="' + tapeHref(latest.id) + '">' + esc(latest.title) + "</a></div>" +
      '<div class="tape-facts">' + factsLine(latest, latest.released) + "</div>" +
      "</div>" +
      '<button class="btn btn-ghost" type="button" data-download="' + esc(latest.id) + '">' + svgDownload + "Download</button>" +
      "</div>"
    );
  }

  function crateCardHTML(t) {
    var month = (t.released || "").toUpperCase();
    return (
      '<div class="tape-card">' +
      '<a class="cover-link" href="' + tapeHref(t.id) + '" aria-label="View ' + esc(t.title) + '">' + coverHTML(t) + "</a>" +
      '<div class="info">' +
      '<div class="eyebrow">' + (t.vol ? "VOL. " + esc(t.vol) + " · " : "") + esc(month) + "</div>" +
      '<div class="tape-name"><a href="' + tapeHref(t.id) + '">' + esc(t.title) + "</a></div>" +
      '<div class="tape-facts">' + factsLine(t) + "</div>" +
      "</div>" +
      '<div class="actions">' +
      '<button class="btn btn-ghost btn-listen" type="button" data-play="' + esc(t.id) + '">' + svgPlay + "<span>Listen</span></button>" +
      '<button class="btn btn-ghost btn-icon" type="button" data-download="' + esc(t.id) + '" aria-label="Download ' + esc(t.title) + '">' + svgDownload + "</button>" +
      "</div>" +
      "</div>"
    );
  }

  function homeViewHTML() {
    var latest = TAPES[0];
    var cards = "";
    for (var i = 1; i < TAPES.length; i++) cards += crateCardHTML(TAPES[i]);
    return (
      '<header class="hero">' +
      '<div class="hero-copy">' +
      "<h1>NO GIGS.<br>JUST <em>TAPES.</em></h1>" +
      '<p class="hero-sub">DJ Kelly Kay makes mixtapes — continuous, start-to-finish mixes you can stream right here or download and keep. No clubs, no tour dates, no ticket links. When a tape is ready, it lands on this page.</p>' +
      '<div class="hero-ctas">' +
      (latest ? '<button class="btn btn-accent" type="button" data-play="' + esc(latest.id) + '">' + svgPlay + "Play the latest tape</button>" : "") +
      '<a class="btn btn-text" href="#/" data-nav="crate">Browse the crate' + svgArrowDown + "</a>" +
      "</div>" +
      "</div>" +
      '<div class="featured" id="latest">' + (latest ? featuredHTML(latest) : "") + "</div>" +
      "</header>" +
      '<section class="crate" id="tapes">' +
      '<div class="crate-head"><h2>THE CRATE</h2><p>Every volume streams free. Downloads are yours to keep.</p></div>' +
      '<div class="crate-grid">' + cards + "</div>" +
      "</section>" +
      '<section class="about" id="about">' +
      "<h2>THE TAPE IS<br>THE SHOW.</h2>" +
      '<div class="about-copy">' +
      "<p>Kelly Kay doesn't play clubs, festivals, or private parties. Each volume is the whole performance: one continuous mix, sequenced and recorded end to end, released only when it's ready.</p>" +
      "<p>Press play and the tape streams right here in your browser. Hit download and the full mix is yours to keep — offline, in the car, wherever the errands take you.</p>" +
      "</div>" +
      "</section>"
    );
  }

  function tapeViewHTML(tape) {
    // left column
    var dlLabel = tape.fileNote ? "Download · " + esc(tape.fileNote) : "Download";
    var left =
      '<div class="tape-page-left">' +
      coverHTML(tape) +
      '<div class="buttons">' +
      '<button class="btn btn-accent" type="button" data-play="' + esc(tape.id) + '">' + svgPlay + "Play the tape</button>" +
      '<button class="btn btn-ghost" type="button" data-download="' + esc(tape.id) + '">' + svgDownload + dlLabel + "</button>" +
      "</div>" +
      "</div>";

    // right column
    var rows = "";
    var hasTimes = tape.tracks && tape.tracks.some(function (t) { return trackParts(t).time; });
    if (tape.tracks && tape.tracks.length) {
      for (var i = 0; i < tape.tracks.length; i++) {
        var tp = trackParts(tape.tracks[i]);
        var n = i + 1;
        var names = tp.artist
          ? '<span class="artist">' + esc(tp.artist) + '</span><span class="song"> — ' + esc(tp.title) + "</span>"
          : '<span class="artist">' + esc(tp.title) + "</span>";
        rows +=
          '<div class="track">' +
          '<span class="num">' + (n < 10 ? "0" + n : n) + "</span>" +
          '<span class="names">' + names + "</span>" +
          (hasTimes ? '<span class="time">' + esc(tp.time) + "</span>" : "") +
          "</div>";
      }
    } else {
      rows = '<div class="track-placeholder">Tracklist to be added.</div>';
    }
    var tagline = tape.subtitle || tape.blurb;
    var right =
      '<div class="tape-page-right">' +
      '<div class="headings">' +
      '<div class="eyebrow">' + (tape.vol ? "VOL. " + esc(tape.vol) + " · " : "") + "RELEASED " + esc((tape.released || "").toUpperCase()) + "</div>" +
      "<h1>" + esc(tape.title) + "</h1>" +
      '<div class="tape-facts">' + factsLine(tape, tape.trackCount ? "one continuous mix" : "") + "</div>" +
      "</div>" +
      (tagline ? '<p class="tape-blurb">' + esc(tagline) + "</p>" : "") +
      '<div class="tracklist">' +
      '<div class="tracklist-head"><span>TRACKLIST</span>' + (hasTimes ? "<span>TIME</span>" : "") + "</div>" +
      rows +
      "</div>" +
      "</div>";

    return (
      '<a class="back-link" href="#/" data-nav="crate">' + svgBack + "Back to the crate</a>" +
      '<main class="tape-page">' + left + right + "</main>"
    );
  }

  // ---------- router ----------

  function scrollToTarget(target) {
    if (!target || target === "home") { window.scrollTo(0, 0); return; }
    var el = document.getElementById(target);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else window.scrollTo(0, 0);
  }

  function render() {
    var view = document.getElementById("view");
    if (!view) return;
    var hash = location.hash || "#/";
    var m = hash.match(/^#\/tape\/(.+)$/);

    if (m) {
      var tape = getTape(decodeURIComponent(m[1]));
      if (tape) {
        document.title = tape.title + " — DJ Kelly Kay";
        view.innerHTML = tapeViewHTML(tape);
        currentView = "tape";
        window.scrollTo(0, 0);
        return;
      }
    }

    // default: home
    document.title = "DJ Kelly Kay — Mixtapes";
    view.innerHTML = homeViewHTML();
    currentView = "home";
    if (pendingScroll) {
      var t = pendingScroll;
      pendingScroll = null;
      // let layout settle before scrolling
      requestAnimationFrame(function () { scrollToTarget(t); });
    } else {
      window.scrollTo(0, 0);
    }
  }

  // ---------- global click handling ----------

  document.addEventListener("click", function (e) {
    var closest = e.target.closest ? e.target.closest.bind(e.target) : null;
    if (!closest) return;

    var playBtn = closest("[data-play]");
    if (playBtn) {
      e.preventDefault();
      var pt = getTape(playBtn.getAttribute("data-play"));
      if (pt) playTape(pt);
      return;
    }

    var dlBtn = closest("[data-download]");
    if (dlBtn) {
      e.preventDefault();
      var dt = getTape(dlBtn.getAttribute("data-download"));
      if (dt) downloadTape(dt);
      return;
    }

    var navLink = closest("[data-nav]");
    if (navLink) {
      var target = navLink.getAttribute("data-nav"); // home | crate->tapes | about | latest
      var section = target === "crate" ? "tapes" : target;
      if (currentView === "home") {
        e.preventDefault();
        scrollToTarget(section);
      } else {
        // navigate home first, then scroll once rendered
        e.preventDefault();
        pendingScroll = section;
        if (location.hash === "#/" || location.hash === "") render();
        else location.hash = "#/";
      }
      return;
    }
  });

  // ---------- footer (persistent) ----------

  var svgInstagram = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17" cy="7" r="1.1" fill="currentColor" stroke="none"></circle></svg>';
  var svgSoundcloud = '<svg width="24" height="20" viewBox="0 0 26 18" fill="currentColor" stroke="none" aria-hidden="true"><rect x="0.5" y="9" width="1.7" height="6" rx="0.85"></rect><rect x="4" y="6.5" width="1.7" height="8.5" rx="0.85"></rect><rect x="7.5" y="4" width="1.7" height="11" rx="0.85"></rect><rect x="11" y="6" width="1.7" height="9" rx="0.85"></rect><rect x="14.5" y="7.5" width="1.7" height="7.5" rx="0.85"></rect><rect x="18" y="5.5" width="1.7" height="9.5" rx="0.85"></rect><rect x="21.5" y="8" width="1.7" height="7" rx="0.85"></rect></svg>';

  function initFooter() {
    var site = window.SITE || {};

    var mails = document.querySelectorAll("[data-contact-link]");
    for (var i = 0; i < mails.length; i++) {
      if (site.contactEmail) {
        mails[i].textContent = site.contactEmail;
        mails[i].setAttribute("href", "mailto:" + site.contactEmail);
      } else {
        mails[i].textContent = "";
        mails[i].removeAttribute("href");
      }
    }

    var links = "";
    if (site.instagram) links += '<a href="' + esc(site.instagram) + '" target="_blank" rel="noopener" aria-label="DJ Kelly Kay on Instagram">' + svgInstagram + "</a>";
    if (site.soundcloud) links += '<a href="' + esc(site.soundcloud) + '" target="_blank" rel="noopener" aria-label="DJ Kelly Kay on SoundCloud">' + svgSoundcloud + "</a>";
    var socials = document.querySelectorAll("[data-social]");
    for (var j = 0; j < socials.length; j++) socials[j].innerHTML = links;
  }

  // ---------- boot ----------

  window.addEventListener("hashchange", render);
  document.addEventListener("DOMContentLoaded", function () {
    initFooter();
    render();
  });
})();
