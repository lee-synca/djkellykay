# DJ Kelly Kay — djkellykay.com

Static site for DJ Kelly Kay, hosted on Cloudflare (Workers static assets) on the
domain registered with Cloudflare.

## Structure

- `public/` — the site itself. Plain static HTML/CSS/JS, served as-is. Edit directly.
- `wrangler.jsonc` — Cloudflare config (serves `public/`, custom domains
  `djkellykay.com` + `www.djkellykay.com`).

## Workflow

```bash
npm install        # once
npm run dev        # preview at http://localhost:8787
npm run deploy     # deploy to Cloudflare (needs wrangler login on the account that owns the domain)
```

Preview locally and confirm before deploying — production has no undo.

First-time Cloudflare setup: `npx wrangler login` with the account that holds the
djkellykay.com domain, then `npm run deploy`. The custom-domain routes in
`wrangler.jsonc` attach the domain automatically on first deploy.
