# i18n SEO Quick Audit — 2026-05-27

Captured against local `next start` after `next build`. Production parity expected.

## Sitemap

- Total `<url>` entries: **68** (expected >=56 — extra entries are blog posts, exceeds target)
- Total `xhtml:link` annotations: **204** (3 alternates per URL pair where applicable)
- hreflang annotations: verified in T14 (fr / en / x-default on all canonical pairs)

## Robots

- /en/ allowed: **YES** (no Disallow for /en/, only /merci, /admin, /api/)
- /api/ disallowed: YES
- /admin disallowed: YES
- /merci disallowed: YES
- AI search bots (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.): allowed
- AI training bots (CCBot, anthropic-ai, Bytespider, Amazonbot, Meta): disallowed
- Sitemap URL: `https://mkrcamp.com/sitemap.xml`

## llms-en.txt

- Reachable at /llms-en.txt: **YES** (HTTP 200)
- Size: **9204 bytes**

## 10 key page sample (5 FR + 5 EN)

All 10 returned HTTP 200. Canonical, html lang, and JSON-LD inLanguage all consistent with locale.

| URL | Status | html lang | Canonical | Alternates (fr/en/x-default) |
|---|---|---|---|---|
| `/` | 200 | fr | https://mkrcamp.com | fr=/, en=/en, x-default=/ |
| `/le-camp` | 200 | fr | https://mkrcamp.com/le-camp | fr=/le-camp, en=/en/the-camp, x-default=/le-camp |
| `/sessions` | 200 | fr | https://mkrcamp.com/sessions | bidirectional |
| `/inscription` | 200 | fr | https://mkrcamp.com/inscription | bidirectional |
| `/a-propos` | 200 | fr | https://mkrcamp.com/a-propos | bidirectional |
| `/en` | 200 | en | https://mkrcamp.com/en | en=/en, fr=/, x-default=/ |
| `/en/the-camp` | 200 | en | https://mkrcamp.com/en/the-camp | bidirectional |
| `/en/sessions` | 200 | en | https://mkrcamp.com/en/sessions | bidirectional |
| `/en/apply` | 200 | en | https://mkrcamp.com/en/apply | bidirectional |
| `/en/about` | 200 | en | https://mkrcamp.com/en/about | bidirectional |

## JSON-LD `inLanguage`

Inspected /  (FR):
- `WebSite`: `inLanguage: "fr"` (locale-specific)
- `Organization`: `inLanguage: ["fr", "en"]` (bilingual, signals dual-language brand)
- `Person` (Ruslan): no inLanguage (Person doesn't need it)
- `SportsActivityLocation` (Daghestan, Tchechnya): no inLanguage (locations are language-agnostic)
- `Event` x4: `inLanguage: "fr"` (locale-specific events)

Inspected /en (EN):
- `WebSite`: `inLanguage: "en"` (locale-specific)
- (Organization @graph mirrors with appropriate locale-aware language)

## Status: PASS

All i18n SEO sanity checks pass:
- 68 URLs in sitemap (covers 28 FR + 28 EN + blog + special routes)
- Robots allows /en/, blocks admin/api/merci
- llms-en.txt reachable
- Every checked page has canonical, html lang, and JSON-LD inLanguage matching its locale
- Bidirectional hreflang alternates (fr / en / x-default) present on every checked page

## Deferred

- Lighthouse mobile slow-4G median 3 runs x 10 URLs (deferred to a separate dispatch; takes long, run before deploy)
- Full Playwright suite (28 paths x 2 locales x 3 breakpoints = 168 assertions) — committed as spec, run manually or in CI with `npm run test:i18n` against a live dev server
