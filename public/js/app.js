// DJ Kelly Kay — site logic. Renders the catalog from js/data.js
// and runs the audio player. No build step, no dependencies.

(function () {
  "use strict";

  var TAPES = window.MIXTAPES || [];

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

  // ---------- shared SVG snippets ----------

  var svgPlay = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M3 1.5l11 6.5-11 6.5z"></path></svg>';
  var svgPause = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M3.5 2h3v12h-3zM9.5 2h3v12h-3z"></path></svg>';
  var svgDownload = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v8M4.5 7L8 10.5 11.5 7M2.5 13.5h11"></path></svg>';

  function coverHTML(tape) {
    var border = tape.coverBorder ? "border: 1px solid " + tape.coverBorder + ";" : "";
    return (
      '<div class="cover" style="background: ' + tape.coverBg + "; color: " + tape.coverInk + ";" + border + '">' +
      '<div class="cover-top"><span>' + esc(tape.catalog) + "</span><span>" + esc(tape.runtime) + "</span></div>" +
      '<svg class="cover-window" viewBox="0 0 120 44" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><rect x="4" y="4" width="112" height="36" rx="18"></rect><circle cx="34" cy="22" r="10"></circle><circle cx="86" cy="22" r="10"></circle></svg>' +
      '<div class="cover-bottom"><div class="cover-num">' + esc(tape.vol) + '</div><div class="cover-title">' + esc(tape.title) + "</div></div>" +
      "</div>"
    );
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

  // ---------- player ----------

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
    coverEl.style.background = tape.coverBg;
    coverEl.style.color = tape.coverInk;
    coverEl.textContent = tape.vol;
    player.el.querySelector(".player-title").textContent = tape.title;
    player.el.querySelector(".player-sub").textContent = "Vol. " + tape.vol + " · " + tape.runtime;
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

  // Event delegation for play/download buttons anywhere on the page.
  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest("[data-play], [data-download]") : null;
    if (!btn) return;
    var playId = btn.getAttribute("data-play");
    var dlId = btn.getAttribute("data-download");
    if (playId) {
      e.preventDefault();
      var t = getTape(playId);
      if (t) playTape(t);
    } else if (dlId) {
      e.preventDefault();
      var t2 = getTape(dlId);
      if (t2) downloadTape(t2);
    }
  });

  // ---------- page: home ----------

  function renderHome() {
    var latest = TAPES[0];
    if (latest) {
      var featured = document.getElementById("featured");
      if (featured) {
        featured.innerHTML =
          '<a class="cover-link" href="mixtape.html?id=' + encodeURIComponent(latest.id) + '" aria-label="View ' + esc(latest.title) + '">' + coverHTML(latest) + "</a>" +
          '<div class="featured-meta">' +
          '<div class="stack">' +
          '<div class="eyebrow">LATEST · VOL. ' + esc(latest.vol) + "</div>" +
          '<div class="tape-name"><a href="mixtape.html?id=' + encodeURIComponent(latest.id) + '">' + esc(latest.title) + "</a></div>" +
          '<div class="tape-facts">' + latest.trackCount + " tracks · " + latest.minutes + " min · " + esc(latest.released) + "</div>" +
          "</div>" +
          '<button class="btn btn-ghost" type="button" data-download="' + esc(latest.id) + '">' + svgDownload + "Download</button>" +
          "</div>";
      }
      var heroPlay = document.getElementById("hero-play");
      if (heroPlay) heroPlay.setAttribute("data-play", latest.id);
    }

    var grid = document.getElementById("crate-grid");
    if (grid) {
      var html = "";
      for (var i = 1; i < TAPES.length; i++) {
        var t = TAPES[i];
        var month = (t.released || "").toUpperCase();
        html +=
          '<div class="tape-card">' +
          '<a class="cover-link" href="mixtape.html?id=' + encodeURIComponent(t.id) + '" aria-label="View ' + esc(t.title) + '">' + coverHTML(t) + "</a>" +
          '<div class="info">' +
          '<div class="eyebrow">VOL. ' + esc(t.vol) + " · " + esc(month) + "</div>" +
          '<div class="tape-name"><a href="mixtape.html?id=' + encodeURIComponent(t.id) + '">' + esc(t.title) + "</a></div>" +
          '<div class="tape-facts">' + t.trackCount + " tracks · " + t.minutes + " min</div>" +
          "</div>" +
          '<div class="actions">' +
          '<button class="btn btn-ghost btn-listen" type="button" data-play="' + esc(t.id) + '">' + svgPlay + "<span>Listen</span></button>" +
          '<button class="btn btn-ghost btn-icon" type="button" data-download="' + esc(t.id) + '" aria-label="Download ' + esc(t.title) + '">' + svgDownload + "</button>" +
          "</div>" +
          "</div>";
      }
      grid.innerHTML = html;
    }
  }

  // ---------- page: mixtape ----------

  function renderMixtape() {
    var params = new URLSearchParams(window.location.search);
    var tape = getTape(params.get("id")) || TAPES[0];
    if (!tape) return;

    document.title = tape.title + " — DJ Kelly Kay";

    var left = document.getElementById("tape-left");
    if (left) {
      var dlLabel = tape.fileNote ? "Download · " + esc(tape.fileNote) : "Download";
      left.innerHTML =
        coverHTML(tape) +
        '<div class="buttons">' +
        '<button class="btn btn-accent" type="button" data-play="' + esc(tape.id) + '">' + svgPlay + "Play the tape</button>" +
        '<button class="btn btn-ghost" type="button" data-download="' + esc(tape.id) + '">' + svgDownload + dlLabel + "</button>" +
        "</div>";
    }

    var right = document.getElementById("tape-right");
    if (right) {
      var rows = "";
      if (tape.tracks && tape.tracks.length) {
        for (var i = 0; i < tape.tracks.length; i++) {
          var tr = tape.tracks[i];
          var n = i + 1;
          rows +=
            '<div class="track">' +
            '<span class="num">' + (n < 10 ? "0" + n : n) + "</span>" +
            '<span class="names"><span class="artist">' + esc(tr.artist) + '</span><span class="song"> — ' + esc(tr.title) + "</span></span>" +
            '<span class="time">' + esc(tr.time) + "</span>" +
            "</div>";
        }
      } else {
        rows = '<div class="track-placeholder">Tracklist to be added.</div>';
      }
      right.innerHTML =
        '<div class="headings">' +
        '<div class="eyebrow">VOL. ' + esc(tape.vol) + " · RELEASED " + esc((tape.released || "").toUpperCase()) + "</div>" +
        "<h1>" + esc(tape.title) + "</h1>" +
        '<div class="tape-facts">' + tape.trackCount + " tracks · " + tape.minutes + " min · one continuous mix</div>" +
        "</div>" +
        (tape.blurb ? '<p class="tape-blurb">' + esc(tape.blurb) + "</p>" : "") +
        '<div class="tracklist">' +
        '<div class="tracklist-head"><span>TRACKLIST</span><span>TIME</span></div>' +
        rows +
        "</div>";
    }
  }

  // ---------- boot ----------

  function initFooter() {
    var slots = document.querySelectorAll("[data-contact]");
    var email = (window.SITE && window.SITE.contactEmail) || "";
    for (var i = 0; i < slots.length; i++) slots[i].textContent = email;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var page = document.body.getAttribute("data-page");
    if (page === "home") renderHome();
    if (page === "mixtape") renderMixtape();
    initFooter();
  });
})();
