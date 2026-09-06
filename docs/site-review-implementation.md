# September 6, 2026 review implementation

## Implemented

- Prices confirmed by the owner: $199 / $289 / $389 USD. Visible on homepage, seven celebration pages, and the questionnaire page; generated prices come from `config/packages.json`.
- Earlier customer audio preview, shorter homepage introduction, readable wordmark beside the unchanged logo, separate Bar/Bat Mitzvah links, and a direct henna-page preview.
- Responsive grid minimums and audio controls fixed for narrow screens. Small article/sample links use navy on light backgrounds. All 31 pages have a main landmark and skip link. Mobile navigation supports Escape/focus restoration; smooth scrolling respects reduced motion.
- Failed custom playback restores the correct button state and announces an error. Native and custom players pause other samples. The existing GA4 tag records sample play, brief-link clicks, and marked Stripe checkout clicks without personal event properties. Local previews do not configure the production GA4 property.
- Direct visits to the thank-you page cannot create a purchase event or fabricate transaction IDs/amounts. Its wording is neutral receipt guidance; its analytics tag was removed to avoid page-load-derived conversion rules there.
- Homepage-only translation code is split out of shared JavaScript. English services retain English language declarations and specific metadata; their language menus explicitly lead to translated homepages. The translated homepage explains that guides and the brief are English.
- Customer examples are labeled as permissioned, consistent with the owner's answer. Unverified instrumentation claims were softened. The buying sequence and 5–10-minute brief estimate are consistent; blog links to pricing say “View Packages.”
- Reviewed the two unpublished guides (top 10 Jewish wedding songs and personalized Bat Mitzvah gifts) and included their internal links and sitemap entries. First-dance and entrance guides now include named recordings, listening links, and DJ handoff guidance. Seven longer guides have jump links.
- Public-only build replaces whole-repository deployment. Planning documents, instructions, tests, and source tooling are excluded. CSS/JS use content hashes. CI now runs JavaScript tests, builds the artifact, and checks metadata, canonicals, internal links/anchors, referenced assets, JSON-LD syntax, prices, landmarks, and sitemap membership before publishing.
- Current verified business facts take precedence over stale historical marketing notes.

## Verification

- 10 Node tests pass, including unpaid-return behavior, URL/plan validation, event data, reduced-motion scrolling, audio failure/success, native-player switching, and Escape navigation.
- Built artifact passes checks for 31 pages, including 29 indexable sitemap URLs.
- All 31 pages checked in the browser at 320px and 1280px: no horizontal overflow. Homepage also inspected at 360, 375, 390, 430, and 768px; French and Hebrew checked at 320px.
- Real custom audio play/pause/switching and keyboard navigation verified locally. No brief was submitted and no payment was made. These are not end-to-end Stripe/Tally fulfillment tests.
- No measured Lighthouse or field Core Web Vitals claim is made.

## Remaining work that needs business decisions or integration access

1. **Verified purchases and brief completion:** connect trusted Stripe payment/session data and Tally submission results; deduplicate using a real transaction ID. The current change prevents false reporting, but does not implement a server-side payment integration. Reconcile historical GA4 purchase/key-event rules and revenue with Stripe records.
2. **Commercial policies:** confirm typical song length, delivery-clock start, revision scope/timing, cancellation/refund terms, usage rights, and data retention before publishing new policy promises.
3. **Production proof:** confirm who creates/reviews songs and Hebrew pronunciation, accurate human/AI/tool involvement, and a permissioned detailed case study. Do not invent credentials or recordings for celebrations without a matching sample.
4. **Full multilingual SEO:** complete reviewed locale pages and page-specific metadata/canonicals/hreflang if the owner wants multilingual search targeting. Current translations are a homepage convenience, not a fully localized site.
5. **Further shared templates:** pricing is centralized; nav/footer remain static source HTML with build validation. A wider template migration is not necessary for this release.

Unrelated existing audio deletions and local skill/planning files are intentionally not part of the release.
