# SITEMAP MKR Caucasian Camp — Cartographie complète

> **Fichier de référence pour Claude Code.** Mise à jour : 2026-04-30 (post-Sprint 2 facilitateur).
> Lis ce fichier en priorité avant toute intervention sur le site MKR. Il évite de re-explorer.

## 🆕 Changements 2026-04-30 (post-pivot facilitateur)

- **3 tunnels d'inscription** : `/inscription?type=session|custom|groupe` (hybride)
- **Nouvelle page** : `/familles` (camp parent + enfant)
- **Nouveaux data files** : `data/pricing.ts` (grille fixe), `data/registration-types.ts` (3 types)
- **Nouveaux composants** : `<AudienceSwitcher />`, `<PricingTable />`
- **Photos kids Ruslan** intégrées dans `public/images/ruslan/kids/` (4 fichiers WebP)
- **InscriptionLayout** refactor : Step 0 sélecteur + Step 3 adaptatif (date verrouillée / picker custom / champs groupe)
- **Footer** : col "Disciplines" → "Programmes" enrichie + nouvelle col "Inscriptions"
- **Mega menu Le Camp** : refonte autour des 3 inscriptions
- **Menu mobile** : nouvel accordion "S'inscrire"

---

## 0 — Architecture rapide

```
mkrcaucasiancamp.com/
├── src/app/
│   ├── layout.tsx               → root layout (JSON-LD Organization + SportsActivityLocation)
│   ├── inscription/page.tsx     → page /inscription (HORS group `(site)`)
│   ├── sitemap.ts               → sitemap.xml (28 URLs)
│   ├── robots.ts                → robots.txt
│   └── (site)/                  → group route avec layout commun
│       ├── layout.tsx           → wrap Nav + Footer + StickyMobileCTA
│       ├── page.tsx             → /  (homepage, sections dynamic-imported)
│       └── [25 dossiers/page.tsx] → toutes les autres URLs
├── src/components/  (36 fichiers .tsx)
├── src/data/        (6 fichiers .ts — single sources of truth)
├── src/hooks/       (1 fichier — useScrollReveal)
└── public/images/   (action/ blog/ coaches/ environment/ galerie/ galerie-real/ heritage/ hero/ ruslan/ social/ testimonials/ textures/)
```

**Stack** : Next.js 16.2.2 (Turbopack) · App Router · TypeScript · framer-motion · CSS vanilla (`globals.css`)
**Note** : `AGENTS.md` à la racine indique des breaking changes Next.js. Lire `node_modules/next/dist/docs/` si doute API.

---

## 1 — Inventaire des 26 pages

### 🏠 `/` — Homepage
**Fichier** : `src/app/(site)/page.tsx`
**Rôle** : Landing principal — sequence sections dynamic-imported
**Sections (ordre)** :
1. `<Hero />` — vidéos en boucle + carousel sessions inline
2. `<VideoSection />` — titre "1 À 3 SEMAINES QUI CHANGENT TOUT" + 4 stats (2x sessions, 9 coachs, 15 max, 0 distraction)
3. `<Philosophie />` — bento "POURQUOI LE CAUCASE" (3 cards)
4. `<DestinationShowcase />` — grid 4 paysages (Canyon Sulak, Lac Kezenoy, Route, Gamsutl)
5. `<Testimonials />` — carousel TÉMOIGNAGES (data/testimonials.ts)
6. `<Sessions />` — cards depuis `data/sessions.ts` (1 seule actuellement)
7. `<Timeline />` — 5 étapes parcours (Postuler → Validation → Préparation → Voyage → Immersion)
8. `<Coaches />` — 4 cards depuis `data/coaches.ts`
9. `<VoyageReveal />` — section transition
10. `<Contact />` — bloc info contact (téléphone, email, instagram)
11. `<FAQ />` — top 6 questions (data/faq.ts FAQ_HOMEPAGE)
12. `<CTAFinal />` — "Prochain camp · 17 août - 5 septembre 2026 · Daghestan" + montagne SVG
**Métadonnées** : title, description, canonical
**Pour modifier le copy hero** : `components/Hero.tsx` lignes 160-188

---

### 🏕️ `/le-camp` — Le Camp
**Fichier** : `src/app/(site)/le-camp/page.tsx`
**Tableaux locaux** :
- `INCLUDES` (l.14) : 6 items {icon, title, desc} — Transport, Hébergement, 2 sessions/jour, Coachs, Excursions, **2 repas/jour**
- `NOT_INCLUDED` (l.72) : 4 items string — Vol intl, Visa, Assurance, Équipement
- `DAILY_SCHEDULE` (l.79) : 8 slots {time, activity, desc} — 7h30 → 22h00. **Lutte 10h30/17h30 + MMA 11h00/18h00**
**Sections** :
1. `<PageHero>` "1 A 3 SEMAINES QUI CHANGENT" + breadcrumb JSON-LD
2. `<CinematicReveal>` "LE CAUCASE SUR LE TAPIS"
3. Philosophie "POURQUOI LE CAUCASE" (split + 3 cards)
4. **CE QUI EST INCLUS** (`include-grid` × INCLUDES)
5. **CE QUI N'EST PAS INCLUS** (`exclude-section` × NOT_INCLUDED)
6. **UNE JOURNÉE TYPE** (`daily-timeline` × DAILY_SCHEDULE)
7. LES SALLES (grid-2 × 4 photos)
8. `<SectionCTA>` primary `/sessions` ghost `/programme`

---

### 📋 `/programme` — Programme overview
**Fichier** : `src/app/(site)/programme/page.tsx`
**Sections** :
1. `<PageHero>` "TROIS DISCIPLINES. UN OBJECTIF : PROGRESSER."
2. Stats band (2 sessions/jour · 6 jours/semaine · **3 disciplines**)
3. Card MMA → `/programme/mma`
4. Card LUTTE ADULTES → `/programme/lutte`
5. Card LUTTE ENFANTS → `/programme/lutte-enfants`
6. STRENGTH & CONDITIONING (split)
7. POUR QUI ? (3 niveaux : Pro, Inter, Amateur sérieux)
8. `<SectionCTA>` primary `/sessions` ghost `/coachs`

---

### 🥊 `/programme/mma` — Programme MMA
**Fichier** : `src/app/(site)/programme/mma/page.tsx`
**Tableaux** :
- `TECHNIQUES` (l.13) : 6 items — Stand-up, Clinch, Takedowns, Ground & Pound, Soumissions, Transitions
- `SESSION_FLOW` (l.22) : 5 étapes (15min échauffement → 10min debrief)
**Sections** : PageHero · Description split · CinematicReveal · Techniques grid-3x2 · Session timeline · SectionCTA `/sessions` + `/programme/lutte`

---

