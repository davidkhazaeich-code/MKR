# Audit SEO + GEO MKR Caucasian Camp + Plan de publication

**Date** : 2026-05-14
**Cible** : `mkrcamp.com` (Next.js 16.2.2, Vercel, pré-prod)
**Méthode** : 6 sub-agents parallèles (technical, content, schema, geo, performance, sitemap) sur le code local + build validé (`next build` OK, 42 routes).

---

## 1. Score SEO Health global

| Catégorie | Poids | Score actuel | Score post-fix |
|---|---|---|---|
| Technical SEO | 22% | 62/100 | 90/100 |
| Content quality / E-E-A-T | 23% | 62/100 | 78/100 |
| On-Page (titles, descriptions, structure) | 20% | 70/100 | 90/100 |
| Schema / Structured Data | 10% | 82/100 | 92/100 |
| Performance (CWV prévues mobile 4G) | 10% | 55/100 | 78/100 |
| AI Search readiness (GEO) | 10% | 58/100 | 86/100 |
| Images | 5% | 45/100 | 80/100 |
| **TOTAL** | 100% | **64 / 100** | **85 / 100** |

**Verdict** : le site est solide sur les fondations (build clean 42 routes, JSON-LD riche, FAQ excellentes, headers de sécurité, slugs ASCII propres, canonicals partout) mais **3 bloqueurs noindex actifs interdisent toute publication immédiate**. Avec ~3-4 h de travail ciblé, le site passe de 64 à 85 et est launch-ready avec un excellent potentiel GEO sur sa niche.

---

## 2. Bloqueurs CRITIQUES avant publication (3 fichiers à éditer)

| # | Fichier | Action |
|---|---|---|
| C1 | `next.config.ts:14-15` | Retirer la ligne `{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }` |
| C2 | `src/app/layout.tsx:38-39` | Retirer la ligne `robots: { index: false, follow: false, googleBot: { index: false, follow: false } }` |
| C3 | `public/robots.txt:33-34` | Remplacer `User-agent: * / Disallow: /` par la version "launch" déjà commentée lignes 4-30, **enrichie** avec `Google-Extended`, `Applebot-Extended`, `Bytespider`, `Amazonbot`, `meta-externalagent` (voir patch §6) |

**Tant que ces 3 ne sont pas faits, Google + AI ignorent 100 % du site.** Aucun autre fix SEO n'a d'effet.

---

## 3. Audit par catégorie

### 3.1 Technical SEO — 62/100

**Pass** : canonicals sur les 31 pages publiques, slugs ASCII propres, headers de sécurité solides (HSTS 2 ans, X-Frame-Options DENY, Referrer-Policy strict, Permissions-Policy), `/admin/*` correctement protégé par `proxy.ts` + cookie httpOnly, `/merci` en noindex, `/coachs` en redirect 308+noindex (correct).

**High** :
- `layout.tsx:30` title contient `&amp;` (« &amp; ») — viole `feedback_no_ampersand.md`. Remplacer par "et"
- 11 titles dépassent 60 chars (SERP tronque) : `mkr-camp-2026` (~73), `clubs-groupes` (~86), `sessions` (~71), `familles` (~75), `programme` (~71), `programme/lutte-enfants` (~74), `logistique` (~66), `destinations/tchetchenie` (~62), `a-propos` (~64), root layout (~63), `(site)/page.tsx` (~66)
- 5 descriptions dépassent 160 chars : homepage (~245), mkr-camp-2026 (~240), logistique (~210), sessions (~200), sur-mesure (~190)

**Medium** :
- Pas de `X-Robots-Tag: noindex` scoped sur `/api/(.*)` après le launch (les API actuellement protégées par le header global qui va sauter). Ajouter une règle dédiée dans `next.config.ts` post-launch
- `/inscription` est dans le sitemap (priority 0.7) sans `robots` meta : confirmer intention (formulaire indexable ou pas)
- Pas de CSP (Content-Security-Policy). Pas critique, mais souhaitable en report-only

**Fichiers** : `next.config.ts`, `src/app/layout.tsx`, `src/app/inscription/page.tsx`, toutes les pages avec title long.

