// ============================================================
// DJ KELLY KAY — mixtape catalog
//
// This file is the whole catalog. To add a new tape, copy an
// entry, fill it in, and put it FIRST in the list (newest first
// — the first entry is featured as "Latest" on the homepage).
//
// streamUrl / downloadUrl: paste the direct MP3 URL from your
// audio host (e.g. Cloudflare R2, GitHub Releases, archive.org).
// Leave "" until you have one — the buttons will explain
// instead of breaking.
//
// coverImage: path to real cover art in public/covers/ (add
// images at ~1000×1000). Leave "" to get the drawn cassette
// cover using coverBg / coverInk instead.
//
// The first four entries are REAL releases. The last four are
// SAMPLE placeholders from the design mockups — replace them as
// covers and details for the remaining tapes are ready.
// ============================================================

window.MIXTAPES = [
  {
    id: "club-roma",
    vol: "1",
    title: "Club Roma",
    subtitle: "The 90s mixtape — R&B, hip hop, new jack swing, club classics",
    catalog: "",
    runtime: "",
    minutes: null,
    trackCount: null,
    released: "August 2024",
    blurb: "All the hits, all night long.",
    fileNote: "",
    coverImage: "covers/club-roma.jpg",
    coverAlt: "Club Roma Vol 1 cover — DJ Kelly Kay's 90s mixtape, three singers against a neon city skyline",
    coverBg: "#FF5A1E",
    coverInk: "#16130F",
    coverBorder: "",
    streamUrl: "",
    downloadUrl: "",
    tracks: []
  },
  {
    id: "got-a-speaker-bro",
    vol: "1",
    title: "Got A Speaker Bro?",
    subtitle: "Bass is life — loud vibes, good times",
    catalog: "",
    runtime: "",
    minutes: null,
    trackCount: null,
    released: "February 2022",
    blurb: "Turn it up.",
    fileNote: "MP3 · 189 MB",
    coverImage: "covers/got-a-speaker-bro.jpg",
    coverAlt: "Got A Speaker Bro? Vol 1 cover — a giant boombox against a red sunset skyline with palm trees",
    coverBg: "#FF5A1E",
    coverInk: "#16130F",
    coverBorder: "",
    streamUrl: "https://files.djkellykay.com/DJ%20Kelly%20Kay%20-%20Got%20A%20Speaker%20Bro%20-%20Vol%201%20(1).mp3",
    downloadUrl: "https://files.djkellykay.com/DJ%20Kelly%20Kay%20-%20Got%20A%20Speaker%20Bro%20-%20Vol%201%20(1).mp3",
    tracks: []
  },
  {
    id: "backyard-island-vibes",
    vol: "1",
    title: "Backyard Island Vibes",
    subtitle: "Good vibes only — island state of mind",
    catalog: "",
    runtime: "",
    minutes: null,
    trackCount: null,
    released: "March 2013",
    blurb: "Drink up, relax, go slow.",
    fileNote: "",
    coverImage: "covers/backyard-island-vibes.jpg",
    coverAlt: "Backyard Island Vibes Vol 1 cover — a backyard barbecue at sunset with string lights, palms and a boombox",
    coverBg: "#D9A441",
    coverInk: "#16130F",
    coverBorder: "",
    streamUrl: "",
    downloadUrl: "",
    tracks: []
  },
  {
    id: "forever-love",
    vol: "1",
    title: "Forever Love",
    subtitle: "90s slow jam mixtape",
    catalog: "",
    runtime: "",
    minutes: null,
    trackCount: null,
    released: "February 2012",
    blurb: "For you.",
    fileNote: "",
    coverImage: "covers/forever-love.jpg",
    coverAlt: "Forever Love Vol 1 cover — a couple embracing by a city window with roses, candlelight and a cassette",
    coverBg: "#4A3226",
    coverInk: "#F2ECE2",
    coverBorder: "",
    streamUrl: "",
    downloadUrl: "",
    tracks: []
  },

  // --- SAMPLE PLACEHOLDERS below — swap for real tapes ---
  {
    id: "vol-09",
    vol: "09",
    title: "Night Errands",
    subtitle: "",
    catalog: "KKT-09",
    runtime: "62:14",
    minutes: 62,
    trackCount: 18,
    released: "August 2026",
    blurb: "Recorded in one late-night take: slow-burn openers, a disco detour in the middle third, and a comedown built for the drive home.",
    fileNote: "MP3 320 · 142 MB",
    coverImage: "",
    coverAlt: "",
    coverBg: "#FF5A1E",
    coverInk: "#16130F",
    coverBorder: "",
    streamUrl: "",
    downloadUrl: "",
    tracks: [
      { artist: "Marlow Deen", title: "Open Signal", time: "3:41" },
      { artist: "Ferra", title: "Glasswork", time: "4:05" },
      { artist: "Night Bus Committee", title: "Transfer", time: "3:12" },
      { artist: "Y. Prine", title: "Elevator Weather", time: "3:58" },
      { artist: "Cassette Uncle", title: "Rewind Culture", time: "2:47" },
      { artist: "The Errand Boys", title: "Milk Run", time: "3:33" },
      { artist: "Soft Interference", title: "Dial Tone Dreams", time: "4:48" },
      { artist: "Kelly Kay", title: "Interlude: Corner Light", time: "1:12" },
      { artist: "Bruma", title: "Salt Air", time: "3:47" },
      { artist: "Paper Jackets", title: "Receipts", time: "3:05" },
      { artist: "L. Fontaine", title: "Half Past Nowhere", time: "4:12" },
      { artist: "Vendetta Social Club", title: "Petty", time: "2:58" },
      { artist: "Grove Almanac", title: "Porch Frequencies", time: "3:44" },
      { artist: "M/W", title: "Crosswalk", time: "3:19" },
      { artist: "Tin Anniversary", title: "Ten Years of Static", time: "4:02" },
      { artist: "Rue Ardent", title: "Streetlamp Honey", time: "3:36" },
      { artist: "Basement Choir", title: "Low Ceiling", time: "3:51" },
      { artist: "Kelly Kay", title: "Outro: Last Errand", time: "2:24" }
    ]
  },
  {
    id: "vol-08",
    vol: "08",
    title: "Slow Voltage",
    subtitle: "",
    catalog: "KKT-08",
    runtime: "58:02",
    minutes: 58,
    trackCount: 15,
    released: "June 2026",
    blurb: "",
    fileNote: "",
    coverImage: "",
    coverAlt: "",
    coverBg: "#E8DFCF",
    coverInk: "#16130F",
    coverBorder: "",
    streamUrl: "",
    downloadUrl: "",
    tracks: []
  },
  {
    id: "vol-07",
    vol: "07",
    title: "Corner Store Disco",
    subtitle: "",
    catalog: "KKT-07",
    runtime: "71:40",
    minutes: 71,
    trackCount: 21,
    released: "April 2026",
    blurb: "",
    fileNote: "",
    coverImage: "",
    coverAlt: "",
    coverBg: "#16130F",
    coverInk: "#FF5A1E",
    coverBorder: "#3A342C",
    streamUrl: "",
    downloadUrl: "",
    tracks: []
  },
  {
    id: "vol-06",
    vol: "06",
    title: "Rain Check",
    subtitle: "",
    catalog: "KKT-06",
    runtime: "49:18",
    minutes: 49,
    trackCount: 14,
    released: "February 2026",
    blurb: "",
    fileNote: "",
    coverImage: "",
    coverAlt: "",
    coverBg: "#6E6A4E",
    coverInk: "#F2ECE2",
    coverBorder: "",
    streamUrl: "",
    downloadUrl: "",
    tracks: []
  }
];

// Site-wide facts. Replace the placeholder before going live.
window.SITE = {
  contactEmail: "[YOUR CONTACT EMAIL]"
};