### 🤼 `/programme/lutte` — Programme Lutte (adultes)
**Fichier** : `src/app/(site)/programme/lutte/page.tsx`
**Tableaux** :
- `TECHNIQUES` (l.13) : 6 items — Lutte libre, Leg rides, Chain wrestling, Funk rolls, Mat returns, Defense de takedown (PAS de gréco-romaine)
- `SESSION_FLOW` (l.22) : 5 étapes
**Sections** : PageHero "LA DISCIPLINE QUI A FORGÉ LE CAUCASE" · Description "LUTTE AU DAGESTAN" · CinematicReveal "L'ART DU TAKEDOWN" · TECHNIQUES · SESSION_FLOW · SectionCTA `/sessions` + `/programme/mma`

---

### 👨‍👧 `/familles` — Camp Famille (parent + enfant 8-17)
**Fichier** : `src/app/(site)/familles/page.tsx`
**Tableaux locaux** :
- `PILLARS` (l.~17) : 6 piliers — Parent obligatoire · Programme adapté · Coach jeunesse · Hébergement famille · Communication · Tarifs publics
- `FAMILY_TESTIMONIALS` (l.~38) : 3 quotes (Karim D · Sophie L · Marc T)
**Sections** : PageHero "VIENS T'ENTRAÎNER EN FAMILLE" · CinematicReveal `priere-collective-mkr.webp` "L'HÉRITAGE SE TRANSMET" · Description split (kids-alignes + Antoine portrait) · PILLARS grid-3x2 · Section sécurité split (kids-course-flou-1) · `<PricingTable />` complet · 3 témoignages parents · 3-step process inscription · SectionCTA `/inscription?type=session`
**Métadonnées** : title canonical /familles · description 8-17 ans avec parent
**Important** : utilise `<PricingTable withHeader={true} />` (réutilisable)

### 👧 `/programme/lutte-enfants` — Lutte enfants (NOUVELLE)
**Fichier** : `src/app/(site)/programme/lutte-enfants/page.tsx`
**Tableaux** :
- `PILLARS` (l.14) : 6 items — Pédagogie progressive, Encadrement spécialisé, Héritage daghestanais, Esprit du tapis, Groupes de niveau, Cadre sécurisant
- `SESSION_FLOW` (l.23) : 5 étapes (15min échauffement ludique → 10min retour calme)
**Sections** : PageHero "LA NOUVELLE GENERATION DU CAUCASE" · Description split · CinematicReveal "LE GESTE JUSTE, AVANT TOUT" · PILLARS · SESSION_FLOW + note horaires (10h30/17h30 séparés du MMA) · SectionCTA `/sessions` + `/contact`

---

### 👥 `/coachs` — Nos coachs
**Fichier** : `src/app/(site)/coachs/page.tsx`
**Tableaux locaux** :
- `COACHES` (l.13) : 4 items {name, role, experience, bio, palmares} — **différent de `data/coaches.ts`** (cette page a son propre tableau hardcodé !)
  1. Magomed Magomedov · Coach Lutte libre · 18 ans
  2. Khasan Akhmedov · Coach MMA · 14 ans
  3. Akhmed Bashaev · Coach Boxe · 20 ans (background, pas discipline proposée)
  4. Shamil Khalilov · Coach Sambo · 16 ans (background, pas discipline proposée)
**Sections** : PageHero · Grille `coachs-grid-extended` × COACHES · CinematicReveal "LA LUTTE DANS LE SANG" · LA MÉTHODE DAGHESTANAISE (split + pull-quote) · SectionCTA `/sessions` + `/programme`

---

### 📅 `/sessions` — Sessions et tarifs
**Fichier** : `src/app/(site)/sessions/page.tsx`
**Tableaux locaux (HARDCODÉS, indépendants de data/sessions.ts)** :
- `SESSIONS` (l.14) : **1 entrée** "CAMP DAGHESTANAIS" 17 AOÛT - 5 SEPTEMBRE 2026, 2900 CHF, 15 max, intensité Maximale
- `INCLUDES` (l.56) : 6 items — Transport, Hébergement, 2 sessions/jour, Coachs locaux, **Excursions (en option)**, **2 repas/jour**
**Sections** : PageHero "UNE SEULE SESSION. PRENDS TA PLACE." · Sessions grid · CinematicReveal · CE QUI EST INCLUS · TU VIENS AVEC TON CLUB ? (WhatsApp +33 6 66 17 76 91) · MODALITÉS PAIEMENT (table refund) · Reassurance band
**Important** : Si on change la session, il faut modifier **2 endroits** : `data/sessions.ts` ET ce fichier (SESSIONS hardcoded).

---

### 🌍 `/destinations` — Hub destinations
**Fichier** : `src/app/(site)/destinations/page.tsx`
**Sections** : PageHero "LE DAGHESTAN T'ATTEND" · Single card Daghestan (full-width) → `/destinations/dagestan`

---

### 🏔️ `/destinations/dagestan` — Détail Daghestan
**Fichier** : `src/app/(site)/destinations/dagestan/page.tsx`
**Tableaux locaux** :
- Stats (50 300 km², 3.1M hab., 1000m altitude, 30+ olympiques, 3 UFC)
- Excursions grid-3 : Canyon Sulak, Dune Sarykum, Village Gamsutl
**Sections** : PageHero · DestinationReveal · Présentation split · Sécurité · Salles d'entraînement · Excursions · SectionCTA `/sessions` + `/programme`

---

### 🛫 `/comment-ca-marche` — Process inscription
**Fichier** : `src/app/(site)/comment-ca-marche/page.tsx`
**Tableaux** :
- `STEPS` (l.~14) : 6 étapes — 1.Inscription 5min · 2.Appel 48h · 3.Acompte 30% · 4.Guide · 5.Départ · 6.Camp **1 à 3 semaines**
- `PROCESS_FAQ` (l.53) : 4 Q/R sur le processus
**Sections** : PageHero · CinematicReveal · Process flow (6 divs alternés) · Politique annulation (>60j 100%, 30-60j 50%, <30j 0%) · Moyens paiement grid-3 (Virement/Stripe/PayPal) · `<FAQAccordion>` · SectionCTA

---

### 💪 `/preparer-son-camp` — Préparation
**Fichier** : `src/app/(site)/preparer-son-camp/page.tsx`
**Tableaux** :
- `WEEKS` (l.14) : 6 semaines (Cardio, Force, Mobilité, Endurance spécifique, Intensité, Affûtage)
- `EQUIPMENT` (l.23) : 2 catégories — Vêtements/Protection (7 items, **plus de Kimono**) + Hygiène/Admin (5 items, **plus de Trousse/Crème/Adaptateur**)
**Sections** : PageHero · CinematicReveal · NIVEAU MINIMUM (split + checklist 6) · PRÉPARATION 6 SEMAINES · QUOI EMPORTER (grid-2) · PRÉPARATION MENTALE · SectionCTA

---

