# Astro theme catalogue submission

Submission portal: <https://portal.astro.build>

The portal requires GitHub login. Only a person with access to the repository owner account should complete the final submission.

## Pre-submit checklist

- [ ] Repository is public: <https://github.com/arleycn/sakura-note>
- [ ] `package.json` uses the current Astro major version (`^7.4.12`)
- [ ] README is rewritten for this repository, not the Astro starter README
- [ ] MIT `LICENSE` is present
- [ ] Demo is a live, public, exact deployment of this repository — not a personal site using the theme
- [ ] Demo link appears in the README and in the portal listing
- [ ] Get Started link points to the repository above
- [ ] Screenshots are static PNG files captured from the deployed demo
- [ ] No animated images, no Astro Houston artwork, no personal information
- [ ] All placeholder links use `example.com` or service root URLs
- [ ] Listing description is in English and contains no raw Markdown or HTML

Replace `DEMO_URL` in `README.md` and in the text below before submitting.

## Demo

Use a public deployment of this exact repository. For a Cloudflare Worker deployment, the URL normally looks like `https://sakura-note.<account>.workers.dev` or a custom domain pointed at that Worker.

The demo must match the code a new user gets from the Get Started link. Do not use a separate production blog as the demo.

## Screenshots

Upload static images from the deployed demo:

- `screenshots/desktop.png` — home page, desktop viewport, light theme
- `screenshots/mobile.png` — home page or post page, mobile viewport

Do not upload animated GIFs or screenshots of a different site.

## Description to paste into the portal

Paste the following as plain text. Use the portal's editor buttons for bold or links; do not paste Markdown or HTML syntax.

```text
Sakura Note is a bilingual Astro 7 blog theme with a soft sakura look and a Cloudflare-native runtime. Chinese is the default locale without a prefix, and English lives under /en, with separate posts, tags, RSS feeds, and hreflang links for each language.

Prerendered pages are served from Workers Static Assets, while search, comments, view counts, and image uploads run as on-demand Astro routes on Cloudflare Workers. D1 stores comments, KV stores view counts and rate-limit windows, R2 stores comment images, and Turnstile protects the form. Navigation uses Astro ClientRouter and official Actions rather than a custom ajax layer.

The theme includes a responsive three-column layout, dark mode, reduced-motion support, a small animation budget, content collections with typed front matter, sitemap and RSS integration, SEO metadata, and 16 generic bilingual sample posts. All bundled links and account placeholders use example.com or service root URLs.
```

Keep the listing description short and promotional. Installation steps, troubleshooting notes, and long technical tables belong in the README, not in the catalogue listing.

## After submission

Open the public listing and confirm:

1. The description renders as formatted text, with no visible Markdown or HTML.
2. The demo and Get Started links point to the correct theme.
3. Images are static and show the deployed demo.
4. The demo loads in both locales and the language switch works.

If the listing is edited and saved, it is automatically resubmitted for review.
