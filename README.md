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

## DNS (Cloudflare, already configured)

- `djkellykay.com` A → 185.199.108/109/110/111.153 (GitHub Pages apex IPs)
- `www` CNAME → `lee-synca.github.io`
- All records DNS-only (grey cloud) so GitHub can manage the HTTPS certificate.
- Custom domain is set in the repo's Pages settings.