### ✈️ `/logistique` — Visa, vols, budget
**Fichier** : `src/app/(site)/logistique/page.tsx`
**Tableaux inline** :
- Budget total : 5 lignes (Package 2750-3200 CHF, Vol 400-700€, Visa 60-100€, Assurance 80-150€, Équipement 100-200€)
- 4 visa steps (l.73) : Passeport 6 mois · **Visa Russie obligatoire (questionnaire UE inclus)** · Lettre invitation MKR · Documents
- 3 villes vols (l.100) : Paris CDG, Genève/Zurich, Bruxelles → tous via **Istanbul → Makhachkala (vol intérieur inclus)**
- Infos pratiques grid-3x2 : Décalage, Monnaie, Internet, Climat, **Langue (Avar Daghestan)**, Alimentation
**Sections** : PageHero · BUDGET · FORMALITÉS VISA · COMMENT S'Y RENDRE · ASSURANCE OBLIGATOIRE · TRANSFERTS (1h30 Makhachkala → camp) · INFOS PRATIQUES · SectionCTA `/faq` + `/guide-dagestan`

---

### 💬 `/temoignages` — Témoignages
**Fichier** : `src/app/(site)/temoignages/page.tsx`
**Tableaux locaux** :
- `VIDEO_TESTIMONIALS` (l.14) : 4 thumbs vidéo
- `TESTIMONIALS` (l.~21) : 9 athlètes (différent de `data/testimonials.ts` qui en a 10) — Mehdi R., Karim D., Thomas B., Yassine K., Romain V., Adam S., Lucas M., Amine B., Pierre L.
- Stats band (l.135) : **8 athlètes haut niveau · 9 coachs expérimentés · 87% taux de retour**
**Sections** : PageHero · Vidéos grid-2 · CinematicReveal · Témoignages écrits grid-3 · Stats · SectionCTA

---

### 🖼️ `/galerie` — Photos
**Fichier** : `src/app/(site)/galerie/page.tsx`
**Sections** : PageHero compact · `<GalerieContent />` (composant) · SectionCTA primary `/sessions`
**Composant** : `components/GalerieContent.tsx` contient le tableau d'images avec catégories (Entrainement, Coachs, Culture, Montagnes)

---

### ❓ `/faq` — FAQ complète
**Fichier** : `src/app/(site)/faq/page.tsx`
**Sections** : PageHero · `<FAQTabs />` (lit `FAQ_CATEGORIES` depuis `data/faq.ts` : 4 catégories — Sécurité, Logistique, Entrainement, Inscription)
**JSON-LD** : FAQPage schema généré depuis `getAllFaqItems()`

---

### 📰 `/blog` — Liste articles
**Fichier** : `src/app/(site)/blog/page.tsx`
**Tableaux locaux** :
- `ARTICLES` (l.12) : 6 articles {slug, title, excerpt, date, category, featured?, img}
**Slugs disponibles** : pourquoi-le-dagestan-domine-le-mma · preparer-son-premier-camp · lutte-daghestanaise-guide-complet · securite-dagestan-2026 · nutrition-athlete-combat · khabib-methode-entrainement
**Sections** : PageHero · Featured article · Grid 5 articles

---

