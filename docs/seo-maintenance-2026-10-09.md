# SEO maintenance — October 9, 2026

## Verified repository baseline

- Inspected the original checkout at `/Users/dandjaker/Development/Lchaim Lyrics/Lchaimlyrics`, commit `fc63f16`, including `AGENTS.md`, repository SEO audit skill, verified marketing context, local notes, July audit, and September implementation report.
- Existing deleted audio files and untracked `.codex/` / `plans/` were preserved in the original checkout. Work is isolated in a local clone on `seo/october-maintenance`.
- GitHub Pages hosts the site according to `CNAME`, project instructions and `.github/workflows/static.yml`. Main pushes and manual workflow dispatch deploy the generated `_site` artifact. Publication was initially held; the owner subsequently authorized tested improvements to this existing website.
- Existing baseline: 31 public pages, 29 indexable sitemap URLs; unique metadata, matching canonicals, JSON-LD, public-only build and GA4 `G-ND48VMKB6V`. The July recommendations and September release are already implemented and should not be repeated.
- Historical Search Console baseline is April 21–July 20, 2026: 666 impressions, 2 clicks, 0.3% CTR, average position 17.2. This is not current performance evidence.

## Prepared changes

The existing release checker now verifies social URLs against canonicals, required social metadata, JSON-LD presence on indexable pages, the robots sitemap declaration, and crawl permission for Googlebot, Bingbot and wildcard agents. Six mutation tests demonstrate rejection of regressions. CI runs these tests before building and publishing. The homepage also links directly to the existing first-dance, montage and henna music guides. A scoped grid rule makes the three cards span the desktop container and stack on mobile. Only the homepage sitemap modification date changes. Prices, offers, tracking and the brief flow are unchanged.

Validation: 10 existing Node tests passed; six new Python regression tests passed; built site checks passed for all 31 pages / 29 indexable URLs; `git diff --check` passed. Inspected the homepage in Dan’s Chrome browser at desktop and 320px mobile widths, verified the montage destination and keyboard focus, and found no horizontal overflow (320px scroll width at a 320px viewport). No fresh production or Core Web Vitals claims are made.

## Next evidence and access requirements

1. Read access to the existing Search Console domain property (or verified URL-prefix property) for `lchaimlyrics.com`, or owner-provided exports: performance by query/page over comparable 28-day periods after September 6, page indexing, sitemap processing, and key URL inspection. Avoid changing account permissions; the owner can use an already-authorized session or provide exports.
2. Read access to the GA4 property containing measurement ID `G-ND48VMKB6V`, or exported organic landing-page/session/event reports. Review sample play and brief-start signals separately from verified brief completion and purchases. Property identity and access are not established by the tag alone.
3. Trusted Stripe/Tally results and owner confirmation are necessary before completed-purchase or completed-brief attribution can be implemented. Current click events do not establish either outcome. Historical purchase/key-event rules need reconciliation with actual orders.
4. Owner-confirmed commercial policies and permissioned production proof remain prerequisites for expanded trust content. Do not invent terms, credentials or customer stories. Localized SEO needs market priorities and reviewed translations.

The owner authorized publication through the parent task; release verification is recorded separately after publishing. Any subsequently authorized PR should be a draft. No purchases, account changes, outreach or email work occurred.
