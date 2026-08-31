# DJ Kelly Kay — djkellykay.com

Static site for DJ Kelly Kay, hosted on **GitHub Pages** at djkellykay.com
(domain registered with Cloudflare, DNS points at GitHub Pages).

## Structure

- `public/` — the site itself. Plain static HTML/CSS/JS, served as-is. Edit directly.
- `.github/workflows/deploy.yml` — deploys `public/` to GitHub Pages on every
  push to `main`.
- `wrangler.jsonc` / `package.json` — local preview only (`npm run dev` serves
  `public/` at http://localhost:8787). Do **not** `wrangler deploy`; hosting is
  GitHub Pages, not Cloudflare.

## Workflow

```bash
npm install        # once
npm run dev        # preview at http://localhost:8787
```

Then commit and push to `main` — GitHub Actions deploys automatically.
Preview locally and confirm before pushing to `main` (a push to main IS a deploy).

## Adding or editing mixtapes

The whole catalog lives in **`public/js/data.js`**. Each tape is one entry;
keep the list newest-first — the first entry is featured as "Latest" on the
homepage.

- `streamUrl` — direct MP3 URL for in-browser playback (leave `""` until you
  have one; the button explains instead of breaking).
- `downloadUrl` — URL for the download button. Host MP3s outside this repo
  (Cloudflare R2, GitHub Releases, archive.org — GitHub blocks files over
  100 MB) and paste the URLs here.
- `tracks` — the tracklist shown on the mixtape page; an empty list shows
  "Tracklist to be added."
- Cover art is drawn in code from `coverBg` / `coverInk` (plus optional
  `coverBorder` for dark covers).

Also in `data.js`: set `SITE.contactEmail` (the footer shows a placeholder
until you do).

> **Note:** the entries currently in `data.js` are sample data from the design
> mockups — replace them with real releases.

## DNS (Cloudflare, already configured)

- `djkellykay.com` A → 185.199.108/109/110/111.153 (GitHub Pages apex IPs)
- `www` CNAME → `lee-synca.github.io`
- All records DNS-only (grey cloud) so GitHub can manage the HTTPS certificate.
- Custom domain is set in the repo's Pages settings.