### 📰 `/blog/[slug]` — Article individuel
**Fichier** : `src/app/(site)/blog/[slug]/page.tsx`
**Tableaux** :
- `ARTICLES_MAP` (l.16) : Record<slug, Article> avec content HTML inline. **Note** : seuls 5 slugs sont mappés (le 6e slug `securite-dagestan-2026` du `/blog` n'est pas dans MAP — bug latent à vérifier).
**generateStaticParams** : précompile les articles
**Sections** : PageHero avec date/category · Article body (dangerouslySetInnerHTML) · SectionCTA

---

### 📝 `/inscription` — Formulaire candidature
**Fichier route** : `src/app/inscription/page.tsx` (⚠️ HORS group `(site)`)
**Composant** : `components/InscriptionLayout.tsx` (944 lignes, 'use client')
**Steps (5)** : `STEPS` ligne 11 = Identité · Expérience · Santé · Logistique · Confirmation
**Champs FormData** (l.19) :
- Identité : prenom, nom, dateNaissance, pays, email, telephone
- Expérience : disciplinePrincipale, disciplinesSecondaires[], anneesPratique, niveau, club, coach, palmares, lienVideo
- Santé : conditionPhysique, blessuresRecentes, blessuresDetail, contreIndications, contreIndicationsDetail, deuxFoisJour
- Logistique : **session** ('aout-2026' uniquement maintenant), **duree** (1/2/3 semaines, plus de "1 mois"), villeDepart, disponibleEntretien
- Méta : sourceDecouverte, message, certifMedical, accepteConditions, pret
**Validations** : par step (l.94)
**Submit success** : génère `<StoryCard />` Instagram téléchargeable (avec `SESSION_MAP` l.~145 → 1 entrée actuellement)
**Pour ajouter une session** : modifier (1) `data/sessions.ts`, (2) options select l.~445, (3) `SESSION_MAP` l.~145

---

### 📞 `/contact` — Contact
**Fichier** : `src/app/(site)/contact/page.tsx`
**Composant** : `<ContactForm />` (formulaire simple : Nom, Email, Sujet [select], Message)
**Sujets disponibles** (ContactForm.tsx) : general, partenariat, clubs, presse, autre
**Coordonnées affichées** : email contact@mkrcaucasiancamp.com · WhatsApp **+33 6 66 17 76 91** (wa.me/33666177691) · Instagram @mkr.caucasiancamp

---

### ℹ️ `/a-propos` — Notre histoire
**Fichier** : `src/app/(site)/a-propos/page.tsx`
**Sections** : PageHero · POURQUOI MKR EXISTE (split + photo Ruslan) · NOTRE MISSION (3 cards inline) · NOTRE ÉQUIPE · SALLES PARTENAIRES (3 noms : Salle Makhachkala, Kaspiysk, Khasavyourt) · SectionCTA

---

### 📥 `/guide-dagestan` — Guide PDF gratuit
**Fichier** : `src/app/(site)/guide-dagestan/page.tsx`
**Tableau** : `GUIDE_CONTENTS` (l.13) : 6 items (Visa, Vols, Budget, Prep, Équipement, Conseils)
**Composant** : `<GuideForm />` (formulaire email simple)
**Sections** : PageHero · CinematicReveal · Layout split GUIDE_CONTENTS + GuideForm

---

### 🙏 `/merci` — Confirmation candidature
**Fichier** : `src/app/(site)/merci/page.tsx`
**Métadonnées** : `robots: { index: false }`
**Sections** : Icon check · CANDIDATURE REÇUE · 3 étapes prochaines (Appel 48h, Confirmation+acompte, Guide) · 2 boutons retour

---

### 📜 Pages légales (compactes)

| Page | Fichier | Contenu |
|---|---|---|
| `/cgv` | `cgv/page.tsx` | 10 articles (Objet, Inscription, Prix, Annulation, **Prestations incluses [2 repas, vol intérieur, excursions option]**, Non incluses, Assurance, Responsabilité, Image, **Droit applicable [A completer]**) |
| `/mentions-legales` | `mentions-legales/page.tsx` | Éditeur, hébergement, contact, propriété intellectuelle |
| `/politique-de-confidentialite` | `politique-de-confidentialite/page.tsx` | RGPD, données collectées, cookies, droits |

---

## 2 — Composants réutilisables (`src/components/`)

### Composants utilisés sur plusieurs pages (= "shell")

| Composant | Rôle | Props clés | Pages d'usage |
|---|---|---|---|
| `Nav.tsx` | Header sticky avec mega menu desktop + drawer mobile | (state internal) | `(site)/layout.tsx` (toutes pages) |
| `Footer.tsx` | Footer 4 colonnes (Brand, Le Camp, Disciplines, Infos) | – | `(site)/layout.tsx` |
| `StickyMobileCTA.tsx` | CTA flottant mobile | – | `(site)/layout.tsx` |
| `RouteScrollReset.tsx` | Reset scroll au changement route | – | `(site)/layout.tsx` |
| `RevealObserver.tsx` | IntersectionObserver pour `.reveal` | – | `(site)/layout.tsx` |
| `SiteLoader.tsx` | Loader initial | – | `(site)/layout.tsx` |
| `PageHero.tsx` | Hero générique secondary pages | `{ label, title, subtitle?, breadcrumb?, compact? }` | TOUTES pages secondaires |
| `SectionCTA.tsx` | Bloc CTA fin de page | `{ primaryHref, primaryLabel, ghostHref?, ghostLabel? }` | la plupart des pages secondaires |
| `BreadcrumbJsonLd.tsx` | JSON-LD breadcrumb invisible | `{ items: { name, url }[] }` | TOUTES pages secondaires |
| `Breadcrumb.tsx` | Breadcrumb visible | `{ items: { href, label }[] }` | Pages avec PageHero `breadcrumb` prop |
| `CinematicReveal.tsx` | Section image full-width avec scroll-reveal | `{ image, alt, label?, title?, tagline?, className? }` | Plusieurs pages |
| `MtnDivider.tsx` | Divider montagne SVG | – | Plusieurs pages |
| `ScrollIndicator.tsx` | Indicator scroll dans CinematicReveal | – | – |
| `ScrollParallax.tsx` | Parallax effet | – | – |

### Composants exclusifs homepage

| Composant | Section | Data source |
|---|---|---|
| `Hero.tsx` | Hero vidéos + carousel sessions | `data/sessions.ts` |
| `VideoSection.tsx` | "1 À 3 SEMAINES QUI CHANGENT TOUT" | hardcoded |
| `Philosophie.tsx` | Bento "POURQUOI LE CAUCASE" | hardcoded |
| `DestinationShowcase.tsx` | Grid 4 paysages | hardcoded `LANDSCAPES` |
| `Coaches.tsx` | Grille coachs | `data/coaches.ts` |
| `Sessions.tsx` | Cards sessions | `data/sessions.ts` |
| `Timeline.tsx` | 5 étapes parcours | hardcoded |
| `Testimonials.tsx` | Carousel témoignages | `data/testimonials.ts` |
| `Contact.tsx` | Bloc info contact | hardcoded (téléphone WhatsApp **+33 6 66 17 76 91**) |
| `FAQ.tsx` | Top 6 FAQ | `data/faq.ts` (FAQ_HOMEPAGE) |
| `CTAFinal.tsx` | CTA final + montagnes SVG | hardcoded ("17 août - 5 septembre 2026") |
| `VoyageReveal.tsx` | Section voyage | – |
| `WorldMap.tsx` | Carte monde (peut-être dans VoyageReveal) | – |

### Composants formulaires/UI partagés

| Composant | Pages | Notes |
|---|---|---|
| `InscriptionLayout.tsx` | `/inscription` | 5-step form, 26+ champs, 'use client' |
| `CandidatureForm.tsx` | (auxiliaire) | Probablement obsolète ou variant |
| `ContactForm.tsx` | `/contact` | 4 champs simples (Nom, Email, Sujet, Message) |
| `GuideForm.tsx` | `/guide-dagestan` | Email seul |
| `StoryCard.tsx` | `/inscription` (succès) | Génère image Instagram via html2canvas |
| `FAQAccordion.tsx` | `/faq`, `/comment-ca-marche` | Accordion `<details>` |
| `FAQTabs.tsx` | `/faq` | Tabs sur 4 catégories |
| `DestinationReveal.tsx` | `/destinations/dagestan` | Section reveal-on-scroll |
| `GalerieContent.tsx` | `/galerie` | Grid photos avec catégories filtrables |

---

## 3 — Data files — Single sources of truth

### `src/data/site.ts`
```ts
SITE_URL = 'https://mkrcaucasiancamp.com'
SITE_NAME = 'MKR Caucasian Camp'
SITE_EMAIL = 'contact@mkrcaucasiancamp.com'
SITE_DESCRIPTION = "Camp d'entraînement MMA et Lutte au cœur du Caucase, Daghestan..."
SOCIALS = { instagram, facebook, youtube }
GEO = { latitude: 42.9849, longitude: 47.5047, country: 'RU', region: 'Daghestan' }
```
**À modifier pour** : tagline globale, coordonnées, GEO JSON-LD.

### `src/data/sessions.ts`
**Type** `Session` : id, season, seasonLabel, label, name, monthAbbr, dates, datesFull, startDate, endDate, price, priceCurrency, maxCapacity, spotsLabel, status, intensity, duration, destination
**Tableau `SESSIONS`** : actuellement **1 seule entrée** `aout-2026` (CAMP DAGHESTANAIS, 17/08-05/09/2026, 2900 CHF, 15 max)
**Helpers** : `formatPrice(session)`, `sessionFormLabel(session)`
**Lu par** : `Sessions.tsx` (homepage), `Hero.tsx` (carousel)
**⚠️** Hardcodé séparément aussi dans `app/(site)/sessions/page.tsx` (l.14) et `InscriptionLayout.tsx` (l.~145 SESSION_MAP + l.~445 select options) — 4 endroits à synchroniser.

### `src/data/coaches.ts`
**Type** `Coach` : id, firstName, lastName, discipline, jobTitle, bio, bioShort, image, knowsAbout[]
**Tableau `COACHES`** : 4 entrées (Magomed Magomedov · Khasan Akhmedov · Akhmed Bashaev · Shamil Khalilov)
**Lu par** : `Coaches.tsx` (homepage)
**⚠️** La page `/coachs` a son **propre tableau `COACHES` hardcodé** avec champs différents (name, role, experience, bio, palmares).

### `src/data/disciplines.ts`
**Tableau `DISCIPLINES`** : 11 entrées (MMA, Lutte Libre, Lutte Gréco-Romaine, Boxe Anglaise, Kickboxing/K-1, Muay Thaï, Grappling, Sambo, Jiu-Jitsu Brésilien, Judo, Autre)
**⚠️ Important** : c'est la liste des **disciplines d'origine du candidat** (background). PAS la liste des disciplines proposées par MKR (qui est uniquement Lutte adultes/enfants/MMA).
**Lu par** : `InscriptionLayout.tsx` (form step 1)

### `src/data/faq.ts`
**Type `FAQItem`** : { question, answer }
**Type `FAQCategory`** : { id, label, items: FAQItem[] }
**Tableaux** :
- `FAQ_HOMEPAGE` (6 items) — lu par `FAQ.tsx` (homepage)
- `FAQ_CATEGORIES` (4 catégories : Sécurité, Logistique, Entrainement, Inscription) — lu par `FAQTabs.tsx`
- Helper `getAllFaqItems()` — pour JSON-LD FAQPage

### `src/data/testimonials.ts`
**Type `Testimonial`** : { img, alt, name, discipline, quote }
**Tableau `TESTIMONIALS`** : 10 témoins
**Lu par** : `Testimonials.tsx` (homepage)
**⚠️** La page `/temoignages` a son propre tableau `TESTIMONIALS` hardcodé (9 entrées).

---

## 4 — Formulaires complets

### Formulaire INSCRIPTION (`/inscription`)
**Fichier** : `components/InscriptionLayout.tsx`
**Steps** : 5 (Identité, Expérience, Santé, Logistique, Confirmation)
**Champs (26)** :
| Step | Champs requis | Validation |
|---|---|---|
| 0 Identité | prenom, nom, dateNaissance, pays, email | age ≥ 18, email regex |
| – | telephone | optionnel |
| 1 Expérience | disciplinePrincipale (DISCIPLINES select), anneesPratique, niveau | required |
| – | disciplinesSecondaires[], club, coach, palmares, lienVideo | optionnel |
| 2 Santé | conditionPhysique, blessuresRecentes, contreIndications, deuxFoisJour | required |
| – | blessuresDetail, contreIndicationsDetail | conditionnels |
| 3 Logistique | session ('aout-2026'), duree (1/2/3 semaines) | required |
| – | villeDepart, disponibleEntretien, sourceDecouverte, message | optionnel |
| 4 Confirmation | certifMedical, accepteConditions, pret | checkbox required |

**Submit success** : génère `<StoryCard />` (Instagram story téléchargeable PNG via html2canvas).

### Formulaire CONTACT (`/contact`)
**Fichier** : `components/ContactForm.tsx`
**Champs** : Nom, Email, Sujet (select), Message
**Sujets** : general, partenariat, clubs, presse, autre

### Formulaire GUIDE (`/guide-dagestan`)
**Fichier** : `components/GuideForm.tsx`
**Champs** : Email seul (lead magnet)

---

## 5 — Conventions CSS / classes

### Classes layout / framework
| Classe | Usage |
|---|---|
| `inner` | Wrapper max-width centré (utilisé dans toutes les sections) |
| `reveal` | Animation IntersectionObserver (transitionDelay possible inline) |
| `reveal-clip` | Variante avec clip-path |
| `layout-split` / `layout-split--balanced` / `layout-split--center` | Grids 2-cols |
| `grid-2` / `grid-3` / `grid-3x2` | Grids responsive |
| `content-card` / `photo-card` / `group-card` | Cards |

### Classes "fx-" (effets visuels)
| Préfixe | Variantes | Usage |
|---|---|---|
| `fx-grid` | – | Background grid pattern |
| `fx-glow` | `fx-glow-orb`, `fx-glow-orb--top/left/right`, `fx-glow-breathe` | Orbe lumineux + breathe |
| `fx-texture` | `fx-texture-basalt/concrete` | Textures background |
| `fx-mask` | `fx-mask-a/b/c/d` | Masks gradient |
| `fx-stack` | `fx-stack-1` à `fx-stack-7` | Z-index stacking |
| `fx-grain` | – | Bruit cinématographique |
| `fx-corner-glow` | – | Glow coin de card |

### Classes typographiques
| Classe | Usage |
|---|---|
| `label-tag` | Label uppercase petit (souvent avec `style={{ color: 'var(--primary)' }}`) |
| `card-title` / `card-body` | Titres/corps de cards |
| `pull-quote` | Citation en italique |

### Classes boutons
- `btn-primary` (CTA orange/rouge)
- `btn-ghost` (CTA bordure)
- `nav-cta` (variante bouton nav)

### Variables CSS clés (`globals.css`)
- `--primary` : couleur accent (orange/rouge MKR)
- `--cta` : variante CTA
- `--text-primary` / `--text-secondary` / `--text-muted`
- `--surface-lowest` : background card

---

## 6 — Quick lookup — "Où changer X ?"

| Je veux changer… | Fichier(s) à modifier |
|---|---|
| **Logo** | `public/images/dkdp-logo.webp` (à remplacer) + références Nav/Footer |
| **Coordonnées contact (téléphone, email)** | `components/Contact.tsx` (homepage) + `app/(site)/contact/page.tsx` + `app/(site)/sessions/page.tsx:195` (WhatsApp groupes) + `data/site.ts` (SITE_EMAIL) |
| **Hero homepage (titre/subtitle)** | `components/Hero.tsx` lignes 160-170 |
| **Hero stats (9 coachs / 8 athlètes / 1-3 semaines)** | `components/Hero.tsx` l.175-188 |
| **Stats homepage video section** | `components/VideoSection.tsx` l.40-57 |
| **Sessions (dates, prix, places)** | `data/sessions.ts` ⚠️ + `app/(site)/sessions/page.tsx` (SESSIONS l.14) + `components/InscriptionLayout.tsx` (SESSION_MAP l.~145, options select l.~445) |
| **Coachs (nom, bio, photo)** | `data/coaches.ts` (homepage) + `app/(site)/coachs/page.tsx` (COACHES local l.13) |
| **Disciplines proposées (3)** | `app/(site)/programme/page.tsx` (cards) + Nav.tsx mega-prog-grid + Footer.tsx Disciplines col |
| **Disciplines candidat (formulaire)** | `data/disciplines.ts` |
| **FAQ homepage (6 Q/R)** | `data/faq.ts` → `FAQ_HOMEPAGE` |
| **FAQ page complète** | `data/faq.ts` → `FAQ_CATEGORIES` |
| **Témoignages homepage** | `data/testimonials.ts` |
| **Témoignages page dédiée** | `app/(site)/temoignages/page.tsx` (TESTIMONIALS local) |
| **Inclus / Non-inclus** | `app/(site)/le-camp/page.tsx` (INCLUDES l.14, NOT_INCLUDED l.72) + `app/(site)/sessions/page.tsx` (INCLUDES l.56) + `app/(site)/cgv/page.tsx` (Article 5) |
| **Horaires journée type** | `app/(site)/le-camp/page.tsx` (DAILY_SCHEDULE l.79) |
| **Tarifs / refund policy** | `app/(site)/sessions/page.tsx` (table) + `app/(site)/cgv/page.tsx` (Article 4) + `app/(site)/comment-ca-marche/page.tsx` |
| **Visa / vols / budget** | `app/(site)/logistique/page.tsx` |
| **Equipement à apporter** | `app/(site)/preparer-son-camp/page.tsx` (EQUIPMENT l.23) + `data/faq.ts` (réponse équipement) |
| **Programme entraînement (jour, semaine)** | `app/(site)/le-camp/page.tsx` DAILY_SCHEDULE + `app/(site)/programme/mma/page.tsx` SESSION_FLOW + lutte/page.tsx + lutte-enfants/page.tsx |
| **Articles blog** | `app/(site)/blog/page.tsx` (ARTICLES) + `app/(site)/blog/[slug]/page.tsx` (ARTICLES_MAP) |
| **CTA "Prochain camp" (homepage bottom)** | `components/CTAFinal.tsx` l.13 |
| **Mega menu desktop** | `components/Nav.tsx` (panels camp/programme/destinations/infos) |
| **Menu mobile** | `components/Nav.tsx` `<MobAccordion>` lignes ~430+ |
| **Footer (liens, description)** | `components/Footer.tsx` |
| **JSON-LD Organization globale** | `app/layout.tsx` (Organization + SportsActivityLocation l.~98) |
| **Sitemap** | `app/sitemap.ts` (28 URLs) |
| **Métadonnées par page** | exports `metadata: Metadata` dans chaque `page.tsx` |
| **Photos coachs** | `public/images/coaches/{firstname-lastname}.webp` (lowercase, tirets) |
| **Vidéos hero** | `public/videos/hero-mountains.mp4`, hero-village, hero-forest, hero-clouds |

---

## 6bis — 🎯 Propagation Map (CEO data → fichiers exhaustifs)

> **Le tableau le plus important du fichier.** Pour chaque info CEO, voici TOUS les endroits où elle vit. À chaque modification de l'une de ces infos, **toucher tous les fichiers de la même ligne**, sinon une page restera incohérente.

### Téléphone WhatsApp `+33 6 66 17 76 91` (wa.me/33666177691)
| Fichier | Ligne | Forme |
|---|---|---|
| `components/Contact.tsx` | 49-50 | bloc Contact homepage (href + label) |
| `components/Footer.tsx` | ~22 | footer-contact-link (ajouté 2026-04-30) |
| `components/Nav.tsx` | ~445 | mob-direct (menu mobile, ajouté 2026-04-30) |
| `app/(site)/contact/page.tsx` | 49-50 | page Contact (carte WhatsApp) |
| `app/(site)/sessions/page.tsx` | ~195 | bouton "CONTACTER PAR WHATSAPP" tarif groupe |
| `components/InscriptionLayout.tsx` | 287-290 | placeholder champ téléphone form (`+33 6 XX XX XX XX`) |
| `components/CandidatureForm.tsx` | 259-262 | idem (composant alternatif) |
**⚠️** Si on change le numéro, modifier **les 7 endroits**.

### Session unique `aout-2026` — Camp Daghestanais 17 août → 5 septembre 2026
| Fichier | Ligne | Forme |
|---|---|---|
| `data/sessions.ts` | 24-44 | objet Session complet (source of truth) |
| `app/(site)/sessions/page.tsx` | 14-26 | tableau SESSIONS hardcoded (carte page sessions) |
| `components/InscriptionLayout.tsx` | ~145 | SESSION_MAP succès inscription |
| `components/InscriptionLayout.tsx` | ~436 | option select dans le form |
| `components/CTAFinal.tsx` | 13 | "Prochain camp · 17 août - 5 septembre 2026 · Daghestan" |
| `components/Nav.tsx` | ~257 | mega-camp-accent-sub (mega menu Le Camp) |
**Composants dynamiques (auto-mise à jour)** : `Sessions.tsx` (homepage), `Hero.tsx` (carousel) lisent `data/sessions.ts`.
**⚠️** Si on ajoute/modifie/supprime une session : toucher au minimum les 4 endroits hardcodés.

### Stats hero (9 coachs / 8 athlètes / 1-3 semaines)
| Fichier | Ligne | Forme |
|---|---|---|
| `components/Hero.tsx` | 175-188 | hero-stats homepage (3 stat-item) |
| `components/VideoSection.tsx` | 11, 45-48 | titre "1 À 3 SEMAINES" + stat "9 Coachs experimentes" |
| `app/(site)/temoignages/page.tsx` | ~138-148 | stats-band (8 athletes / 9 coachs / 87%) |
| `app/(site)/programme/page.tsx` | ~28-39 | stats-band (2 sessions/jour / 6 jours / 3 disciplines) |
| `app/(site)/page.tsx` | 19 | metadata description "9 coachs experimentes" |
| `app/(site)/coachs/page.tsx` | 9 | metadata description "9 coachs experimentes" |
| `components/Philosophie.tsx` | 25 | "ce séjour au Daghestan (1 à 3 semaines)" |
| `components/Timeline.tsx` | 143 | "Une à trois semaines au Daghestan" |
**⚠️** Si la stat évolue (ex: 11 coachs), modifier ces 8 endroits.

### 3 disciplines : Lutte adultes, Lutte enfants, MMA
**Routes URL** : `/programme/lutte`, `/programme/lutte-enfants`, `/programme/mma`
| Fichier | Forme |
|---|---|
| `app/(site)/programme/page.tsx` | 3 cards "DISCIPLINE" (LUTTE ADULTES, LUTTE ENFANTS, MMA) + stat "3 Disciplines" |
| `components/Nav.tsx` | mega-prog-grid : 3 cards (MMA, LUTTE ADULTES, LUTTE ENFANTS) |
| `components/Nav.tsx` | menu mobile : 3 liens (MMA, Lutte adultes, Lutte enfants) |
| `components/Footer.tsx` | colonne Disciplines : 3 liens |
| `app/sitemap.ts` | URLs `/programme/{mma,lutte,lutte-enfants}` |
| `app/layout.tsx` | JSON-LD `knowsAbout` + `sport` arrays (MMA, Lutte libre, Lutte enfants) |
| `data/faq.ts` | answer "3 disciplines : Lutte adultes, Lutte enfants et MMA" (FAQ_CATEGORIES) |
| `app/(site)/page.tsx` | metadata description |
| `app/(site)/le-camp/page.tsx` | metadata description |
| `data/site.ts` | SITE_DESCRIPTION |
**⚠️** Ajouter une 4e discipline = toucher tous ces endroits + créer `app/(site)/programme/{slug}/page.tsx` + sitemap + breadcrumb.

### Horaires Lutte 10h30/17h30 — MMA 11h00/18h00
| Fichier | Ligne | Forme |
|---|---|---|
| `app/(site)/le-camp/page.tsx` | 79-88 | DAILY_SCHEDULE (timeline journée type) |
| `app/(site)/programme/lutte/page.tsx` | ~140 | note "Horaires officiels Lutte adultes" |
| `app/(site)/programme/lutte-enfants/page.tsx` | ~140 | note "Sessions matin a 10h30 et apres-midi a 17h30" |
| `app/(site)/programme/mma/page.tsx` | ~140 | note "Horaires officiels MMA" |
| `data/faq.ts` | ~100 | answer "Lutte adultes et enfants : 10h30 et 17h30. MMA : 11h00 et 18h00" |
**⚠️** Si les horaires changent, mettre à jour 5 endroits.

### Vol intérieur Istanbul → Makhachkala (inclus)
| Fichier | Forme |
|---|---|
| `data/faq.ts` (FAQ_HOMEPAGE l.24 + FAQ_CATEGORIES l.70) | "vol intérieur Istanbul-Makhachkala" |
| `components/Sessions.tsx` | 48 — sub price "vol intérieur Istanbul-Makhachkala inclus · Vol international à charge" |
| `components/VoyageReveal.tsx` | 55 — étape "02 Istanbul → Makhachkala (vol intérieur inclus)" |
| `app/layout.tsx` | 119 — JSON-LD amenityFeature |
| `app/(site)/page.tsx` | 19 — metadata description |
| `app/(site)/le-camp/page.tsx` | 10 — metadata description |
| `app/(site)/logistique/page.tsx` | 101-103 — 3 cartes vols (Paris, Genève, Bruxelles) |
| `app/(site)/cgv/page.tsx` | 43 — Article 5 prestations incluses |
**⚠️** Si la stratégie vol change (ex: vol intl inclus aussi), 8 endroits.

### Transfert aéroport → camp 1h30
| Fichier | Ligne | Forme |
|---|---|---|
| `app/(site)/logistique/page.tsx` | 153 | paragraphe transferts |
| `data/faq.ts` | ~78 | answer transfert (FAQ_CATEGORIES) |
| `components/VoyageReveal.tsx` | 59 | étape "03 Transfert au camp (1h30, inclus)" |

### 2 repas par jour
| Fichier | Ligne | Forme |
|---|---|---|
| `app/(site)/le-camp/page.tsx` | 67 | INCLUDES "2 repas/jour" |
| `app/(site)/sessions/page.tsx` | ~109 | INCLUDES "2 repas/jour" |
| `app/(site)/logistique/page.tsx` | 53 | tableau inclus "2 repas par jour" |
| `app/(site)/cgv/page.tsx` | 41 | Article 5 prestations |
| `data/faq.ts` (FAQ_HOMEPAGE l.24 + FAQ_CATEGORIES l.70) | "2 repas/jour" |
| `components/Sessions.tsx` | 48 | sub-price "2 repas/jour" |
| `app/layout.tsx` | 117 | JSON-LD amenityFeature |
| `app/(site)/blog/[slug]/page.tsx` | 111 | article nutrition mention "2 repas principaux" |

### Excursions (en option)
| Fichier | Forme |
|---|---|
| `app/(site)/le-camp/page.tsx` | INCLUDES "Excursions" + desc randonnées |
| `app/(site)/logistique/page.tsx` | tableau "Excursions culturelles (en option)" |
| `app/(site)/sessions/page.tsx` | INCLUDES "Excursions (en option)" |
| `app/(site)/cgv/page.tsx` | Article 5 "Excursions culturelles (en option)" |

### Visa UE (questionnaire + passeport 6 mois)
| Fichier | Ligne | Forme |
|---|---|---|
| `app/(site)/logistique/page.tsx` | 75 | step #02 visa Russie |
| `data/faq.ts` (FAQ_HOMEPAGE l.20 + FAQ_CATEGORIES) | "questionnaire visa + passeport 6 mois minimum" |

### Liste équipement (sans Kimono / Trousse / Crème / Adaptateur)
| Fichier | Const | Notes |
|---|---|---|
| `app/(site)/preparer-son-camp/page.tsx` | EQUIPMENT (l.23) | 2 catégories : Vêtements/Protection (7 items) + Hygiène/Admin (5 items) |
| `data/faq.ts` (FAQ_HOMEPAGE l.32 + FAQ_CATEGORIES l.74) | answer équipement | retirée mention Kimono |
| `app/(site)/cgv/page.tsx` | Article 6 | "Equipement personnel" non inclus |

### Programme lutte = libre uniquement (PAS gréco)
| Fichier | Forme |
|---|---|
| `app/(site)/programme/lutte/page.tsx` | metadata + TECHNIQUES (sans Greco-romaine) + body + subtitle |
| `app/(site)/programme/page.tsx` | card LUTTE ADULTES "Lutte libre exclusivement" |
| `components/Nav.tsx` | mega-prog-card "Lutte libre" |
| `app/layout.tsx` | JSON-LD `knowsAbout` + `sport` "Lutte libre" |
**Exception OK** : `data/disciplines.ts` et `InscriptionLayout.tsx` l.14 conservent "Lutte Gréco-Romaine" car c'est la liste des **disciplines d'origine du candidat** (background), pas l'offre MKR.

### Destination Daghestan uniquement (Tchétchénie/Grozny supprimée)
**Recherche d'audit** : `grep -i "tchetch|grozny|GRV"` doit retourner 0 résultats. Confirmé propre 2026-04-30.

### Email contact
| Fichier | Forme |
|---|---|
| `data/site.ts` | SITE_EMAIL = 'contact@mkrcaucasiancamp.com' |
| `components/Footer.tsx` | footer-contact-link mailto |
| `components/Contact.tsx` | bloc info homepage |
| `app/(site)/contact/page.tsx` | carte Email |
| `app/(site)/sessions/page.tsx` | bouton "ENVOYER UN EMAIL" tarif groupe |

### Réseaux sociaux (Instagram, Facebook, YouTube)
| Fichier | Forme |
|---|---|
| `data/site.ts` | SOCIALS object |
| `components/Footer.tsx` | footer-socials (3 liens) + footer-contact-link Instagram |
| `components/Contact.tsx` | bloc Instagram homepage |
| `app/(site)/contact/page.tsx` | carte Instagram |

### Tarifs publics (grille fixe adulte/enfant)
**Source unique** : `data/pricing.ts` (ADULT_PRICING, CHILD_PRICING, FAMILY_EXAMPLES, helpers)
| Fichier | Forme |
|---|---|
| `data/pricing.ts` | source of truth complète (1500/2200/2900 adulte, 1000/1400/1900 enfant) |
| `components/PricingTable.tsx` | composant réutilisable (sur `/sessions` et `/familles`) |
| `app/(site)/sessions/page.tsx` | utilise `<PricingTable />` après la session officielle |
| `app/(site)/familles/page.tsx` | utilise `<PricingTable />` au milieu de la page |
| `components/InscriptionLayout.tsx` | step 3 affiche tarifs dans select durée + recap step 4 calcule via `calculatePrice()` |
| `app/(site)/programme/lutte-enfants/page.tsx` | section "Pour les parents" mentionne 1000/1400/1900 |
**⚠️** Si on change un tarif : modifier UNIQUEMENT `data/pricing.ts`. Tous les autres endroits propagent automatiquement.

### 3 types d'inscription (session / custom / groupe)
**Source unique** : `data/registration-types.ts` (REGISTRATION_TYPES)
| Fichier | Forme |
|---|---|
| `data/registration-types.ts` | 3 objets RegistrationType avec id, label, badge, description, image, etc. |
| `components/AudienceSwitcher.tsx` | composant avec 3 cards photo (lit registration-types) |
| `components/InscriptionLayout.tsx` | sélecteur Step 0 + state `audience` + adaptations Step 3 |
| `app/inscription/page.tsx` | parse `?type=` et passe `initialAudience` à InscriptionLayout |
| `app/(site)/page.tsx` (homepage) | `<AudienceSwitcher />` entre VideoSection et Philosophie |
| `app/(site)/sessions/page.tsx` | `<AudienceSwitcher withHeader={false} />` après PageHero |
| `components/Nav.tsx` | mega-camp panel + menu mobile "S'inscrire" accordion (3 liens) |
| `components/Footer.tsx` | colonne "Inscriptions" (3 liens) |
**⚠️** Si on change un wording : modifier UNIQUEMENT `data/registration-types.ts`. Le reste propage.

### Camp Famille (parent + enfant 8-17)
| Fichier | Rôle |
|---|---|
| `app/(site)/familles/page.tsx` | page dédiée complète |
| `app/(site)/programme/lutte-enfants/page.tsx` | section "Pour les parents" rassurante |
| `components/InscriptionLayout.tsx` | option "Tu viens avec ta famille ?" + champs nombreEnfants/enfantsAges |
| `components/Footer.tsx` | lien "Camp Famille" col Programmes |
| `components/Nav.tsx` | menu mobile accordion Programme |
| `app/sitemap.ts` | URL `/familles` priority 0.85 |

### Photos Ruslan — mapping audience/page
| Photo | Usage actuel |
|---|---|
| `Antoine-portrait-makhachkala-mkr.webp` | AudienceSwitcher card "Camp sur mesure" + section /familles |
| `mma-cercle-session-demo-mkr.webp` | AudienceSwitcher card "Session groupe" |
| `mma-adultes-cercle.webp` | AudienceSwitcher card "Clubs et groupes" |
| `kids/kid-lutteur-rouge-rossiya.webp` | CinematicReveal /programme/lutte-enfants |
| `kids/kid-stretching-debout.webp` | photo split /programme/lutte-enfants |
| `kids/kids-alignes-tapis-vertical.webp` | photo split /familles + /programme/lutte-enfants |
| `kids/kids-course-flou-1.webp` | section "Pour les parents" /programme/lutte-enfants + section sécurité /familles |
| `heritage/priere-collective-mkr.webp` | CinematicReveal /familles "L'héritage se transmet" |
| `coaches/coachs-salle-espalier-mkr.webp` | section coachs |
| `environment/canyon-sulak-falaises.webp` | DestinationShowcase |

---

## 7 — Conventions importantes (rules)

1. **Pas de Tchétchénie / Grozny** — supprimé partout (CEO 2026-04-30). Ne pas réintroduire.
2. **3 disciplines proposées** : Lutte adultes, Lutte enfants, MMA. **Pas** Boxe ni Sambo en discipline proposée. Les coachs Boxe/Sambo restent affichés sur `/coachs` (background).
3. **Camp 1 à 3 semaines** dans la copy publique (pas "3 semaines" en absolu).
4. **9 coachs / 8 athlètes** stats publiques.
5. **2 repas/jour** (jamais 3).
6. **Excursions (en option)**.
7. **Vol Istanbul → Makhachkala** inclus dans le package.
8. **Transfert 1h30** Makhachkala → camp (pas 2-3h).
9. **Horaires** : Lutte 10h30/17h30, MMA 11h00/18h00 — par discipline, pas de chevauchement.
10. **Visa UE** : questionnaire MKR + passeport 6 mois min.
11. **WhatsApp** : `+33 6 66 17 76 91` → `wa.me/33666177691`. Jamais de placeholder XXX, jamais +41.
12. **Programme lutte = libre uniquement**, pas de gréco-romaine.
13. **Sessions 2026** : actuellement **UNE SEULE** session (`aout-2026`, 17 août → 5 septembre).
14. **Pas d'em dash** ("—") dans le contenu (préférence DKDP globale, à appliquer ici aussi le cas échéant).

---

## 8 — Workflow recommandé pour modifier une page

1. **Lis ce SITEMAP.md** d'abord pour repérer le ou les fichiers concernés.
2. **Pour les changements de contenu CEO** (téléphone, sessions, disciplines, horaires, repas, etc.) : aller directement à **§6bis Propagation Map** et toucher TOUS les endroits listés pour cette info, sinon une page restera incohérente.
3. **Pour les autres changements** : utiliser §6 Quick lookup pour identifier le fichier.
4. **Identifie les single sources of truth** : si la donnée est dans `data/`, modifie-y en priorité ; puis répète dans les tableaux hardcodés des pages.
5. **Audit grep automatique** avant de finir : pour les règles CEO, lancer ces greps pour confirmer 0 résidu :
   ```
   grep -i "tchetch|grozny|GRV"      → doit être vide
   grep "3 repas|trois repas"        → doit être vide
   grep "2-3 heures|2 a 3 heures"    → doit être vide
   grep "240+|240 \+"                → doit être vide
   grep "wa\.me/41|XXXXXXXXX"        → doit être vide
   grep "PRINTEMPS GEORGIEN|GÉORGIEN" → doit être vide
   ```
6. **Toujours `rm -rf .next && npx next build`** après modification structurelle pour confirmer 35 routes statiques OK.
7. **Vérifie la propagation Nav/Footer/mobile** — c'est l'erreur classique : modifier un texte sur une page mais l'oublier dans le mega menu desktop, dans le menu mobile, dans le footer. Toujours vérifier ces 3 surfaces transverses.
8. **Mettre à jour ce SITEMAP.md** si la structure a changé (nouvelle page, suppression, refactor important, ou ajout d'un endroit où une info CEO apparaît).

---

*Dernière régénération : 2026-04-30 — après refactor CEO (Tchétchénie supprimée, 3 disciplines, 1 session unique, +33 phone).*