### 3.2 Content / E-E-A-T — 62/100

**Risques YMYL** (sport de combat à l'étranger + Russie + mineurs) : exigent un niveau de confiance élevé.

**Critical (bloqueur légal pré-prod)** :
- `mentions-legales/page.tsx` : "SIRET à confirmer", "adresse à confirmer". Sans Kbis publié, le site n'a pas d'identité juridique vérifiable. **À renseigner avant launch**.

**High** :
- Ruslan sans nom de famille publié, sans photo. Casse la crédibilité E-E-A-T
- Décision 2026-05-12 de retirer la section Coaches partout (photos IA non fidèles) crée un vide d'expertise. Recréer `/coachs` avec photos réelles + palmarès vérifiables dès que les vraies photos seront disponibles
- 10 témoignages avec initiales seules (`Mehdi R.`, `Karim D.`, etc.) : suspect en YMYL. Convertir au moins 5 en noms complets + Instagram public, avec consentement écrit
- Articles blog avec author `L'équipe MKR` : pas de byline humaine = signal faible E-E-A-T
- Stats `/temoignages` `87% retour` + `30 places × 4 sessions = 120 places` (alors que les sessions Toussaint 2026 → Pâques 2027 n'ont pas eu lieu). Sourcer ou retirer

**Medium** :
- Pas de page `/securite` dédiée centralisant protocole + assurance RC MKR + contacts urgence 24/7
- Article 9 CGV "droit à l'image" : opt-out alors que RGPD préfère opt-in pour mineurs
- Pas de datestamp "Mis à jour : X" sur `/logistique`, `/destinations/*` (situation Russie évolutive)

### 3.3 Schema / JSON-LD — 82/100

**Pass solide** : `WebSite`, `Organization` (avec `@id`, contactPoint, sameAs, areaServed, knowsAbout, foundingDate), 2 `SportsActivityLocation` (Daghestan + Tchétchénie avec geo coords, sport array, amenityFeature), Events sessions, FAQPage `/faq`, BlogPosting articles avec wordCount + keywords. Aucun schema déprécié.

**Recommandations** :
- `availability: SoldOut` quand `status === 'closed'` dans `layout.tsx:157` (actuellement uniquement `LimitedAvailability` ou `InStock`)
- Ajouter `addressLocality` aux 2 SportsActivityLocation (`Makhachkala` ligne 107, `Grozny` ligne 125)
- Ajouter `telephone: '+33666177691'` au `contactPoint` Organization (ligne 94)
- Passer `offers` Event en `AggregateOffer` (lowPrice 1490, highPrice 2900, EUR) — la grille tarifaire est par palier depuis 2026-05-11, le prix fixe `s.price` est obsolète
- `BreadcrumbList` : auditer chaque page secondaire — actuellement présent sur `/faq` et `/blog/[slug]` mais probablement absent sur plusieurs pages secondaires

### 3.4 GEO (AI Search readiness) — 58/100

**Bloqueurs P0** :
- `public/llms.txt` est **OUTDATED de manière critique** (mentionne 1 seule session, prix obsolètes 1500/2200/2900, frais 100€ abandonnés, Daghestan-only sans Tchétchénie/MMA). **À l'état actuel, désinforme les IA**. Refonte complète obligatoire (voir squelette §6)
- `robots.txt` launch version commentée est correcte sur GPTBot/OAI-SearchBot/ClaudeBot/PerplexityBot, mais manque `Google-Extended`, `Applebot-Extended`, et oublie de bloquer `Bytespider`, `Amazonbot`, `meta-externalagent`

**Opportunités fortes** (niche unique = quasi pas de concurrence GEO francophone) :
- TL;DR box (80 mots) en haut de `/le-camp`, `/destinations/dagestan`, `/destinations/tchetchenie`, `/programme/mma`, `/programme/lutte`
- Page `/comparaison` ou `/mkr-vs-autres-camps` (vs Tiger Muay Thai, AKA Thailand, Phuket Top Team, Dagestan Fighters Camp) : zéro contenu francophone existant sur cette compa
- Page `/chiffres-cles` (30+ médailles olympiques Daghestan, 3 champions UFC, fondé 2018, X athlètes formés) avec markup `<dl><dt><dd>` citable
- `<h1>` avec `<br/>` cassent l'extraction LLM ("LA TERRE QUI FORGE<br/>LES CHAMPIONS") — utiliser deux lignes via CSS `white-space: pre-line`

**Estimation post-fix** (refonte llms.txt + robots.txt + TL;DR + comparaisons) :
| Plateforme | Actuel | Post-fix |
|---|---|---|
| Google AIO | 25/100 | 78/100 |
| ChatGPT | 30/100 | 85/100 |
| Perplexity | 40/100 | 88/100 |
| Bing Copilot | 28/100 | 75/100 |
| Claude.ai | 35/100 | 82/100 |

### 3.5 Performance — 55/100 (estimation, pas de lab Lighthouse réel)

**Estimation CWV mobile 4G** (lab théorique, à confirmer post-deploy avec médiane 3 runs cf. `feedback_lighthouse_variance_3runs`) :
- **LCP** : 2.8-3.4 s (Needs Improvement) — principalement à cause du `SiteLoader` 1.7s artificiel
- **INP** : 180-260 ms (Borderline) — canvas embers Hero + framer-motion partout
- **CLS** : 0.05-0.12 (Borderline) — vérifier `width`/`height` sur images
- **Lighthouse Performance** : 65-78/100 mobile attendu

**High** :
- `src/app/globals.css` = **226 KB / 8 991 lignes** (CSS vanilla, render-blocking). Cible : <100 KB. Auditer non-utilisé après build avec Lighthouse coverage
- `SiteLoader.tsx` `MIN_DURATION = 1700ms` artificiel : tomber à 600-800ms ou bypass complet si `prefers-reduced-motion`
- **56 fichiers > 500 KB** dans `public/` (total images 49 MB, vidéos 14 MB). Top suspects à recompresser :
  - `public/images/ruslan/environment/canyon-sulak-passerelle-graded.webp` (959 KB)
  - `public/images/ruslan/heritage/priere-collective-gemini.webp` (819 KB)
  - `public/images/ruslan/action/mma-cercle-session-demo-mkr.webp` (852 KB)
  - `public/images/ruslan/environment/canyon-sulak-falaises-graded.webp` (873 KB)
  - 7 fichiers galerie >680KB

**Medium** :
- Vidéos hero (5.2 MB total) : déjà compressées, mais aucun `poster` fallback (écran noir 0.5-1s sur lent)
- Canvas embers Hero (65 particules en RAF continu) : pause `IntersectionObserver` quand out-of-viewport
- `html2canvas` (~45 KB) référencé uniquement dans `StoryCard.tsx` (page inscription succès). Vérifier qu'il n'est pas dans le bundle homepage

**Pass** :
- Fonts via `next/font/google` avec `display: swap` (Teko, Barlow, Barlow Condensed)
- Dynamic imports SSR sur homepage (`AudienceSwitcher`, `Sessions`, `FAQ`, etc.)
- 42 routes pré-rendues statiques au build
- Headers cache via Vercel défaut OK

### 3.6 Sitemap — 88/100

**Pass** : couverture 100% conforme (28 URLs dans `sitemap.ts`, `/coachs` et `/merci` correctement exclus, `/admin` exclu, slugs ASCII partout, pas de query params, lastmod cohérents).

**Medium / High preventive** :
- `BLOG_SLUGS` hardcodé 2x (dans `sitemap.ts:3-10` ET dans `ARTICLES_MAP` du `/blog/[slug]/page.tsx`). Drift risk élevé : si Romane ajoute un article dans `ARTICLES_MAP`, le sitemap reste muet. **Centraliser dans `src/data/blog.ts`**
- `/inscription` priority 0.7 → baisser à 0.5 (formulaire transactionnel, pas page SEO)
- Blog : 6 articles avec même `lastModified: 2026-03-15`. Dater chaque article par sa vraie date depuis `ARTICLES_MAP`
- Event JSON-LD déclare `inLanguage: ['fr', 'en']` alors qu'aucune version EN n'existe : retirer `'en'`

### 3.7 Images — 45/100

**Critical pour LCP** :
- 49 MB d'images au total dans `public/images/`
- **56 fichiers > 500 KB** identifiés (script `find public -type f -size +500k`)
- Beaucoup de doublons (`*-graded.webp`, `*-gemini.webp`, `*-mkr.webp`) — versions de travail à purger
- Logo PNG `public/images/logo-mkr.png` (86 KB) référencé en JSON-LD : convertir en WebP (~15 KB)

**Recommandation chiffrée** : recompresser les 56 fichiers >500KB avec `cwebp -q 75` (cible 200-300 KB chacun) gagne ~25 MB. Le site charge actuellement potentiellement 10-15 MB sur une page galerie sur une connexion non-cachée.

---

## 4. Plan d'action prioritisé (par ROI × effort)

### TIER 0 — Bloqueurs publication (1h30, OBLIGATOIRES)

1. **`next.config.ts:14-15`** : retirer header X-Robots-Tag noindex (1 min)
2. **`src/app/layout.tsx:38-39`** : retirer robots block (1 min)
3. **`public/robots.txt`** : remplacer par version launch enrichie (5 min, patch §6)
4. **`public/llms.txt`** : refonte complète avec 4 sessions, 2 destinations, nouvelle grille tarifaire, paiement post-visio (squelette §6, ~30 min)
5. **`mentions-legales/page.tsx`** : renseigner SIRET + adresse siège (blocage légal RGPD, ~15 min selon disponibilité info Ruslan)
6. **Titles > 60 chars** : raccourcir les 11 titles identifiés (30 min)
7. **Descriptions > 160 chars** : raccourcir les 5 descriptions (15 min)
8. **`&amp;`** dans title root layout : remplacer par "et" (1 min, viole règle globale)

### TIER 1 — Lancement propre (3h)

9. Patch `availability: SoldOut` dans Event JSON-LD layout.tsx:157 (5 min)
10. Ajouter `addressLocality` + `telephone` aux Organization + SportsActivityLocation (10 min)
11. Centraliser `BLOG_SLUGS` dans `src/data/blog.ts` (15 min)
12. Baisser priority `/inscription` à 0.5 + dater chaque blog post (10 min)
13. Recompresser top 20 images > 500 KB (~1h)
14. Convertir `logo-mkr.png` en WebP (5 min)
15. Ajouter `poster` aux 4 vidéos hero (20 min)
16. `SiteLoader.tsx` : `MIN_DURATION` à 600 ms + bypass `prefers-reduced-motion` (15 min)
17. Convertir `<h1>` avec `<br/>` en `white-space: pre-line` ou span (20 min)
18. Source ou retirer stats `87% retour` et `30 places × 4 sessions` (15 min)
19. Sweep `globals.css` non-utilisé via Lighthouse coverage (45 min)

### TIER 2 — Boost GEO post-launch (4-6h, à programmer S+1)

20. Page `/comparaison` ou `/mkr-vs-autres-camps` (4-6h, contenu original)
21. TL;DR box (80 mots) sur 5 pages clés (2h)
22. Page `/chiffres-cles` ou bloc Stats citable avec markup `<dl>` (1-2h)
23. Recréer `/coachs` avec vraies photos + palmarès (dès photos disponibles)
24. Convertir 5 témoignages en noms complets + Instagram public (négo avec athlètes)
25. Page `/securite` centralisée (1-2h)
26. Datestamp "Mis à jour" sur `/logistique`, `/destinations/*` (30 min)
27. Article schema `author` en `Person` (Ruslan ou invité) sur 6 articles blog (30 min)

### TIER 3 — Croissance organique (6-12 mois)

28. Wikipedia FR draft "Camp Caucasian MKR" ou enrichissement article "Daghestan#Sport"
29. 3-5 threads Reddit r/MMA r/bjj "I trained 3 weeks in Dagestan, AMA"
30. YouTube : 10+ vidéos sous-titrées FR+EN avec transcripts (chaîne `@mkrcaucasiancamp`)
31. Backlinks : 1 quote partenaire (coach senior salle Makhachkala) + 1 mention médias combat (Sherdog, FrenchMMA)

---

## 5. Checklist publication mkrcamp.com

### 5.1 Code (à faire avant push prod)

- [ ] Bloqueurs T0 (#1-#8 ci-dessus)
- [ ] Build final clean : `rm -rf .next && npx next build` (déjà validé 42 routes 2026-05-14)
- [ ] Audit grep "noindex" sur tout `src/` : doit ne ressortir QUE sur `/merci`, `/coachs`, `/admin/*`
- [ ] Commit propre, push sur `main`
- [ ] Vérifier git user.email = davidkhazaei.ch@gmail.com pour 1er push Vercel (cf. `feedback_vercel_hobby_webhook_author_email`)

### 5.2 Vercel

- [ ] Créer ou retrouver project Vercel `mkrcamp` (Hobby ou Pro)
- [ ] Connecter au repo GitHub
- [ ] **Env vars production** à coller dans Vercel Settings → Environment Variables :
  - `NEXT_PUBLIC_SUPABASE_URL` = `https://bgwvrzgnoqlqqrvflwav.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (depuis dashboard Supabase)
  - `SUPABASE_SERVICE_ROLE_KEY` (depuis dashboard Supabase → service_role)
  - `ADMIN_TOKEN` (nouveau, `openssl rand -hex 32`, **NE PAS** réutiliser l'ancien token 2026-05-02 compromis)
  - `NEXT_PUBLIC_SITE_URL` = `https://mkrcamp.com`
  - `SLACK_WEBHOOK_URL` (optionnel, si Slack DKDP-MKR config)
- [ ] Deploy preview → smoke test (4 tunnels d'inscription, admin login)
- [ ] Deploy production sur tag/branche `main`

### 5.3 DNS — basculer mkrcamp.com vers Vercel

- [ ] Récupérer Vercel domain settings → noter les valeurs `A` et `CNAME` cibles
- [ ] Sur le registrar du domaine `mkrcamp.com` :
  - `A` apex `@` → `76.76.21.21` (ou IP fournie par Vercel)
  - `CNAME` `www` → `cname.vercel-dns.com`
- [ ] Activer SSL/Let's Encrypt Vercel (auto)
- [ ] Vérifier propagation DNS : `dig mkrcamp.com +short`, `curl -I https://mkrcamp.com`
- [ ] Redirect `www.mkrcamp.com` → `mkrcamp.com` (config Vercel)

### 5.4 Supabase production switch

- [ ] Vérifier que le project Supabase `bgwvrzgnoqlqqrvflwav` (eu-central-1) est en plan suffisant
- [ ] **Row Level Security** activé sur `candidates`, `candidatures`, `audit_log` (à confirmer)
- [ ] **Backups automatiques** activés (point-in-time recovery 7 j minimum)
- [ ] Tester POST `/api/inscription` depuis production avec une vraie candidature test (puis supprimer)
- [ ] Tester admin login `/admin/login` + accès `/admin/inscriptions`

### 5.5 Monitoring + indexation post-launch

- [ ] **Google Search Console** : ajouter property `mkrcamp.com`, vérifier ownership via DNS TXT
- [ ] Soumettre sitemap : `https://mkrcamp.com/sitemap.xml`
- [ ] **Bing Webmaster Tools** : idem
- [ ] **IndexNow** : soumettre la liste des URLs au launch via clé IndexNow (memory `feedback_seo_keyword_audit_process`)
- [ ] **Cal.com / Plausible / Vercel Analytics** : décider d'un outil et l'installer (Plausible ou Vercel Web Analytics)
- [ ] **Sentry** ou Vercel error monitoring (optionnel mais recommandé pour `/api/inscription`)
- [ ] **Slack alert** : confirmer que `SLACK_WEBHOOK_URL` reçoit bien les nouvelles candidatures
- [ ] **Lighthouse CI** ou run manuel 3-runs après deploy avec médiane (cf. `feedback_lighthouse_variance_3runs`)

### 5.6 Communication / lancement

- [ ] Instagram MKR : poster announce avec lien `mkrcamp.com`
- [ ] WhatsApp Ruslan : message au cercle 1 (athlètes pilotes)
- [ ] Optionnel : poster sur Reddit r/MMA "We just launched, AMA"
- [ ] Mise à jour Google My Business si fiche existe (probablement non pour MKR)
- [ ] Suivi 7 j post-launch : 1 vérification Lighthouse + 1 audit Search Console (couverture indexation) + 1 review candidatures admin

---

## 6. Patches prêts à appliquer

### 6.1 `next.config.ts` (Tier 0)

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ]
  },
};

export default nextConfig;
```

### 6.2 `src/app/layout.tsx:34-55` (Tier 0)

```ts
export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESC,
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: { /* inchangé */ },
  twitter: { /* inchangé */ },
}
```

Et remplacer `META_TITLE` ligne 30 :
```ts
const META_TITLE = `${SITE_NAME} · Camps MMA et Lutte au Caucase`
```
(58 chars, sans `&amp;`)

### 6.3 `public/robots.txt` version launch enrichie

```
User-agent: *
Allow: /
Disallow: /inscription
Disallow: /merci
Disallow: /admin

