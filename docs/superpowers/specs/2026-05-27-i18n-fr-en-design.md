# Design — Site MKR bilingue FR + EN (i18n full-site)

**Date** : 2026-05-27
**Projet** : MKR Caucasian Camp (mkrcamp.com)
**Surfaces touchées** : tout le site public + admin (reste FR) + API + Supabase (additif) + PDF guide
**Stack actuelle** : Next.js 16.2.2 (Turbopack, App Router) · TypeScript · framer-motion · CSS vanilla (`globals.css`)

## 1. Objectif

Transformer `mkrcamp.com` (aujourd'hui 100% FR) en site bilingue FR + EN pour ouvrir l'inscription aux candidats anglophones du monde entier, sans perdre une once de SEO sur la version FR existante. Le FR reste la langue primaire (URL racine inchangée). L'EN devient une langue de conversion structurelle, intégrée dès l'architecture (routing, SEO, GEO/AI search, formulaires, PDF guide).

Le back-office (`/admin/*`, notifications Slack, audit log) reste 100% FR : Ruslan opère en FR, les emails internes restent FR, et les valeurs payload stockées dans Supabase restent normalisées en FR pour ne casser aucun filtre SQL existant.

## 2. Décisions validées par David

| # | Sujet | Choix |
|---|---|---|
| 1 | Périmètre V1 | **Full EN** — 26 pages + 36 composants + 6 data files + 6 articles blog + PDF guide + JSON-LD. Admin et Slack restent FR. |
| 2 | Routing | **FR à la racine** (`/le-camp`) sans préfixe + **`/en/` avec slugs traduits** (`/en/the-camp`). Zéro 301 sur le FR existant. |
| 3 | Lib i18n | **next-intl v3+** (standard App Router 2026, compat Next.js 16 à vérifier en phase 1). |
| 4 | Workflow traduction | **Claude pilote tout** — master prompt + sub-agents `general-purpose` en parallèle + QA layout Playwright + CI/CD i18n-check + slash command `/translate-content` pour le futur. |
| 5 | Langues futures | **FR + EN seulement V1**, pas d'architecture N-langues (pas de RU prévu, refactor accepté si besoin V2). |
| 6 | Détection langue | **Auto Accept-Language** au premier visit, **switcher persistant** dans le `<Nav />`, cookie `NEXT_LOCALE` 1 an. |
| 7 | Blog | **6 articles traduits** en EN (slugs traduits) + pipeline auto-trad pour les futurs articles. |
| 8 | Form Supabase | **Labels EN visibles côté user**, **valeurs payload FR normalisées** (`niveau: 'avance'`), nouvelle colonne `submission_language: 'fr' \| 'en'`. |
| 9 | PDF guide | **Refait en EN** via la même pipeline WeasyPrint (`docs/guide-caucase/guide.en.html` → `public/caucasus-guide.pdf`). |
| 10 | Emails Resend (V2) | Préparer 2 templates par event (`.fr.tsx` + `.en.tsx`), branchés sur `submission_language`. |
| 11 | SEO multilingue | hreflang bidirectionnel + `x-default` FR + canonical par locale + sitemap doublé (56 URLs) + JSON-LD `inLanguage`. |
| 12 | GEO/AI search | `llms-en.txt` jumeau + Schema enrichi `Speakable`/`FAQPage`/`HowTo` + passage-level citability + IndexNow ping EN + Yandex enrollment. |
| 13 | Geo-IP routing | **Non** — uniquement `Accept-Language`. Pas de routing basé sur l'IP (pénalité Google + UX dégradée pour expats/VPN). |

## 3. Architecture front-end

### 3.1 Lib choisie : `next-intl` v3+

Standard de fait pour Next.js App Router en 2026. Justifications :

- **Compat Next.js 16 App Router** (Turbopack + Server Components) — l'i18n built-in de Next.js a été déprécié pour l'App Router. Une lib externe est obligatoire. La compat exacte avec Next.js 16.2.2 doit être validée en phase 1 du plan d'implémentation (lecture `node_modules/next/dist/docs/` car AGENTS.md signale des breaking changes).
- **Middleware native** pour la détection + redirect (`createMiddleware` + `Accept-Language`).
- **Type-safe** : clés typées TypeScript (`useTranslations('home.hero')`), erreurs en dev.
- **ICU MessageFormat** : pluralisation, interpolation propre (utile pour les CTAs dynamiques type "X places restantes").
- **Static rendering** compatible : pas de regression Lighthouse (LCP critique pour MKR slow-4G).
- **`Link` localisé** : `<Link href="/sessions">` ré-écrit automatiquement en `/en/sessions` selon la locale active, sans dupliquer la logique partout.

**Alternatives rejetées** :
- `next-i18next` : legacy Pages Router, moins idiomatique en App Router.
- `Paraglide-JS` : très perfo mais écosystème moins mature, moins de docs sur App Router.
- Custom (middleware + dictionnaires flat) : trop de plomberie à maintenir.

### 3.2 Structure des URLs (sub-path FR racine + slugs EN traduits)

FR garde toutes ses URLs actuelles, zéro 301, zéro perte de jus SEO. EN se rajoute sous `/en/` avec slugs traduits matchant l'intent search anglophone.

```
mkrcamp.com/                          → FR homepage (inchangé)
mkrcamp.com/le-camp                   → FR (inchangé)
mkrcamp.com/sessions                  → FR (inchangé)
mkrcamp.com/inscription               → FR (inchangé)
mkrcamp.com/programme/lutte           → FR (inchangé)
mkrcamp.com/blog/khabib-methode-entrainement → FR (inchangé)
...

mkrcamp.com/en                        → EN homepage
mkrcamp.com/en/the-camp               → EN /le-camp
mkrcamp.com/en/sessions               → EN /sessions (slug universel)
mkrcamp.com/en/apply                  → EN /inscription
mkrcamp.com/en/program                → EN /programme
mkrcamp.com/en/program/wrestling      → EN /programme/lutte
mkrcamp.com/en/program/youth-wrestling → EN /programme/lutte-enfants
mkrcamp.com/en/program/mma            → EN /programme/mma
mkrcamp.com/en/caucasus-guide         → EN /guide-caucase
mkrcamp.com/en/how-it-works           → EN /comment-ca-marche
mkrcamp.com/en/prepare-your-camp      → EN /preparer-son-camp
mkrcamp.com/en/family                 → EN /familles
mkrcamp.com/en/custom                 → EN /sur-mesure
mkrcamp.com/en/clubs-groups           → EN /clubs-groupes
mkrcamp.com/en/destinations           → EN /destinations
mkrcamp.com/en/destinations/dagestan  → EN /destinations/dagestan (slug univ., spelling EN-correct sans H)
mkrcamp.com/en/destinations/chechnya  → EN /destinations/tchetchenie
mkrcamp.com/en/testimonials           → EN /temoignages
mkrcamp.com/en/about                  → EN /a-propos
mkrcamp.com/en/contact                → EN /contact
mkrcamp.com/en/faq                    → EN /faq
mkrcamp.com/en/gallery                → EN /galerie
mkrcamp.com/en/logistics              → EN /logistique
mkrcamp.com/en/mkr-camp-2026          → EN /mkr-camp-2026 (slug produit)
mkrcamp.com/en/thank-you              → EN /merci
mkrcamp.com/en/terms                  → EN /cgv
mkrcamp.com/en/legal                  → EN /mentions-legales
mkrcamp.com/en/privacy                → EN /politique-de-confidentialite
mkrcamp.com/en/blog                   → EN /blog
mkrcamp.com/en/blog/why-dagestan-dominates-mma → EN /blog/pourquoi-le-dagestan-domine-le-mma
mkrcamp.com/en/blog/preparing-your-first-camp → EN /blog/preparer-son-premier-camp
mkrcamp.com/en/blog/dagestani-wrestling-guide → EN /blog/lutte-daghestanaise-guide-complet
mkrcamp.com/en/blog/dagestan-safety-2026 → EN /blog/securite-dagestan-2026
mkrcamp.com/en/blog/combat-athlete-nutrition → EN /blog/nutrition-athlete-combat
mkrcamp.com/en/blog/khabib-training-method → EN /blog/khabib-methode-entrainement
mkrcamp.com/en/coaches                → EN /coachs (redirect /en/program, comme FR)

mkrcamp.com/admin/*                   → 100% FR (middleware bloque /en/admin/*)
mkrcamp.com/inscription               → reste accessible aux 2 langues (lit `?locale=en` ou cookie)
```

### 3.3 Mapping centralisé des slugs

Single source of truth dans `src/i18n/routing.ts` :

```ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en'] as const,
  defaultLocale: 'fr',
  localePrefix: {
    mode: 'as-needed',  // FR sans préfixe, EN avec /en/
    prefixes: { en: '/en' }
  },
  pathnames: {
    '/': '/',
    '/le-camp': { fr: '/le-camp', en: '/the-camp' },
    '/programme': { fr: '/programme', en: '/program' },
    '/programme/lutte': { fr: '/programme/lutte', en: '/program/wrestling' },
    '/programme/lutte-enfants': { fr: '/programme/lutte-enfants', en: '/program/youth-wrestling' },
    '/programme/mma': { fr: '/programme/mma', en: '/program/mma' },
    '/sessions': '/sessions',
    '/inscription': { fr: '/inscription', en: '/apply' },
    '/mkr-camp-2026': '/mkr-camp-2026',
    '/familles': { fr: '/familles', en: '/family' },
    '/sur-mesure': { fr: '/sur-mesure', en: '/custom' },
    '/clubs-groupes': { fr: '/clubs-groupes', en: '/clubs-groups' },
    '/destinations': '/destinations',
    '/destinations/dagestan': '/destinations/dagestan',
    '/destinations/tchetchenie': { fr: '/destinations/tchetchenie', en: '/destinations/chechnya' },
    '/coachs': { fr: '/coachs', en: '/coaches' },
    '/temoignages': { fr: '/temoignages', en: '/testimonials' },
    '/a-propos': { fr: '/a-propos', en: '/about' },
    '/contact': '/contact',
    '/faq': '/faq',
    '/galerie': { fr: '/galerie', en: '/gallery' },
    '/logistique': { fr: '/logistique', en: '/logistics' },
    '/comment-ca-marche': { fr: '/comment-ca-marche', en: '/how-it-works' },
    '/preparer-son-camp': { fr: '/preparer-son-camp', en: '/prepare-your-camp' },
    '/guide-caucase': { fr: '/guide-caucase', en: '/caucasus-guide' },
    '/merci': { fr: '/merci', en: '/thank-you' },
    '/cgv': { fr: '/cgv', en: '/terms' },
    '/mentions-legales': { fr: '/mentions-legales', en: '/legal' },
    '/politique-de-confidentialite': { fr: '/politique-de-confidentialite', en: '/privacy' },
    '/blog': '/blog',
    '/blog/[slug]': '/blog/[slug]',
  }
});

// Mapping des slugs d'articles blog (FR → EN)
export const BLOG_SLUG_MAP: Record<string, { fr: string; en: string }> = {
  'pourquoi-le-dagestan-domine-le-mma': { fr: 'pourquoi-le-dagestan-domine-le-mma', en: 'why-dagestan-dominates-mma' },
  'preparer-son-premier-camp': { fr: 'preparer-son-premier-camp', en: 'preparing-your-first-camp' },
  'lutte-daghestanaise-guide-complet': { fr: 'lutte-daghestanaise-guide-complet', en: 'dagestani-wrestling-guide' },
  'securite-dagestan-2026': { fr: 'securite-dagestan-2026', en: 'dagestan-safety-2026' },
  'nutrition-athlete-combat': { fr: 'nutrition-athlete-combat', en: 'combat-athlete-nutrition' },
  'khabib-methode-entrainement': { fr: 'khabib-methode-entrainement', en: 'khabib-training-method' },
};
```

### 3.4 Structure `src/app/` cible (Next.js 16 App Router + next-intl)

```
src/app/
├── [locale]/                          ← nouveau wrapper dynamic segment
│   ├── layout.tsx                     ← provider next-intl + <html lang={locale}>
│   ├── (site)/                        ← group route, layout commun Nav+Footer
│   │   ├── layout.tsx                 ← wrap Nav + Footer + StickyMobileCTA
│   │   ├── page.tsx                   ← homepage (déplacée depuis (site)/)
│   │   ├── le-camp/page.tsx           ← route literal FR (next-intl mappe vers /en/the-camp)
│   │   ├── sessions/page.tsx
│   │   ├── programme/[discipline]/page.tsx
│   │   ├── ... (25 dossiers/page.tsx)
│   │   └── blog/[slug]/page.tsx
│   └── inscription/page.tsx           ← HORS group (site), comme avant
│                                        (next-intl pathnames le ré-écrit en /en/apply)
├── api/                               ← API NEUTRES (pas localisées)
│   ├── inscription/route.ts
│   ├── guide-caucase/route.ts
│   ├── places/route.ts
│   └── admin/...
├── admin/                             ← FR uniquement (middleware bloque /en/admin)
│   └── inscriptions/...
├── sitemap.ts                         ← refondu pour générer 56 URLs (FR + EN)
├── robots.ts
└── manifest.ts

middleware.ts                          ← next-intl + logique custom
i18n.ts                                ← config next-intl (locales, defaultLocale)
i18n/
  routing.ts                           ← pathnames map (cf. 3.3)
  request.ts                           ← getRequestConfig pour le SSR
  glossary.md                          ← glossaire MKR FR↔EN (cf. section 9)

messages/
├── fr/
│   ├── common.json                    ← Nav, Footer, CTAs, boutons globaux
│   ├── home.json                      ← Hero, sections homepage
│   ├── le-camp.json
│   ├── programme.json
│   ├── programme.lutte.json
│   ├── programme.lutte-enfants.json
│   ├── programme.mma.json
│   ├── sessions.json
│   ├── inscription.json               ← labels form + erreurs validation + récap
│   ├── familles.json
│   ├── sur-mesure.json
│   ├── clubs-groupes.json
│   ├── destinations.json
│   ├── destinations.dagestan.json
│   ├── destinations.tchetchenie.json
│   ├── temoignages.json
│   ├── a-propos.json
│   ├── contact.json
│   ├── faq.json
│   ├── galerie.json
│   ├── logistique.json
│   ├── comment-ca-marche.json
│   ├── preparer-son-camp.json
│   ├── guide-caucase.json
│   ├── merci.json
│   ├── cgv.json
│   ├── mentions-legales.json
│   ├── politique-de-confidentialite.json
│   ├── coachs.json
│   ├── mkr-camp-2026.json
│   ├── blog.json                      ← liste articles (titres, excerpts)
│   ├── blog/                          ← articles (1 fichier par slug)
│   │   ├── khabib-methode-entrainement.json
│   │   ├── pourquoi-le-dagestan-domine-le-mma.json
│   │   └── ...
│   ├── data.sessions.json             ← copie des labels marketing depuis data/sessions.ts
│   ├── data.faq.json                  ← FAQ_HOMEPAGE + FAQ_CATEGORIES
│   ├── data.testimonials.json         ← quotes athlètes
│   ├── data.registration-types.json   ← 4 tunnels (label, badge, description, longDescription)
│   ├── data.antoine-parcours.json     ← copy VerticalVideoSplit (3 variants)
│   ├── data.coaches.json              ← bio coachs (si on remet la section un jour)
│   └── meta.json                      ← title/description par route + OpenGraph
└── en/
    └── (miroir exact, traduit via le master prompt)
```

### 3.5 Composants impactés (mapping FR → i18n)

Tous les composants qui contiennent des strings hardcodées passent à `useTranslations()` :

| Composant | Namespace | Volume strings | Spécificités |
|---|---|---|---|
| `Nav.tsx` | `common.nav` | ~80 | Mega menu desktop + accordion mobile. CTA "POSTULER" → "APPLY NOW". Tester wrap menu items EN |
| `Footer.tsx` | `common.footer` | ~50 | 4 colonnes + footer-socials. "Inscriptions" → "Apply". "Disciplines" → "Disciplines" (universal) |
| `StickyMobileCTA.tsx` | `common.cta` | ~5 | CTA flottant mobile |
| `Hero.tsx` | `home.hero` | ~30 | Titre + subtitle + stats (2 destinations / 3 disciplines / 1-3 weeks) + carousel sessions |
| `AudienceSwitcher.tsx` | `home.audience` | ~16 | 4 cards labels + sub. Lit `data.registration-types.json` |
| `Philosophie.tsx` | `home.philosophie` | ~12 | "POURQUOI LE CAUCASE" → "WHY THE CAUCASUS". 3 cards |
| `DestinationShowcase.tsx` | `home.destinations` | ~10 | Header "DAGHESTAN · TCHÉTCHÉNIE" → "DAGESTAN · CHECHNYA" |
| `Testimonials.tsx` | `home.testimonials` | ~12 | Header section. Quotes via `data.testimonials.json` |
| `FacilitatorBand.tsx` | `home.facilitator` | ~20 | "MKR organise tout" → "MKR handles everything" + 6 prestations |
| `VoyageReveal.tsx` | `home.voyage` | ~15 | 3 steps (vol intérieur, transferts) |
| `Sessions.tsx` | `home.sessions` | ~10 | Header + sub. Lit `data.sessions.json` pour les cards |
| `Timeline.tsx` | `home.timeline` | ~25 | 5 étapes parcours |
| `Contact.tsx` | `home.contact` | ~12 | Bloc info contact + labels |
| `FAQ.tsx` | `home.faq` | ~8 | Header. Lit `data.faq.json` FAQ_HOMEPAGE |
| `CTAFinal.tsx` | `home.cta_final` | ~5 | "Prochain camp · {dates}" → "Next camp · {dates}" |
| `PageHero.tsx` | (props) | – | Reçoit `label`, `title`, `subtitle` traduits par la page parente |
| `SectionCTA.tsx` | (props) | – | Reçoit `primaryLabel`, `ghostLabel` traduits |
| `Breadcrumb.tsx` | (props) | – | Reçoit `items` traduits |
| `BreadcrumbJsonLd.tsx` | (props) | – | Idem |
| `CinematicReveal.tsx` | (props) | – | Reçoit `label`, `title`, `tagline` traduits |
| `PricingTable.tsx` | `common.pricing` | ~25 | Reuse cross-pages. Labels paliers + Family pack |
| `InscriptionLayout.tsx` | `inscription.*` | ~250 | Steps + labels + helpers + erreurs validation + récap + Step 0 cards |
| `ContactForm.tsx` | `contact.form` | ~15 | 4 champs + sujets (general/partenariat/clubs/presse/autre) |
| `GuideForm.tsx` | `guide.form` | ~8 | Email + honeypot + CTA |
| `StoryCard.tsx` | `inscription.story` | ~10 | Texte body bilingual selon locale courante |
| `FAQAccordion.tsx` | (props) | – | Reçoit `items` traduits |
| `FAQTabs.tsx` | `faq.tabs` | ~10 | Labels catégories + intro |
| `GalerieContent.tsx` | `galerie.categories` | ~12 | Filtres catégories + alts photos |
| `DestinationReveal.tsx` | (props) | – | Reçoit copy traduite |
| `VerticalVideoSplit.tsx` | (props via data.antoine-parcours) | – | Reçoit 3 variants déjà traduits (mma/temoignages/home) |
| `VideoTestimonialsGrid.tsx` | `temoignages.video` | ~6 | Header + label séparateur |
| `RuslanRevealSlider.tsx` | `a-propos.slider` | ~12 | Labels "AVANT" / "APRÈS" + bio Ruslan |

### 3.6 Switcher de langue

**Placement** :
- **Desktop** : dans `<Nav />` à droite du logo, avant les liens menu. Code ISO court (`FR` / `EN`) sans drapeau (les drapeaux confondent langue/pays — un utilisateur belge ne veut pas voir 🇫🇷).
- **Mobile** : en haut du drawer accordion, sous le logo.

**Comportement** :
- Click `EN` sur `/le-camp` → navigue vers `/en/the-camp` (via `useRouter` next-intl).
- Maintient le scroll position (next-intl gère).
- Cookie `NEXT_LOCALE=en` posé pour 1 an (max-age 31536000, httpOnly false car lu côté client).
- État actif visible (la locale courante est soulignée + non-cliquable).

**Accessibilité (WAI)** :
- `<a hreflang="en" lang="en" aria-current="page">English</a>` (label dans la langue cible).
- Le lien de la locale active est non-cliquable et a `aria-current="page"`.

**Composant cible** : nouveau `src/components/LocaleSwitcher.tsx` (~80 lignes).

## 4. Back-end (Supabase, admin, API, Slack, emails, PDF)

### 4.1 Migrations Supabase (additives, non destructives)

**Table `candidatures`** :

```sql
ALTER TABLE candidatures
  ADD COLUMN submission_language text NOT NULL DEFAULT 'fr'
  CHECK (submission_language IN ('fr','en'));

CREATE INDEX idx_candidatures_submission_language
  ON candidatures(submission_language)
  WHERE submission_language = 'en';
```

**Table `guide_leads`** :

```sql
ALTER TABLE guide_leads
  ADD COLUMN submission_language text NOT NULL DEFAULT 'fr'
  CHECK (submission_language IN ('fr','en'));
```

**Pourquoi cette stratégie** :
- Aucune migration de données existantes (DEFAULT 'fr' couvre les anciennes lignes).
- Ruslan continue de lire les mêmes valeurs FR normalisées (`niveau: avance`, `tunnel_type: session`, `camp_discipline: lutte`, etc.).
- Filtre admin "Show EN candidates only" trivial via l'index partiel.
- Tracking analytics conversion FR vs EN possible immédiatement.

### 4.2 API routes (FR pivot)

Les API restent en FR pivot (valeurs enum stockées en FR). Le client EN envoie déjà du FR pivot dans le payload — le mapping front-end FR↔EN est invisible côté serveur.

**`POST /api/inscription`** :
1. Valide le payload (mêmes règles, mêmes enum values FR).
2. Lit `submission_language` du body (envoyé par le client `'fr'` ou `'en'`).
3. Insère la candidature avec `submission_language` en colonne dédiée.
4. Slack webhook : message **toujours en FR** (Ruslan).
5. Email transactionnel V2 : choisit le template selon `submission_language`.

**`POST /api/guide-caucase`** :
- Idem. La colonne `submission_language` détermine quel PDF servir : `public/guide-caucase.pdf` (FR) ou `public/caucasus-guide.pdf` (EN).

### 4.3 Admin dashboard (`/admin/*`)

- **Reste 100% FR**. Middleware bloque `/en/admin/*` (redirect vers `/admin/*` + cookie `force-fr-admin` posé pour la session).
- **Ajouts UI mineurs** :
  - Badge inline `🇬🇧 EN` à côté du badge tunnel pour les candidatures `submission_language='en'`.
  - Filtre dropdown "Langue de soumission" (Toutes / FR / EN) dans la liste.
  - Compteur dans le header (`X candidatures EN / Y total`).
- **Aucun changement structurel** côté admin. Ruslan voit les mêmes labels FR.

### 4.4 Slack webhook

- Reste 100% FR.
- Si `submission_language='en'` : ajout d'une ligne discrète en début de message :
  ```
  🇬🇧 Candidature en anglais
  Tunnel : Session · Camp : Lutte
  Prénom Nom · email@example.com · ...
  ```

### 4.5 Emails transactionnels (backlog V2 Resend)

Quand Resend sera branché, on prépare 2 templates par event :

```
src/emails/
├── candidature-recue.fr.tsx
├── candidature-recue.en.tsx
├── candidature-validee.fr.tsx
├── candidature-validee.en.tsx
├── candidature-soldee.fr.tsx
├── candidature-soldee.en.tsx
├── guide-lead.fr.tsx
├── guide-lead.en.tsx
└── referral-bonus-due.fr.tsx   ← Ruslan uniquement, FR only
```

Fonction utilitaire :
```ts
sendTransactional({
  to: candidate.email,
  template: 'candidature-recue',
  locale: candidature.submission_language,  // 'fr' | 'en'
  data: { ... }
})
```

### 4.6 PDF guide Caucase EN

Pipeline strictement parallèle au FR :

```
docs/guide-caucase/
├── guide.html                  ← source FR existante (~7500 mots)
├── guide.en.html               ← NOUVEAU, traduit via master prompt
├── styles/
│   └── print.css               ← partagé (palette MKR, A4 portrait)
└── build.sh                    ← refondu pour accepter une locale :
                                  ./build.sh fr   → public/guide-caucase.pdf
                                  ./build.sh en   → public/caucasus-guide.pdf
                                  ./build.sh all  → les deux

public/
├── guide-caucase.pdf           ← FR (existant, 20 pages, 2.2 MB)
└── caucasus-guide.pdf          ← EN (nouveau, ~même poids)
```

Les 7 chapter openers (`public/images/guide-caucase/pdf-internal/*.webp`) sont **réutilisés** (visuels neutres, pas de texte). Économie de tokens + cohérence visuelle.

Le `<GuideForm />` EN envoie `submission_language: 'en'`, l'API retourne `downloadUrl: '/caucasus-guide.pdf'`.

### 4.7 JSON-LD multilingue (root layout)

`src/app/[locale]/layout.tsx` génère le `@graph` localisé :

- **`Organization`** : `inLanguage: ['fr', 'en']`, `slogan` traduit selon la locale (`"L'immersion au milieu des champions"` ↔ `"Immersion among champions"`).
- **`SportsActivityLocation` × 2** (Daghestan + Tchétchénie) : `name` reste géographique neutre (translittération anglaise des villes), `description` et `amenityFeature` traduits.
- **`Event` × 4 sessions** : `name`, `description`, `inLanguage`, `eventStatus` traduits. `location` reste un array des 2 `SportsActivityLocation`.
- **`Person #person-ruslan`** : `description`, `jobTitle`, `knowsAbout` traduits.
- **`BreadcrumbList`** : items traduits selon la locale.
- **`FAQPage`** : généré depuis `data.faq.json` localisé.
- **`Article`** (blog posts) : `inLanguage: 'fr'` ou `'en'` + cross-référence `translationOfWork` / `workTranslation` qui pointe vers la version sœur.
- **`DigitalDocument`** (`/guide-caucase` + `/en/caucasus-guide`) : `inLanguage` matche la locale, `url` matche le PDF.

## 5. SEO multilingue (hreflang, sitemap, canonical)

### 5.1 hreflang (la décision SEO la plus critique)

Chaque page rend **3 balises** dans le `<head>` :

```html
<link rel="alternate" hreflang="fr" href="https://mkrcamp.com/le-camp" />
<link rel="alternate" hreflang="en" href="https://mkrcamp.com/en/the-camp" />
<link rel="alternate" hreflang="x-default" href="https://mkrcamp.com/le-camp" />
```

**Règles** :
- `x-default = FR` (signal explicite que le FR est la version canonique par défaut).
- **Bidirectionnel obligatoire** : `/le-camp` pointe vers `/en/the-camp` ET vice-versa. Sans bidirectionnalité, Google ignore tout le bloc hreflang.
- Implémenté via un helper `getAlternateLinks(pathname, locale)` dans `src/lib/i18n-helpers.ts`, appelé dans chaque `generateMetadata()`.

### 5.2 Canonical par page

Chaque locale est canonique sur sa propre URL (jamais cross-locale) :

```html
<!-- /le-camp -->
<link rel="canonical" href="https://mkrcamp.com/le-camp" />

<!-- /en/the-camp -->
<link rel="canonical" href="https://mkrcamp.com/en/the-camp" />
```

### 5.3 Sitemap dédoublé (1 fichier, 56 URLs)

`src/app/sitemap.ts` génère un sitemap XML avec :
- 28 URLs FR (existantes).
- 28 URLs EN (toutes les routes traduites).
- Chaque URL contient ses `<xhtml:link rel="alternate">` (format sitemap hreflang).

Format :

```xml
<url>
  <loc>https://mkrcamp.com/le-camp</loc>
  <lastmod>2026-05-27</lastmod>
  <xhtml:link rel="alternate" hreflang="fr" href="https://mkrcamp.com/le-camp"/>
  <xhtml:link rel="alternate" hreflang="en" href="https://mkrcamp.com/en/the-camp"/>
  <xhtml:link rel="alternate" hreflang="x-default" href="https://mkrcamp.com/le-camp"/>
</url>
<url>
  <loc>https://mkrcamp.com/en/the-camp</loc>
  <lastmod>2026-05-27</lastmod>
  <xhtml:link rel="alternate" hreflang="fr" href="https://mkrcamp.com/le-camp"/>
  <xhtml:link rel="alternate" hreflang="en" href="https://mkrcamp.com/en/the-camp"/>
  <xhtml:link rel="alternate" hreflang="x-default" href="https://mkrcamp.com/le-camp"/>
</url>
```

### 5.4 robots.txt

Pas de duplication, simple :
```
User-agent: *
Allow: /
Allow: /en/
Disallow: /admin/
Disallow: /api/
Sitemap: https://mkrcamp.com/sitemap.xml
```

### 5.5 IndexNow + Search Console

- **IndexNow** : ping automatique sur chaque déploiement Vercel (déjà en place pour FR), étendu pour pinger aussi les 28 URLs `/en/`.
- **Google Search Console** : propriété `mkrcamp.com` unique couvre les 2 sous-paths. Aucun geo-target dans GSC (site mondial). hreflang fait le travail.
- **Bing Webmaster Tools** : même propriété, soumission du nouveau sitemap.
- **Yandex Webmaster** : enrollment de `mkrcamp.com` pour la diaspora russophone qui search en anglais (notamment Telegram-driven traffic depuis l'ex-URSS).

### 5.6 Pas de geo-IP routing

**Décision** : routing basé uniquement sur `Accept-Language`, pas sur l'IP. Raisons :
1. Geo-IP ≠ language (un user US qui parle FR existe).
2. Google pénalise les sites qui forcent du contenu différent selon l'IP.
3. UX dégradée pour les expats / VPN.
4. Compliance RGPD plus simple.

## 6. GEO / AI search multilingue (LLMs.txt, Schema enrichi)

### 6.1 `llms-en.txt` jumeau

```
public/
├── llms.txt          ← existant FR (préservé)
└── llms-en.txt       ← nouveau, miroir EN
```

Le `llms-en.txt` :
- Header EN ("MKR Caucasian Camp — Wrestling and MMA training camp in the Caucasus").
- Sections principales traduites (About, Programs, Sessions, Pricing, Logistics, FAQ).
- URLs EN (`/en/...`).
- Brand voice EN ("at the heart of the Caucasus" plutôt que littéral "au cœur du Caucase").
- Tagline officielle EN : "Immersion among champions".

### 6.2 Schema enrichi pour AI citations

Chaque page critique embarque :
- **`Speakable` schema** sur Hero + FAQ (Google Assistant voice search).
- **`FAQPage`** avec Q/R dans la locale (homepage + /faq).
- **`HowTo`** sur `/comment-ca-marche` et `/en/how-it-works` (les 5 étapes inscription).
- **`Article` blog posts** avec `inLanguage`, `author`, `datePublished`, `datePublished`, `image`, `translationOfWork` cross-référence.
- **`Person Ruslan`** avec `alumniOf INSEP`, `memberOf French Wrestling Federation`, `jobTitle`, `knowsAbout`, `sameAs` Instagram.
- **`Organization.mentions`** array pour les références externes (UFC, INSEP, FFLutte, Akhmat Fight Club, Khabib Nurmagomedov, Khamzat Chimaev) → booste les AI citations.

### 6.3 Brand entity en EN

- `Organization.name` reste **identique en FR et EN** ("MKR Caucasian Camp").
- `Organization.alternateName: ['MKR', 'MKR Camp', 'Mukhtarov Caucasian Camp']`.
- `Organization.sameAs` pointe vers Instagram @mkrcamp, Facebook, YouTube (les profils existants — pas besoin de profils EN séparés).
- `Organization.slogan`: traduit selon la locale.
- `Organization.founder`: Person #person-ruslan (cross-locale).

### 6.4 Optimisation par moteur AI

| Plateforme | Optimisation EN spécifique |
|---|---|
| **ChatGPT Search** | `llms-en.txt` + sitemap EN + Schema riche. Soumettre le domaine via OpenAI Search submission (post-launch). |
| **Perplexity** | Schema `Article` avec `author`, `datePublished`, `inLanguage:en`. Articles blog EN structurés (H1 unique, H2 hiérarchisés, passages 1-3 phrases citables). |
| **Google AI Overviews** | hreflang impeccable + Schema `FAQPage` + `Speakable` + dates fraîches via `dateModified`. |
| **Claude (web search)** | Pages denses (1500+ mots) avec passage-level citability. Le blog joue un rôle clé. |
| **Bing Copilot** | Schema valid + IndexNow ping EN. |
| **Yandex** | Sitemap soumis, robots OK, hreflang. |

### 6.5 Passage-level citability (méthodologie 2026)

Chaque page EN doit avoir des **passages "extractibles"** : paragraphes qui répondent à une question concrète en 1-3 phrases, citables tels quels par une IA.

Exemples :
- FR : "Le camp se déroule en 1 à 3 semaines."
- EN : "The camp runs from 1 to 3 weeks, with two daily training sessions in dedicated wrestling halls in Makhachkala and Kaspiysk, Dagestan."

- FR : "Visa russe inclus."
- EN : "MKR includes the Russian visa application (consular fees, invitation letter, and EU questionnaire support) in every package."

Le master prompt de traduction (section 9) enforce ce critère explicitement.

## 7. UX (switcher, détection, fallbacks, accessibilité)

### 7.1 Détection au premier visit (middleware)

`middleware.ts` (next-intl + logique custom) :

```ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware({
  ...routing,
  localeDetection: true,  // active Accept-Language detection
});

export default function middleware(req) {
  // Bloquer /en/admin/* → redirect /admin/*
  if (req.nextUrl.pathname.startsWith('/en/admin')) {
    const fr = req.nextUrl.clone();
    fr.pathname = req.nextUrl.pathname.replace('/en/admin', '/admin');
    return Response.redirect(fr);
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
```

**Logique de détection** :
1. Cookie `NEXT_LOCALE` présent ? On l'utilise.
2. Sinon `Accept-Language` header.
3. Si la 1ère langue préférée commence par `en` (`en`, `en-US`, `en-GB`...) → redirect `/en/`.
4. Sinon (`fr`, `es`, `pt`, `de`, `ar`, `ru`, `zh`, etc.) → reste sur racine FR.

**Cas edge gérés** :
- **Bots Google/Bing/AI** (`Googlebot`, `Bingbot`, `GPTBot`, `PerplexityBot`, `ClaudeBot`, `YandexBot`) : ne sont **pas redirigés**. On sert la locale demandée par l'URL explicitement. Sinon Google EN indexerait du FR.
- **Crawler sans `Accept-Language`** : sert la locale demandée par l'URL (pas de redirect).
- **Visiteur direct sur `/en/sessions`** : ne redirige jamais (URL explicite gagne sur l'auto-detect).
- **Visiteur sur `/` sans cookie + `Accept-Language: zh-CN`** : reste sur `/` (FR), pas de redirect (le FR est defaultLocale).

### 7.2 Fallback de contenu manquant

Si une clé `messages/en/something.json` est manquante :
- **Dev** : `next-intl` throw une erreur explicite (`Missing translation: home.hero.title in en`). Échec build.
- **Prod** : Fallback silencieux sur la valeur FR + log Sentry/Console (configurable via `getRequestConfig`).

Force la discipline d'avoir 100% de couverture EN avant chaque release. Voir CI/CD section 9.5.

### 7.3 Longueur du texte EN vs FR

Statistique connue : EN est ~15-30% plus court que FR en paragraphes, mais sur les titres marketing et CTAs c'est souvent l'**inverse** (FR très court, EN plus verbeux : "Postuler" → "Apply now").

**Stratégie design** :
- Audit responsive avec Playwright + screenshots à 5 breakpoints (320 / 480 / 768 / 1024 / 1440) sur chaque paire FR/EN.
- Composants à risque identifiés :
  - `<Hero />` (titre 2 lignes max) — risque wrap moche
  - `<Sessions />` cards (titre + prix) — risque overflow
  - `<CTAFinal />` (label centré) — risque centrage cassé
  - `<PricingTable />` (cells étroites) — risque dépassement
  - `<Nav />` (menu items qui peuvent passer à la ligne) — risque header trop haut
  - `<StickyMobileCTA />` (CTA mobile fixe) — risque tronqué
  - `<AudienceSwitcher />` (4 cards labels) — risque hauteur inégale
- Le master prompt impose une **contrainte de longueur** ("EN ne doit pas dépasser FR de plus de 25%"), avec une exception explicite pour les CTAs courts (`< 20 chars`).

### 7.4 Cas du form `/inscription`

- Tous les labels, placeholders, helper texts, erreurs validation = traduits via `messages/{locale}/inscription.json`.
- Les **enum values envoyés au back** restent FR (`niveau: 'avance'`, `tunnel_type: 'session'`, `camp_discipline: 'lutte'`, `payment_method: 'virement'`). Le mapping front-end FR↔EN est invisible côté serveur.
- Les **textes générés dynamiquement** (récap step 5, breakdown tarif famille, messages d'erreur capacité, alertes MMA niveau, etc.) sont interpolés via ICU MessageFormat :
  ```ts
  // messages/en/inscription.json
  {
    "summary": {
      "session_line": "Session {sessionLabel} · {discipline, select, lutte {Wrestling · Dagestan} mma {MMA · Chechnya} combo_quote {Combo (custom quote)} other {}}",
      "duration": "{weeks, plural, =1 {1 week} other {# weeks}}",
      "price_breakdown_family": "Family package ({weeks, plural, =1 {1 week} other {# weeks}}): {price}"
    }
  }
  ```

### 7.5 StoryCard Instagram (`/inscription` succès)

`<StoryCard />` génère une image PNG téléchargeable post-soumission via html2canvas. Doit être bilingue :
- Texte body traduit (`"Tu y es. RDV pour la visio."` ↔ `"You're in. See you on the call."`).
- Hashtags universels (`#MKRCaucasianCamp #DagestanWrestling`), pas de traduction.
- Date format localisé via `Intl.DateTimeFormat` (`17 août 2026` ↔ `August 17, 2026`).
- Le composant accepte une prop `locale` ou lit `useLocale()` directement.

## 8. Glossaire MKR (verrouillé avant traduction)

Stocké dans `src/i18n/glossary.md`. Indispensable pour la cohérence cross-pages. Le master prompt l'embarque inline à chaque appel sub-agent.

### 8.1 Brand & proper nouns (NEVER translate)

| FR | EN |
|---|---|
| MKR Caucasian Camp | MKR Caucasian Camp |
| Ruslan Mukhtarov | Ruslan Mukhtarov |
| Akhmat Fight Club | Akhmat Fight Club |
| INSEP | INSEP (acronyme, expliqué inline si besoin : "INSEP, the French national sport institute") |
| FFL / Fédération Française de Lutte | French Wrestling Federation (FFL) |
| Khabib Nurmagomedov | Khabib Nurmagomedov |
| Khamzat Chimaev | Khamzat Chimaev |
| Antoine Petit-Jean | Antoine Petit-Jean |

### 8.2 Sports terminology (locked translations)

| FR | EN |
|---|---|
| Lutte (sport) | Wrestling |
| Lutte libre | Freestyle wrestling |
| Lutte adultes | Adult wrestling |
| Lutte enfants / Lutte jeunesse | Youth wrestling (8-17) |
| Lutte gréco-romaine | Greco-Roman wrestling |
| MMA | MMA (universal acronym, no expansion) |
| Sambo | Sambo |
| Grappling | Grappling |
| Takedown | Takedown |
| Clinch | Clinch |
| Ground & pound | Ground and pound |
| Soumission | Submission |
| Sparring | Sparring |
| Coach / Entraîneur | Coach (NEVER "trainer") |
| Camp d'entraînement | Training camp |
| Stage | Camp |
| Niveau | Level |
| Compétiteur | Competitor |
| Amateur sérieux | Serious amateur |
| Palmarès | Achievements / Track record (context-dependent) |

### 8.3 Geography (locked)

| FR | EN |
|---|---|
| Caucase | Caucasus |
| Daghestan (FR spelling) | **Dagestan** (drop the H) |
| Tchétchénie | Chechnya |
| Makhachkala | Makhachkala |
| Kaspiysk | Kaspiysk |
| Grozny | Grozny |
| Istanbul | Istanbul |
| Russie | Russia |

### 8.4 Logistics (locked)

| FR | EN |
|---|---|
| Vol intérieur | Domestic flight |
| Vol international | International flight |
| Visa russe | Russian visa |
| Transferts | Airport transfers |
| Hébergement | Accommodation (international standard) |
| Encadrement | Coaching staff / Supervision (context-dependent) |
| 2 repas / jour | 2 meals per day |
| Excursions | Excursions |
| Assurance voyage | Travel insurance |

### 8.5 Brand voice (style guidelines EN)

- **TONE** : confident, direct, slightly aspirational. NOT marketing fluff, NOT sales-pushy.
- **"Tu" (FR informal) → "You"** (EN default — never "thou", never overly formal).
- **No em dashes (—)** — use "," or "." or " · " separator (DKDP global rule).
- **No ampersands (&)** — write "and".
- **Numbers** : keep digits ("15 places", not "fifteen").
- **Currency** : keep EUR (€) — international audience reads euros fine.
- **Dates** : localized via `Intl.DateTimeFormat` ("17 août 2026" → "August 17, 2026" — US format for international clarity).
- **Phone** : keep international format (`+33 6 66 17 76 91`).
- **Register** : international US/UK neutral. Avoid British/American slang.

### 8.6 Slogans & taglines (carefully crafted, locked)

| FR | EN |
|---|---|
| L'immersion au milieu des champions | Immersion among champions |
| Camp d'entraînement MMA et Lutte au cœur du Caucase | MMA and Wrestling training camp at the heart of the Caucasus |
| TROIS DISCIPLINES. DEUX TERRES DU CAUCASE. | THREE DISCIPLINES. TWO LANDS OF THE CAUCASUS. |
| LA DISCIPLINE QUI A FORGÉ LE CAUCASE | THE DISCIPLINE THAT FORGED THE CAUCASUS |
| LA NOUVELLE GENERATION DU CAUCASE | THE NEW GENERATION OF THE CAUCASUS |
| Prochain camp · {dates} | Next camp · {dates} |
| Postuler (CTA primary) | Apply |
| POSTULER (CTA caps) | APPLY NOW |
| Découvrir | Discover |
| En savoir plus | Learn more |
| Demande un devis | Request a quote |
| MKR organise tout | MKR handles everything |
| Tout compris | All inclusive |
| Visa Russie inclus | Russian visa included |
| Vol intérieur inclus | Domestic flight included |
| Pour qui ? | Who is it for? |
| Comment ça marche | How it works |
| Pour les parents | For parents |
| Camp Famille | Family Camp |
| Camp Sur Mesure | Custom Camp |
| Club et Groupe | Clubs and Groups |

### 8.7 Forbidden in EN

- No "—" em dash (use "," or "." or " · ")
- No "&" symbol (write "and")
- No emojis (use SVG icons via the `Icon` component)
- No "thou/thee" archaic forms
- No British slang in headlines (US-international register)
- No translation of "wrestling" as "fight" or "combat"
- No translation of "MMA" as "mixed martial arts" in CTAs / titles (keep acronym)

## 9. Workflow de traduction (Claude-piloté)

### 9.1 Volume estimé

| Surface | Volume FR estimé |
|---|---|
| 26 pages | ~28 000 mots |
| 36 composants | ~6 500 mots |
| 6 data files (sessions, faq, testimonials, registration-types, blog, coaches, antoine-parcours) | ~9 000 mots |
| Form `InscriptionLayout` (944 lignes) | ~1 200 mots |
| 6 articles blog (`ARTICLES_MAP`) | ~12 000 mots |
| PDF guide (`docs/guide-caucase/guide.html`) | ~7 500 mots |
| JSON-LD descriptions | ~2 000 mots |
| Metadata (title/description/OG par route) | ~800 mots |
| **TOTAL FR** | **~67 000 mots** (~90 000 tokens FR ≈ 75 000 tokens EN attendus) |

Budget tokens V1 estimé : **~900 000 tokens** (input + output, prompts + sub-agents + QA + iterations).

### 9.2 Master prompt de traduction

Donné à chaque sub-agent `general-purpose` invoqué pour traduire un fichier. Embarque le glossaire complet (section 8) en inline.

```
# ROLE
You are a senior bilingual translator specialized in martial arts, wrestling, and sports
marketing. You translate from French (source) to English (target) for MKR Caucasian Camp,
a high-end training camp brand in the Caucasus region of Russia (Dagestan + Chechnya).

You produce final, publish-ready translations that:
- Match the source meaning and tone precisely
- Rank in English search (Google, Perplexity, ChatGPT Search, Claude web, Bing Copilot)
- Sound native to English-speaking athletes, coaches, and club organizers
- Respect a strict MKR glossary (provided below)
- Adapt to layout constraints (no overflows in responsive UIs)

# GLOSSARY (locked translations, non-negotiable)
[FULL GLOSSARY FROM SECTION 8 INSERTED VERBATIM]

# CONTEXT
MKR is a French-led brand. The English audience is international:
- North America (US, Canada) — main MMA market
- UK, Ireland — wrestling and BJJ communities
- Middle East (UAE, KSA) — emerging MMA tourism
- Eastern Europe (Poland, Baltic, Balkans) — many speak English as second language
- Russian diaspora (Germany, Israel, US) — bilingual users

Tone: confident, factual, slightly aspirational. NOT salesy, NOT inflated.
Style register: international US/UK neutral. Avoid local slang.

# CRITICAL RULES
1. PRESERVE ALL ICU/template placeholders verbatim: {variable}, {count, plural, ...}, %s
2. PRESERVE ALL JSX/HTML tags verbatim: <strong>, <a href>, <br/>, etc.
3. PRESERVE ALL Markdown formatting: **bold**, _italic_, [links](url), # headings
4. NEVER add explanatory parentheticals unless the source has them
5. NEVER expand acronyms unless source does (MMA stays MMA, INSEP stays INSEP)
6. APPLY THE GLOSSARY STRICTLY (e.g., "Daghestan" → "Dagestan", never with H)
7. NEVER use em dash "—". Use "," or "." or " · "
8. NEVER use "&". Write "and"
9. KEEP brand names exact: "MKR Caucasian Camp", "MKR", "Akhmat Fight Club"
10. KEEP proper nouns exact: "Ruslan Mukhtarov", "Khabib Nurmagomedov", "Khamzat Chimaev"

# LENGTH CONSTRAINT (layout-aware)
The English translation must not exceed the source length by more than 25%, UNLESS:
- The source is a single CTA word (e.g., "Postuler" → "Apply now" — exception OK)
- The source is a title under 20 characters (titles can stretch +35%)

For paragraphs > 50 words: English MUST be equal-or-shorter than source.
For headings > 8 words: English MUST be equal-or-shorter than source.

If you cannot meet this constraint while preserving meaning, output the translation
followed by `[LENGTH_WARNING: ratio=X.XX, key=path.to.key]` so the QA pipeline catches it.

# SEO / GEO CONSIDERATIONS
- Target search intent in English. Examples:
  - "camp d'entraînement MMA Caucase" → "MMA training camp in the Caucasus"
  - "préparer son premier camp" → "Preparing for your first training camp"
  - "lutte daghestanaise" → "Dagestani wrestling"
- For meta titles (under 60 chars): include the primary keyword early.
- For meta descriptions (under 155 chars): include benefit + location + CTA verb.
- For passage-level citability: write clear, self-contained sentences that AI engines
  (ChatGPT, Perplexity, Claude, Google AI Overviews) can extract and cite. Prefer
  active voice. Front-load facts.

# OUTPUT FORMAT
Return ONLY the translated JSON/Markdown/HTML in the exact same structure as input.
Do NOT wrap in code fences. Do NOT add explanations or commentary.
If you encounter ambiguity, default to the most common international English usage
and add a comment `// [TRANSLATION_NOTE: ...]` only if the deviation is critical.

# INPUT
[CONTENT TO TRANSLATE INSERTED HERE]
```

### 9.3 Workflow d'exécution (sub-agents parallèles)

```
Phase 1 — Extraction (Claude main thread, séquentiel)
  ├─ Pour chaque page.tsx : extraire les strings hardcodées vers messages/fr/<page>.json
  ├─ Pour chaque composant : extraire les strings vers messages/fr/common.json ou <component>.json
  ├─ Pour chaque data file : créer messages/fr/data.<file>.json
  ├─ Remplacer les strings dans le code par t('key') (via useTranslations / getTranslations)
  └─ Output : ~35 fichiers JSON FR + refactor du code pour lire les messages

Phase 2 — Traduction (sub-agents en parallèle, batches de 5)
  ├─ Batch 1 : common.json, home.json, le-camp.json, sessions.json, inscription.json
  ├─ Batch 2 : programme*.json, familles.json, sur-mesure.json, clubs-groupes.json
  ├─ Batch 3 : data.faq.json, data.testimonials.json, data.registration-types.json, data.sessions.json
  ├─ Batch 4 : blog/khabib-methode-entrainement.json, blog/pourquoi-le-dagestan-domine-le-mma.json,
  │            blog/preparer-son-premier-camp.json, blog/lutte-daghestanaise-guide-complet.json,
  │            blog/securite-dagestan-2026.json, blog/nutrition-athlete-combat.json
  ├─ Batch 5 : a-propos.json, contact.json, logistique.json, comment-ca-marche.json
  ├─ Batch 6 : preparer-son-camp.json, guide-caucase.json, destinations*.json
  ├─ Batch 7 : meta.json (titles, descriptions, OG), JSON-LD descriptions
  ├─ Batch 8 : cgv.json, mentions-legales.json, politique-de-confidentialite.json
  └─ Batch 9 : PDF guide.html → guide.en.html (prompt variant pour HTML brut)

Chaque sub-agent reçoit:
  - Le master prompt (9.2)
  - 1 fichier FR à traduire
  - Le mandate "return EN JSON only, no commentary"

Phase 3 — QA layout (Claude main thread + Playwright)
  ├─ Lance `npm run dev` localement
  ├─ Visite chaque URL FR + miroir EN, screenshots à 5 breakpoints (320/480/768/1024/1440)
  ├─ Détecte les overflows : text > card, wrap > 2 lignes sur H1, CTA tronqués, menu wrap, etc.
  ├─ Pour chaque issue : régénère la string EN avec contrainte length serrée
  └─ Output : `i18n-qa-report.md` avec screenshots avant/après

Phase 4 — QA SEO/GEO (Claude main thread)
  ├─ Vérifie hreflang bidirectionnel sur les 28 paires de pages
  ├─ Valide JSON-LD via Schema.org validator (chaque locale)
  ├─ Lance Lighthouse mobile slow-4G sur 5 pages clés × 2 locales = 10 runs, médiane 3 par URL
  ├─ Vérifie sitemap XML : 56 URLs, hreflang annotations correctes
  ├─ Test passage-level citability : extract 10 paragraphes au hasard, vérifier self-contained
  └─ Output : `i18n-seo-audit.md`

Phase 5 — Review humaine (David)
  ├─ David reçoit la liste des "decisions à valider" (taglines, headlines, copy hero)
  ├─ David valide ou rectifie via inline comments
  ├─ Claude rectifie + redéploie
  └─ Go/no-go launch

Phase 6 — PDF guide EN (Claude main thread)
  ├─ Traduit docs/guide-caucase/guide.html → guide.en.html (sub-agent dédié, prompt HTML)
  ├─ Lance ./build.sh en → public/caucasus-guide.pdf
  ├─ Vérifie 20 pages A4 portrait, palette MKR cohérente
  └─ Commit le PDF EN dans le repo

Phase 7 — Deploy
  ├─ Vercel preview branch
  ├─ Test manuel sur preview URL (David + Claude)
  ├─ Merge to main → Vercel auto-deploy mkrcamp.com
  ├─ IndexNow ping pour les 28 URLs /en/
  └─ GSC + Bing + Yandex : ré-soumission du sitemap
```

### 9.4 Pipeline future-proof (tout nouveau contenu auto-traduit)

#### 9.4.1 Slash command `/translate-content` (manuel discipliné)

Nouveau fichier `.claude/commands/translate-content.md` :

```
Quand tu ajoutes ou modifies du contenu FR dans messages/fr/*.json, dans une page,
un composant, un data file, ou un article de blog, invoque /translate-content pour
propager les changements en EN.

Le command:
1. Détecte les diffs FR depuis le dernier commit (git diff messages/fr/)
2. Pour chaque clé nouvelle ou modifiée, dispatch un sub-agent avec le master prompt
3. Met à jour messages/en/*.json
4. Lance la QA layout (Playwright headless) sur les pages impactées
5. Stage les changements pour commit
```

#### 9.4.2 CI/CD GitHub Action (filet de sécurité, recommandé)

`.github/workflows/i18n-coverage.yml` :

```yaml
name: i18n coverage check
on: [push, pull_request]
jobs:
  i18n-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - name: Check i18n coverage
        run: node scripts/i18n-check.js --strict
```

Le script `scripts/i18n-check.js` :
- Compare la liste des clés `messages/fr/**/*.json` vs `messages/en/**/*.json`
- Si une clé FR existe et pas en EN : **CI fail** avec message clair :
  ```
  Missing EN translations:
    - home.hero.new_subtitle (added in messages/fr/home.json)
    - sessions.toussaint_2026.cta (added in messages/fr/sessions.json)

  Run `claude /translate-content` to auto-translate before merging.
  ```
- Vérifie aussi que les ICU placeholders sont identiques entre FR et EN.

#### 9.4.3 Hook Git pre-push (option, déconseillée — préférer CI/CD)

`.husky/pre-push` ne bloque pas par défaut (préférable de laisser la CI le faire pour pas frustrer le dev).

### 9.5 Cas spécifiques (gotchas)

| Cas | Stratégie |
|---|---|
| **Blog articles** (HTML inline volumineux) | Sub-agent reçoit le HTML brut + préserve tous les `<h2>`, `<p>`, `<ul>`, `<img>`. Output strictement HTML, jamais Markdown. |
| **Schema JSON-LD `description`** | Traduit ET adapté au search intent EN (mot-clé primaire en début). Respect règle SEO du master prompt. |
| **Témoignages** | Quotes athlètes = voix authentiques. Master prompt instruit "preserve quote tone, do not formalize". |
| **Pricing** | Nombres neutres. Conditions ("forfait Famille", "Solo/Duo", "à partir de") traduites via glossaire. |
| **FAQ** | Questions formulées comme un user EN les taperait dans Google. Search intent prioritaire. |
| **Dates** (`data/sessions.ts`) | `startDate: '2026-08-17'` (ISO, neutre) reste. Le `dates: '17 août - 5 septembre 2026'` formaté est déplacé hors data file vers `messages/{locale}/data.sessions.json`. Single source = ISO. Formatage = i18n layer. |
| **PDF guide EN** | Pipeline séparée. Traduction directe `guide.html` → `guide.en.html`, build via `./build.sh en`. |
| **StoryCard Instagram** | html2canvas rendering. Fonts compatibles (`Anton` marche EN). Aucun changement stack. |
| **Numéros téléphone** | `+33 6 66 17 76 91` reste tel quel. Format international universel. |
| **Email** | `contact@mkrcamp.com` reste tel quel. |
| **Referral codes** (`STRIKE`, `ZEZE74`, `RAKHIM86`) | Pas de traduction. Tag opaque. |
| **GSAP animations** | Aucun impact i18n. Animations basées sur layout, pas sur texte. |
| **Videos** (hero loops, Antoine parcours) | Voix off muette par défaut. Aucun sous-titre requis V1. À envisager V2 (subtitles VTT bilingues). |
| **Photos** (alt attributes) | Traduits via `messages/{locale}/<page>.json` (clé `alt`). Aucune photo localisée nécessaire. |
| **Favicons / icons / PWA manifest** | Pas localisés (universels). |
| **`robots: { index: false }`** sur `/merci` et `/en/thank-you` | Conservé tel quel. Les 2 pages no-index. |

## 10. Périmètre, non-objectifs et risques

### 10.1 Dans le périmètre V1

- 26 pages publiques traduites en EN.
- 36 composants traduits.
- 6 data files (sessions, faq, testimonials, registration-types, antoine-parcours, etc.) avec messages localisés.
- Form `/inscription` bilingue (labels EN, valeurs FR).
- Form `/contact` et `/guide-caucase` bilingues.
- PDF guide EN livré (`public/caucasus-guide.pdf`).
- 6 articles blog traduits.
- JSON-LD multilingue (Organization, Events, Person, FAQPage, Article, DigitalDocument).
- Sitemap 56 URLs.
- hreflang bidirectionnel.
- `llms-en.txt`.
- Middleware Accept-Language + cookie persistant.
- LocaleSwitcher dans `<Nav />`.
- Supabase migration additive (colonne `submission_language`).
- Admin dashboard FR (badge EN visible + filtre).
- Slack webhook FR (avec ligne `🇬🇧` si EN).
- Slash command `/translate-content` pour la maintenance.
- GitHub Action `i18n-coverage`.

### 10.2 Hors périmètre V1 (V2 ou plus tard)

- **Russe (RU)** : pas d'architecture N-langues. Si demande forte post-launch, refactor de la config `routing.ts`.
- **Arabe (AR)** : pas de support RTL.
- **Sous-titres vidéo EN** (Antoine parcours, hero loops) : voix off muette par défaut, aucun sous-titre requis.
- **Resend emails transactionnels** : prévu V2 (templates `.fr.tsx` + `.en.tsx` déjà imaginés mais pas implémentés en V1).
- **Geo-IP routing** : explicitement rejeté.
- **CMS headless** (Sanity, Strapi) pour la gestion du contenu bilingue : pas en V1 (overkill, ferait doubler le scope).
- **TMS SaaS** (Lokalise, Crowdin) : pas en V1 (Claude pilote le workflow).
- **Articles blog éditoriaux EN dédiés** (sujets spécifiques EN, pas traductions) : V2 si performance EN justifie.
- **Profils sociaux EN dédiés** (@mkr_en sur Instagram) : pas nécessaire, `@mkrcamp` reste unique.

### 10.3 Risques identifiés

| Risque | Mitigation |
|---|---|
| **Compat next-intl ↔ Next.js 16.2.2** non garantie (AGENTS.md signale breaking changes) | Phase 1 du plan : lecture `node_modules/next/dist/docs/i18n/`, tester next-intl sur une page isolée AVANT d'étendre |
| **Overflow EN sur composants étroits** (CTA, cards, menu) | Master prompt enforce length constraint + Phase 3 QA layout systématique avec Playwright |
| **Duplicate content cross-lingual** (Google EN qui voit du FR) | hreflang bidirectionnel + canonical par locale + `inLanguage` JSON-LD + middleware ne redirige pas les bots |
| **Slugs EN sous-optimisés SEO** | Slugs choisis pour matcher l'intent search (`/program/wrestling`, `/apply`, `/family`, etc.), pas littéraux |
| **Régression SEO FR** | FR garde URLs racine inchangées, zéro 301. Audit grep + Lighthouse médiane 3 runs avant et après deploy |
| **Form submission EN qui casse les filtres admin** | Valeurs payload restent FR normalisées. Colonne `submission_language` séparée. Admin inchangé structurellement |
| **Coût tokens trop élevé** | Budget ~900k tokens V1 acceptable. Sub-agents en parallèle limitent le wall-time |
| **Translations qui drift dans le temps** (FR évolue, EN reste obsolète) | CI/CD `i18n-coverage` bloque tout PR avec keys manquantes EN. Slash command `/translate-content` pour propagation contrôlée |
| **PDF guide EN qui casse la pipeline WeasyPrint** | Tester `./build.sh en` en local AVANT de committer. Les 7 chapter openers (.webp) sont réutilisés (visuels neutres) |
| **Glossaire qui dérive** (un sub-agent qui traduit "Daghestan" avec H par erreur) | Master prompt embarque le glossaire inline + audit grep post-trad (`grep -i "Daghestan" messages/en/ → must be empty`) |
| **Performance Lighthouse régresse sur les nouvelles routes EN** | Static rendering préservé via next-intl. Lighthouse audit avant/après en Phase 4 |

## 11. Critères d'acceptation (Definition of Done)

V1 considérée terminée si **tous ces critères passent** :

### Front-end
- [ ] 28 URLs FR (existantes) toujours accessibles aux mêmes paths, zéro 301
- [ ] 28 URLs EN accessibles sous `/en/*` avec slugs traduits
- [ ] `<LocaleSwitcher />` fonctionnel dans `<Nav />` desktop + mobile
- [ ] Switch FR ↔ EN sur n'importe quelle page navigue vers la page sœur correcte
- [ ] Cookie `NEXT_LOCALE` posé et lu correctement
- [ ] Middleware redirige `Accept-Language: en` vers `/en/` au premier visit
- [ ] Middleware ne redirige PAS les bots (Googlebot, GPTBot, etc.)
- [ ] Aucune string FR visible sur les pages EN (audit grep `messages/en/`)
- [ ] Form `/inscription` complet en EN (5 steps, 26+ champs, validations, récap, StoryCard)
- [ ] Form `/contact` et `/guide-caucase` complets en EN

### SEO
- [ ] hreflang bidirectionnel présent sur les 56 pages (FR + EN)
- [ ] `x-default = FR` partout
- [ ] Canonical par locale sur chaque page
- [ ] Sitemap XML contient 56 URLs avec `<xhtml:link>` hreflang
- [ ] JSON-LD validé sur Schema.org validator pour les 2 locales
- [ ] `inLanguage` correct sur Organization, Events, Person, Article, FAQPage, DigitalDocument
- [ ] Articles blog : `translationOfWork` cross-référence FR↔EN
- [ ] llms-en.txt servi à `/llms-en.txt`
- [ ] robots.txt mis à jour
- [ ] IndexNow ping les 28 URLs EN au deploy

### GEO / AI search
- [ ] Schema `Speakable` sur Hero + FAQ (FR + EN)
- [ ] Schema `HowTo` sur `/comment-ca-marche` + `/en/how-it-works`
- [ ] Schema `FAQPage` sur homepage + `/faq` (FR + EN)
- [ ] Passages "extractibles" présents (manual audit sur 10 paragraphes au hasard)
- [ ] Yandex Webmaster enrolled (sitemap soumis)

### Backend
- [ ] Migration Supabase `add_submission_language_column` appliquée
- [ ] Form `/inscription` EN insère ligne avec `submission_language='en'`
- [ ] Form `/guide-caucase` EN insère ligne avec `submission_language='en'`
- [ ] Admin badge `🇬🇧 EN` visible sur lignes EN
- [ ] Admin filtre dropdown "Langue de soumission" fonctionnel
- [ ] Slack webhook prepend `🇬🇧` si EN
- [ ] PDF EN `public/caucasus-guide.pdf` servi correctement (20 pages, ~2 MB)
- [ ] `/admin/*` reste FR, `/en/admin/*` redirige vers `/admin/*`

### Qualité
- [ ] Lighthouse mobile slow-4G médiane 3 runs ≥ 80 sur 5 pages clés × 2 locales = 10 runs
- [ ] LCP < 4.5s sur toutes les pages
- [ ] Zéro overflow visible sur les 5 breakpoints (320/480/768/1024/1440)
- [ ] CI/CD `i18n-coverage` passe en green
- [ ] Slash command `/translate-content` testé sur un changement fictif
- [ ] `npm run build` passe avec 0 warning i18n

### Documentation
- [ ] `SITEMAP.md` mis à jour (section i18n)
- [ ] `AGENTS.md` mis à jour si next-intl impose des conventions
- [ ] Section i18n ajoutée au `CLAUDE.md` du projet MKR
- [ ] `src/i18n/glossary.md` committé et accessible
- [ ] Memory `project_mkr_i18n_v1` créée dans `DEV SPACE/memory/`

## 12. Workflow d'implémentation (résumé phases)

Plan détaillé à produire par la skill `writing-plans` (étape suivante). Vue d'ensemble :

1. **Phase 1 — Setup + compat check** : installation next-intl, validation compat Next.js 16, structure `src/app/[locale]/`, middleware initial, premier test sur 1 page (homepage).
2. **Phase 2 — Extraction FR** : extraire toutes les strings hardcodées vers `messages/fr/*.json`, refactor du code pour `useTranslations()`.
3. **Phase 3 — Translation (sub-agents parallèles)** : 9 batches de traduction via sub-agents avec master prompt.
4. **Phase 4 — Routing + slugs** : mapping `pathnames` complet, helper `getAlternateLinks()`, generateMetadata refactor pour hreflang.
5. **Phase 5 — JSON-LD multilingue** : refactor `layout.tsx`, génération localisée Organization + Events + Person + Article + FAQPage + DigitalDocument.
6. **Phase 6 — Sitemap + robots + llms-en.txt** : refonte `sitemap.ts`, création `public/llms-en.txt`.
7. **Phase 7 — Supabase migration + API + Slack + admin** : ALTER TABLE, route mises à jour, badge admin, filtre.
8. **Phase 8 — PDF guide EN** : traduction `guide.html` → `guide.en.html`, build script paramétrable, commit PDF EN.
9. **Phase 9 — LocaleSwitcher + UX polish** : composant switcher, états actifs, animation, accessibilité WAI.
10. **Phase 10 — QA layout (Playwright)** : screenshots 5 breakpoints × 56 pages, détection overflows, corrections.
11. **Phase 11 — QA SEO/GEO** : audit hreflang, JSON-LD validator, Lighthouse, sitemap, llms-en.txt validation.
12. **Phase 12 — CI/CD + pipeline future-proof** : GitHub Action `i18n-coverage`, slash command `/translate-content`, doc.
13. **Phase 13 — Review humaine David + iterations** : taglines, headlines, copy hero validés/rectifiés.
14. **Phase 14 — Deploy + propagation** : merge main, Vercel deploy, IndexNow ping EN, GSC/Bing/Yandex submit.
15. **Phase 15 — Monitoring post-launch** : analytics conversion FR vs EN sur 30 jours, ajustements si besoin.

## 13. Références

- Existing SITEMAP.md (cartographie complète du site MKR)
- Existing AGENTS.md (signal breaking changes Next.js 16)
- Existing CLAUDE.md (conventions projet)
- Existing PLAN_GESTION_INSCRIPTIONS.md (logique form + Supabase)
- Glossary file: `src/i18n/glossary.md` (à créer en phase 1)
- next-intl docs: https://next-intl-docs.vercel.app/
- Next.js 16 i18n docs: `node_modules/next/dist/docs/` (à lire AVANT tout code)
- Google hreflang guidelines: https://developers.google.com/search/docs/specialty/international/localized-versions
- Schema.org `inLanguage`: https://schema.org/inLanguage
- llms.txt spec: https://llmstxt.org/

---

*Spec rédigée le 2026-05-27 par Claude (Opus 4.7, 1M context) pour David Khazaei (DKDP) — projet MKR Caucasian Camp.*
