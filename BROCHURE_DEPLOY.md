# Brochure — public hosting (GitHub Pages)

## Live URL (after deploy)

**https://roomen-nentropy.github.io/nentropy_brochure_ifsfocusdays/**

## Repository

https://github.com/Roomen-nentropy/nentropy_brochure_ifsfocusdays

## Deploy steps

1. Push this project (or a copy with the brochure build config) to `nentropy_brochure_ifsfocusdays` on GitHub.
2. In the repo: **Settings → Pages → Build and deployment → Source**: deploy from branch **`gh-pages`** / **`/ (root)`**.
3. GitHub Actions workflow `.github/workflows/deploy-brochure.yml` runs on push to `main` and publishes `dist/` to `gh-pages`.

Local build:

```bash
npm ci
npm run build:brochure
```

## Print QR code

```bash
npm run brochure:qr
```

Output: `public/brochure-qr-print.png` (1200×1200, links to the live URL above).

The brochure page footer also shows a scannable QR via the same URL.