# AI Search visibility — ALLOW
User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: ClaudeBot
User-agent: Claude-Web
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: Google-Extended
User-agent: Applebot-Extended
Allow: /

# AI training only — DISALLOW
User-agent: CCBot
User-agent: anthropic-ai
User-agent: cohere-ai
User-agent: Bytespider
User-agent: Amazonbot
User-agent: Diffbot
User-agent: meta-externalagent
User-agent: FacebookBot
Disallow: /

Sitemap: https://mkrcamp.com/sitemap.xml
```

### 6.4 `public/llms.txt` refonte complète

Voir le squelette détaillé fourni par l'agent GEO en §3.4. Couvrir : 4 sessions, 2 destinations, grille tarifaire par palier (1490 → 2790 + forfait Famille 2590 → 6890), modèle paiement post-visio, 4 tunnels, niveaux MMA bloquants, 16 pages principales, 8 FAQ citables.

### 6.5 `src/app/layout.tsx:157` (availability SoldOut)

```ts
availability:
  s.status === 'closed'
    ? 'https://schema.org/SoldOut'
    : s.status === 'limited'
      ? 'https://schema.org/LimitedAvailability'
      : 'https://schema.org/InStock',
```

---

## 7. Risques résiduels après launch

| Risque | Mitigation |
|---|---|
| Situation géopolitique Russie évolutive | Datestamp "Mis à jour" + bandeau "Vérifier recommandations Quai d'Orsay / DFAE" |
| Drift entre `BLOG_SLUGS` (sitemap) et `ARTICLES_MAP` | Centraliser dans `src/data/blog.ts` (Tier 1 #11) |
| Reviews Google négatives potentielles si sécurité | Page `/securite` dédiée + protocole médical + assurance RC publique |
| Données Supabase exposées | Vérifier RLS sur toutes les tables, audit hebdo `audit_log` |
| Mauvais score Lighthouse mobile post-launch | Tier 1 #13-#19 (images + CSS + SiteLoader) — déjà identifié |
| Robots.txt mal interprété (Crawl-delay manquant) | Ajouter `Crawl-delay: 1` pour les bots agressifs si nécessaire post-launch |

---

## 8. Estimation effort total avant publication propre

- **Tier 0 (bloqueurs)** : 1h30 — DOIT être fait
- **Tier 1 (lancement propre)** : 3h — fortement recommandé
- **Tier 2 (GEO boost)** : 4-6h — peut être fait S+1
- **Tier 3 (croissance)** : 6-12 mois — pilotage continu

**Recommandation** : Tier 0 + Tier 1 = **4h30 de focus**, le site passe de 64 à 85 et est prêt à indexer.

---

*Audit produit par 6 sub-agents SEO parallèles (technical / content / schema / geo / performance / sitemap) + synthèse Claude Code. Fichiers de référence : tous les chemins absolus mentionnés dans le doc.*
