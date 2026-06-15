# SITEMAP MKR Caucasian Camp — Cartographie complète

> **Fichier de référence pour Claude Code.** Mise à jour : 2026-05-27 (site bilingue FR + EN : next-intl, 34 namespaces, sitemap 68 URLs, EN PDF guide, glossaire locked, Playwright QA spec).
> Lis ce fichier en priorité avant toute intervention sur le site MKR. Il évite de re-explorer.

## 🆕 2026-06-12 (nouvelle page /tarifs + simulateur de prix + PricingTable i18n)

> **Nouvelle page dédiée `/tarifs`** (FR) ↔ **`/en/pricing`** (EN). Centralise tout le pricing avec UX/UI/SEO/GEO : hero, section "tout compris" (6 prestations avec icônes), **simulateur de prix interactif**, grille `PricingTable` complète, transparence (3 cards), FAQ tarifs (6 Q/R) et CTA. Auparavant le pricing vivait uniquement sur `/sessions` + le composant `PricingTable`.

**Fichiers créés** :
- `src/app/[locale]/(site)/tarifs/page.tsx` — server component. JSON-LD **FAQPage** (6 Q/R) + **Product/AggregateOffer** (lowPrice = `PRICING_TIERS.club.perAdult[1]`, highPrice = `FAMILY_PRICING.base[3]`, EUR).
- `src/app/[locale]/(site)/tarifs/opengraph-image.tsx` — OG (accent red, bg takedown-wrestling.png).
- `src/components/PriceEstimator.tsx` — **client component**. Steppers adultes (1-11) / enfants (0-4) + durée segmentée (1/2/3 sem). Math via `calculatePrice`/`pricePerAdult`/`isOnQuote` purs (`@/data/pricing`). Labels passés en **props** depuis la page (zéro dépendance au provider i18n). CTA dynamique : `?type=famille` si enfant, `?type=groupe` si ≥6, sinon `?type=session` ; 11+ → "Sur devis" + `/contact`. CSS `.estimator-*` + `.tc-*` en fin de `globals.css`.
- `messages/{fr,en}/tarifs.json` + `messages/{fr,en}/pricing_table.json`.

**BREAKING (composant partagé)** : `src/components/PricingTable.tsx` est passé de **strings FR hardcodées → async server component i18n** (`getTranslations('pricing_table')`, numéros toujours depuis `data/pricing.ts`). **Corrige le bug** où la grille s'affichait en français sur `/en/family`, `/en/sessions`, `/en/mkr-camp-2026`. Le `<Link>` est désormais le `@/i18n/navigation` (slugs localisés). Les 4 pages qui rendent `<PricingTable />` n'ont pas changé d'appel.

**Intégration** :
- `src/i18n/routing.ts` : `'/tarifs': { fr: '/tarifs', en: '/pricing' }`.
- `src/i18n/request.ts` : ajout `'tarifs'` + `'pricing_table'` à `FLAT_NAMESPACES` (sinon `MISSING_MESSAGE` au runtime).
- `src/app/sitemap.ts` : `/tarifs` priority 0.9 (×2 locales).
- `src/components/Nav.tsx` : ICO.tarifs (`tag`) + lien desktop en tête de "Autres formats" (`panels.le_camp.formats.tarifs`) + mobile `see_all_prices` repointé `/sessions`→`/tarifs`.
- `src/components/Footer.tsx` : libellé "Tarifs publics" repointé `/sessions`→`/tarifs`.
- `src/app/[locale]/(site)/sessions/page.tsx` : bouton primary `/tarifs` (`tout_compris.cta_pricing`) à côté du lien `/le-camp`.
- Clés i18n ajoutées : `common.nav.panels.le_camp.formats.tarifs`, `sessions.tout_compris.cta_pricing` (FR+EN).

**Note** : le `addressRegion: "Daghestan"` (avec H) reste dans le JSON-LD racine (`data/site.ts` GEO) sur toutes les pages EN — préexistant, donnée structurée, hors scope.

---

## 🆕 BREAKING — 2026-05-27 (site bilingue FR + EN)

> **Décision David (post-interview Ruslan)** : élargir le funnel candidats anglophones (US/UK/MEA/Russian diaspora). FR reste canonical à la racine, EN ajouté sous `/en/` avec slugs SEO-friendly (slug remapping FR↔EN, pas de doublon mot pour mot).

**Stack** : `next-intl` 4.12.0, App Router `[locale]/`, middleware `proxy.ts` (admin guard + i18n routing). Slug remap : `/le-camp` → `/en/the-camp`, `/programme/lutte` → `/en/program/wrestling`, `/inscription` → `/en/apply`, `/familles` → `/en/family`, `/sur-mesure` → `/en/custom`, `/clubs-groupes` → `/en/clubs-groups`, etc. Helpers : `src/i18n/{routing,navigation,request}.ts` (next-intl wiring) + `src/lib/i18n-helpers.ts` (`localizedMetadata()` + `getAlternateLinks()` hreflang bidirectionnel).

**34 message namespaces** : `messages/fr/` + `messages/en/` (28 pages + `data.*` + `meta` + `blog`). 2557 clés par locale, parité validée par CI. 6 articles blog dans `messages/{fr,en}/blog/<slug>.json` (slug canonical = nom de fichier).

**Glossaire locked** : `src/i18n/glossary.md` (~250 lignes, source pour le master prompt de traduction). Daghestan→Dagestan (no H), Tchétchénie→Chechnya, Lutte→Wrestling, MMA stays MMA, Coach not "trainer", Camp not "course"/"stage". Tagline locked : **"L'immersion au milieu des champions"** → **"Immersion among champions"**. Règles globales : no em dash, no ampersand (write "and"), no emoji. Form labels per §7, logistique terms per §8.4 (Vol intérieur→Domestic flight, Visa russe→Russian visa, 2 repas par jour→2 meals per day).

**LocaleSwitcher** : `src/components/LocaleSwitcher.tsx` desktop + mobile, persiste `NEXT_LOCALE` cookie (1 an). Garde le slug équivalent au switch (`/le-camp` ↔ `/en/the-camp` via la routing table next-intl).

**Admin protection** : `proxy.ts` (middleware) bloque `/en/admin/*` → l'admin reste 100% FR. Badge EN sur `/admin/inscriptions` quand `submission_language='en'`.

**Sitemap** : `src/app/sitemap.ts` émet **68 URLs** (28 paths × 2 locales + 12 blog × 2 locales) avec `<xhtml:link rel="alternate" hreflang="fr|en|x-default">` bidirectionnel. `robots.txt` allow `/en/`. `public/llms-en.txt` miroir EN du `llms.txt` pour découverte par crawlers IA.

**EN PDF guide** : source `docs/guide-caucase/guide.en.html` + build `./docs/guide-caucase/build.sh en` → `public/caucasus-guide.pdf`. Lead magnet EN servi via `/en/guide-caucase`.

**Backend** : Supabase columns `candidatures.submission_language text CHECK IN ('fr','en') DEFAULT 'fr'` + `guide_leads.submission_language text DEFAULT 'fr'`. Payload form propage la locale courante.

**JSON-LD** : `inLanguage` par locale sur WebSite + Events, `Organization.inLanguage: ['fr','en']`, `Organization.slogan: "Immersion among champions"` (EN) ou "L'immersion au milieu des champions" (FR).

**CI** : `scripts/i18n-check.js` valide la parité 2557 clés FR vs EN, fail le build si EN incomplet. Slash command `claude /translate-content` (cf. `.claude/commands/translate-content.md`) dispatch un sub-agent traducteur avec le master prompt + glossaire.

**QA Playwright** : `tests/i18n/layout-qa.spec.ts` (168 tests : 28 pages × 2 locales × 3 breakpoints). `npm run test:i18n` requires dev server up + Playwright browsers installed.

**Workflow d'ajout d'une clé EN** :
1. Modifier le namespace FR dans `messages/fr/<ns>.json`.
2. Lancer `claude /translate-content` (dispatch traducteur avec glossaire + master prompt).
3. Valider avec `node scripts/i18n-check.js` (CI fail si EN incomplet).
4. Rebuild PDF EN si guide touché : `./docs/guide-caucase/build.sh en`.

**Commits clés** : 8dc5143 (T13 EN translation 5052 insertions), 20bf62a (T14 sitemap 68 URLs), ce0b029 (T11 hreflang helpers), 254260d (T16 Supabase + admin EN badge), 13d4b19 (T18 CI i18n-check.js), b6183f8 (T19+T20 Playwright + SEO audit).

**Entrée "Où changer X ?" associée** :
| Je veux changer… | Fichier(s) à modifier |
|---|---|
| **Ajouter une clé de traduction EN** | Modifier `messages/fr/<ns>.json` → `claude /translate-content` → `node scripts/i18n-check.js` pour valider. Si guide PDF touché : `./docs/guide-caucase/build.sh en`. |

---

## 🆕 Changements 2026-05-26 (vidéo verticale Antoine parcours sur 3 surfaces)

> Nouveau composant client `<VerticalVideoSplit />` qui affiche la vidéo verticale 9:16 d'Antoine Petit-Jean (montage 54s entraînement MMA Tchétchénie). Split layout : vidéo gauche + bloc storytelling droite (label + titre + timeline interactive de 5 moments + CTA). Autoplay mute + clic son + clic expand → VideoModal plein écran. Triple usage : `/programme/mma`, `/temoignages` (featured), homepage (entre Testimonials et FacilitatorBand).

**Assets** :
- `public/videos/testimonials/antoine-parcours.mp4` (H.264, 1080×1920 padded, 24 MB, CRF 25)
- `public/videos/testimonials/antoine-parcours.webm` (VP9, 1080×1920, 20 MB, CRF 32)
- `public/videos/testimonials/antoine-parcours-poster.jpg` (1080×1920, 72 KB)

**Single source of truth** : `src/data/antoine-parcours.ts` (assets + moments + 3 variants de copy mma/temoignages/home). Modifier la copy → toucher uniquement ce fichier.

**Composant** : `src/components/VerticalVideoSplit.tsx` (client, 293 lignes, réutilise `<VideoModal />` pour le plein écran).

**CSS** : section dédiée `/* Vertical Video Split */` en fin de `src/app/globals.css` (~490 lignes, classes préfixées `.vvs-`).

**Icônes ajoutées** : `volume-on`, `volume-off`, `fullscreen` dans `src/components/Icon.tsx` (RiVolumeUpFill, RiVolumeMuteFill, RiFullscreenLine).

**Fichiers touchés (intégration)** :
- `src/app/(site)/programme/mma/page.tsx` (entre PageHero et TldrBox)
- `src/app/(site)/temoignages/page.tsx` (avant VideoTestimonialsGrid + label séparateur "AUTRES TÉMOIGNAGES / INTERVIEWS FACE CAMÉRA")
- `src/app/(site)/page.tsx` (dynamic import entre Testimonials et FacilitatorBand)

**Perf** : Lighthouse mobile slow-4G médiane 3 runs sur `/programme/mma` = 83/100. LCP 4.3s (préexistant, hero image), TBT 10ms, CLS 0. Acceptable malgré 24 MB MP4 dans /public (lazy-load IO).

**Specs / plan** :
- Design : `docs/superpowers/specs/2026-05-26-video-antoine-parcours-mma-design.md`
- Plan : `docs/superpowers/plans/2026-05-26-video-antoine-parcours-mma.md`

---

## 🆕 BREAKING — 2026-05-14 (modèle commercial post-interview Ruslan + storytelling fondateur)

> **Décision David (post-interview Ruslan)** : alignement du discours sur l'interview Ruslan. Le **visa russe** est désormais inclus dans le package (frais consulaires + dossier + lettre d'invitation + questionnaire UE). Le **vol intérieur Istanbul-Caucase** reste inclus comme avant. Le **vol international jusqu'à Istanbul** reste à charge du candidat (réservation libre). Un **supplément MKR** s'applique pour les candidatures acceptées à moins de 30 jours du départ (traitement express).

**Modèle commercial final** :
- **Inclus dans le package** : visa russe + vol intérieur Istanbul-Caucase (MCX/GRV) + transferts + hébergement + 2 repas/jour + encadrement + suivi prépa.
- **À charge du candidat** : vol international jusqu'à Istanbul (IST ou SAW, doit arriver ≥4h avant le vol intérieur) + assurance voyage obligatoire + équipement personnel + dépenses personnelles.
- **Supplément MKR -30j** : montant forfaitaire pour candidatures à moins de 30 jours du départ. Couvre le traitement visa accéléré + sécurisation vol intérieur + coordination logistique. Documenté CGV Article 6 bis. MKR se réserve le droit de refuser une candidature à -30j si les délais administratifs ne peuvent être tenus.

**Articles CGV mis à jour** :
- Article 5 (Prestations incluses) ajoute le visa russe. Conserve le vol intérieur.
- Article 6 (Prestations non incluses) liste le vol international jusqu'à Istanbul + assurance + équipement + dépenses persos.
- Article 6 bis (NOUVEAU) — Supplément traitement express pour candidatures à -30j.

**JSON-LD `amenityFeature`** des 2 `SportsActivityLocation` (Daghestan + Tchétchénie) ajoute : "Visa russe inclus" en plus du vol intérieur déjà présent.

**Fichiers touchés (15)** : `data/site.ts` (SITE_DESCRIPTION), `data/faq.ts` (Q visa + Q inclus FAQ_HOMEPAGE + FAQ_CATEGORIES Logistique + Q délai 90j), `data/blog.ts` (FAQ blog l.264), `data/registration-types.ts` (commentaire haut), `components/Hero.tsx` (pill + subtitle), `components/CTAFinal.tsx` (label), `components/FacilitatorBand.tsx` (Visa Russie inclus + Vol intérieur item + sub + footnote + nouveau bloc `.facilitator-force` USP équipe France/référents), `components/Sessions.tsx` (session-price-sub), `components/PricingTable.tsx` (liste inclus/non inclus + mention -30j), `components/VoyageReveal.tsx` (3 steps + 3 badges), `components/Nav.tsx` (mega-camp-feature-body), `app/layout.tsx` (Person Ruslan + amenityFeature visa+vol intérieur + slogan Org + founder), `app/(site)/a-propos/page.tsx` (PageHero + section enrichie INSEP + Ruslan card 32 ans + nouveau bloc "Notre force"), `app/(site)/le-camp/page.tsx` (TldrBox + INCLUDES + NOT_INCLUDED + metadata), `app/(site)/sessions/page.tsx` (bandeau TOUT COMPRIS), `app/(site)/logistique/page.tsx` (PageHero + Budget table + INCLUS list + visa steps + vols section + mention -30j), `app/(site)/cgv/page.tsx` (Articles 5, 6 et nouveau 6 bis), `app/(site)/mkr-camp-2026/page.tsx` (TIMELINE), `app/(site)/familles/page.tsx` (l.92), `app/(site)/comment-ca-marche/page.tsx` (step 05 DÉPART), `app/globals.css` (`.facilitator-force` styles).

**Storytelling Ruslan ajouté** : Ruslan Mukhtarov, 32 ans, ancien équipe de France de lutte, INSEP olympique 2012-2016, lutte depuis 12 ans, MKR = diminutif de Mukhtarov (son nom). Tagline officielle : **"L'immersion au milieu des champions"** (intégrée à SITE_DESCRIPTION + Organization.slogan JSON-LD + CTAFinal label + PageHero /a-propos).

**Person JSON-LD `#person-ruslan`** ajouté à `app/layout.tsx` @graph : alumniOf INSEP, memberOf Équipe de France de lutte, jobTitle, knowsAbout, worksFor Organization, sameAs Instagram. Organization renvoie `founder` + `employee` vers cette Person + `slogan: "L'immersion au milieu des champions"`.

**À arbitrer ensuite** :
1. Montant exact du supplément -30j (grille graduée ou forfait unique).
2. Politique de remboursement si refus de visa par le consulat russe.

**Audit grep à relancer** si retouche modèle :
```
grep -i "vols aller-retour|Vols aller-retour"                  → doit être vide (rollback fait)
grep -i "vol international.{0,20}(inclus)"                     → doit être vide (rollback fait)
grep -i "aéroport européen de référence"                       → doit être vide (rollback fait)
```

---

## 🆕 BREAKING — 2026-05-12 (refonte form d'inscription : Step 0 « Le camp » avec cards visuelles + Groupe simplifié en 4 steps devis)

> **Décision David** : la PREMIÈRE question quand le candidat arrive sur `/inscription?type=session` doit être « quelle session + quelle discipline », avec une belle mise en page. Le tunnel `groupe` est entièrement repensé : c'est une **demande de devis**, pas une inscription classique. Pas de prix affiché, pas de qualif individuelle (santé / expérience personnelle). Ruslan recontacte le club avec une offre personnalisée.

**Pipeline d'inscription par tunnel** :

| Tunnel | Steps | Notes |
|---|---|---|
| `session` | 5 : Le camp · Identité · Expérience · Santé · Confirmation | Cards visuelles 4 sessions + 2 cards Lutte/MMA + 3 cards durée |
| `custom` | 5 : Le camp · Identité · Expérience · Santé · Confirmation | Step 0 = discipline (Lutte/MMA/Combo) + composition + dates + durée |
| `famille` | 5 : Le camp · Identité · Expérience · Santé · Confirmation | Step 0 = format (session ou sur-mesure) + enfants + conjoint + durée |
| `groupe` | **4** : Le camp · Ton club · Contact · Confirmation | **Demande de devis** : pas de santé/expérience individuelle, Ruslan recontacte |

**Constante centrale** : `STEPS_BY_TUNNEL: Record<RegistrationTypeId, readonly string[]>` exporté dans `InscriptionLayout.tsx`. `const STEPS = audience ? STEPS_BY_TUNNEL[audience] : STEPS_DEFAULT`.

**Step 0 famille — Hero icône (ajouté 2026-05-14)** :
- Nouveau composant `src/components/icons/IconFamille.tsx` (silhouette adulte + enfant, stroke-based, style aligné sur IconMMA).
- Affiché en haut du Step 0 famille dans un wrapper `.insc-famille-hero` (bandeau vert succès avec disque icône à gauche + label "TUNNEL FAMILLE" + titre + help). Remplace l'ancien `.insc-banner--success` simple texte.
- CSS dans `globals.css` ~l.7497 (avant `.insc-session-grid`) : `.insc-famille-hero`, `.insc-famille-hero-icon`, `.insc-famille-hero-content`, `.insc-famille-hero-label`, `.insc-famille-hero-title`, `.insc-famille-hero-help` + media query 540px.

**Step 0 « Le camp » — session (la PREMIÈRE question)** :
- Sous-section **1. Choisis ta session** : grid 4 cards (Été 2026 / Toussaint 2026 / Hiver 2027 / Pâques 2027). Chaque card affiche mois + saison + dates + intensité + compteur places dual (Lutte X/15 · MMA Y/15 live). Card active : bordure + halo `var(--primary)`.
- Sous-section **2. Choisis ta discipline** : 2 cards riches Lutte (gradient vert) / MMA (gradient orange). Chaque card a emoji, nom, destination, meta. Badge places live de la session choisie dans le coin. Si MMA + niveau < Avancé : alerte rouge inline.
- Sous-section **3. Combien de temps** : 3 cards durée (1 sem / 2 sem / 3 sem) avec prix Solo/Duo + sous-titre marketing.
- **Pré-remplissage URL** : `?session=paques-2027` → form.session = `paques-2027` auto-set dans `selectAudience()` ou via `initialSessionId` passé au constructor du component. La card correspondante reçoit `is-active`.

**Step 0 — groupe (demande de devis)** :
- Bandeau violet « Demande de devis personnalisé · aucun paiement à ce stade ».
- Section 1 : 3 cards discipline (Lutte / MMA / Combo sur devis pleine largeur).
- Section 2 : date début indicative + durée cible (modifiables en visio).
- Aucune mention de prix, aucun compteur places (groupe = devis hors capacité officielle).

**Tunnel groupe simplifié** (4 steps, pas 5) :
- **Step 1 « Ton club »** : nom club, nombre approximatif (5 / 6-10 / 11-20 / 20+), niveau global, disciplines pratiquées par le club, palmarès, lien (Insta/YouTube). **Pas** de certifs status ni restrictions (collecté après devis).
- **Step 2 « Contact »** : prenom/nom/email/tel + pays + ville + disponibilité appel cadrage Ruslan.
- **Step 3 « Confirmation »** : source découverte + brief libre (utile pour devis) + 1 seule checkbox `accepteConditions` qui autorise Ruslan à recontacter par email/téléphone/WhatsApp pour cadrer + devis.
- **Pas** de certifMedical ni de "pret" (sélection MKR). Le payload met ces champs à `null` pour groupe.
- **Pas** de Santé ni d'Expérience individuelle (santé collectée après acceptation du devis).

**CSS step 0** (`globals.css` lignes ~7415-7679) — nouvelles classes :
- `.insc-camp-step`, `.insc-camp-section`, `.insc-camp-section-num` (badge rond rouge numéroté), `.insc-camp-section-label`, `.insc-camp-section-help`
- `.insc-session-grid` (4 cols desktop / 2 cols ≤880px / 1 col ≤480px), `.insc-session-card`, `.insc-session-card-month/season/dates/intensity/places`
- `.insc-discipline-grid` (2 cols / 1 col ≤640px), `.insc-discipline-card`, variantes `--lutte` (gradient vert) et `--mma` (gradient orange). Badge places en absolute top-right.
- `.insc-duration-grid`, `.insc-duration-card` avec label/sub/price
- `.insc-sr` (visually-hidden pour les `<input type="radio">` cachés sous les cards-radio)

**Réorganisation des champs** :
- Ancien Step 3 "Logistique" (qui agrégeait session/discipline/composition/dates/ville/entretien/source/message) → SPLIT en :
  - Step 0 (Le camp) : session/discipline/composition/dates/durée/enfants
  - Step 1 (Identité, session/custom/famille) ou Step 2 (Contact, groupe) : ville + disponible_entretien
  - Step 4 (Confirmation, session/custom/famille) ou Step 3 (Confirmation, groupe) : source + message
- L'ancien Step 0 (Identité) devient Step 1.
- L'ancien Step 1 audience='groupe' (Qualif club) reste à step 1 mais renommé "Ton club" + ajout `nomClub`.
- L'ancien Step 2 audience='groupe' (Santé groupe) : **supprimé**.
- L'ancien Step 4 (Confirmation) : condition transformée en `(step === 4 && audience !== 'groupe') || (step === 3 && audience === 'groupe')` pour servir les 2 pipelines, avec rendu adaptatif (groupe : 1 seule case "accepte d'être recontacté pour devis" au lieu de 3).

**Validation** : refondue par step + par tunnel. Le pipeline `groupe` a une validation différente du pipeline standard. Niveau MMA bloquant déplacé à Step 2 (Expérience) puisque le niveau n'est connu qu'à ce step pour session/custom (en Step 0, on affiche un warning si le niveau est déjà renseigné via retour arrière).

**Payload backend** :
- `tunnel_type` : inchangé
- `camp_discipline` : `'lutte' | 'mma' | 'combo_quote' | null`. Pour `famille`, forcé à `'lutte'` côté serveur.
- `form_data.experience` : null pour `groupe`
- `form_data.sante` : null pour `groupe`
- `form_data.groupe` : objet pour `groupe` UNIQUEMENT, avec nom_club/nombre_participants/niveau_groupe/disciplines/palmares_club/lien_video. Plus de certifs_confirme/restrictions (déprécié).
- `form_data.confirmations.certif_medical/pret` : null pour `groupe`. `accepte_conditions` requis pour tous.

**Admin** :
- Liste : nouveau badge violet **« Devis à envoyer »** (icône edit) pour les candidatures `tunnel=groupe + status=recue`. Le badge "MMA · niveau à vérifier" n'apparaît plus pour groupe (puisque le niveau individuel n'est plus collecté).
- Détail (`/admin/inscriptions/[id]`) : bandeau violet en haut **« Demande de devis Club & Groupe — à contacter sous 48h »** affiché si `tunnel=groupe + status=recue`. Précise que la santé individuelle sera collectée après acceptation.
- Les sections santé/expérience individuelle ne s'affichent plus pour les candidatures `groupe` (car `form_data.experience` et `form_data.sante` sont `null`, donc le map `Object.entries(formData)` les skip).

**Pré-remplissage depuis le site** :
- `/inscription?type=session&session=paques-2027` → audience=session, form.session='paques-2027', Step 0 ouvert avec la card Pâques pré-sélectionnée. Le candidat n'a qu'à choisir Lutte/MMA et la durée.
- `/inscription?type=famille&session=toussaint-2026` → audience=famille, form.session='toussaint-2026', form.duree='3-semaines' par défaut.
- Toutes les pages du site (homepage Sessions card, mega-menu, /sessions cards, /familles, /mkr-camp-2026, etc.) construisent leurs liens avec `?type=X&session=Y`.

**À refaire dans une session future (non bloquant)** :
- StoryCard Instagram post-inscription pour afficher la discipline + session + destination.
- Email transactionnel (V2 Resend) avec template différent pour les demandes de devis groupe.
- Pour les Sur Mesure avec `campDiscipline='combo_quote'` : ajouter un champ texte "Combien de jours Daghestan / combien de jours Tchétchénie envisagés ?" en Step 0 pour faciliter le cadrage Ruslan.
- Test mobile dev tools pour valider la grille 4 cards sessions sur écrans ≤480px (passe en 1 col).

---

## 🆕 BREAKING — 2026-05-12 (15 Lutte + 15 MMA par session officielle + Combo Sur Mesure sur devis)

> **Décision David** : chaque session officielle a maintenant **2 capacités séparées** (15 Lutte au Daghestan + 15 MMA en Tchétchénie), au lieu de 15 globales. À l'inscription session, le candidat choisit Lutte OU MMA (exclusif). Le MMA exige un niveau Avancé minimum (form bloquant). Pour Sur Mesure / Club / Groupe, option "Combo Lutte + MMA" sur devis (séquentiel : X jours Daghestan + Y jours Tchétchénie). Famille forcé à Lutte.

**Modèle de capacité** :
- `data/sessions.ts` : `maxCapacity: number` → `maxCapacity: { lutte: number, mma: number }`. Toutes les sessions : `{ lutte: 15, mma: 15 }`. Type `CampDiscipline = 'lutte' | 'mma'` exporté.
- **Migration Supabase** `add_camp_discipline_column` (projet `bgwvrzgnoqlqqrvflwav`, eu-central-1) : colonne `camp_discipline text CHECK IN ('lutte','mma','combo_quote')` ajoutée à `candidatures`. Index partiel `idx_candidatures_session_discipline` sur `(session_id, camp_discipline)` filtré `tunnel_type='session' AND status IN ('recue','validee','soldee')`. NULL toléré pour les candidatures historiques.

**Comptage / API places** :
- `lib/places.ts` refondu : `getAllSessionPlaces()` retourne un nouveau shape `{ session_id, label, dates, lutte: {…}, mma: {…}, status, total_restantes, is_full }`. Compteurs séparés par discipline. Status global = `closed` si les 2 disciplines sont pleines, `limited` si total ≤ 6 ou si une discipline closed, sinon status de base.
- `api/places/route.ts` inchangé (passe-plat). `PlacesRestantes.tsx` accepte un nouveau prop `discipline?: 'lutte' | 'mma'` et un nouveau variant `'dual'` qui affiche 2 mini-pills côte à côte (Lutte 12/15 · MMA 8/15).

**Form `InscriptionLayout.tsx`** :
- Nouveau champ `campDiscipline: '' | 'lutte' | 'mma' | 'combo_quote'` dans `FormData`. Initial `''`. Forcé à `'lutte'` par `selectAudience()` pour le tunnel `famille`. Reset à `''` quand on change de tunnel.
- Step 3 (Logistique) : RadioGroup discipline en TÊTE pour `session`/`custom`/`groupe`. Pour `famille`, bandeau info "Camp Lutte au Daghestan" + lien vers Sur Mesure pour les cas atypiques.
  - Session : 2 options (Lutte Daghestan 15p · MMA Tchétchénie 15p, niveau Avancé min)
  - Custom : 3 options (Lutte / MMA / Combo Lutte+MMA sur devis)
  - Groupe : 3 options idem custom, mention adaptée club
- Validation step 3 :
  - `campDiscipline` obligatoire (sauf famille où forcé serveur)
  - Pour `session` : doit être `lutte` ou `mma` (pas combo)
  - Pour MMA : `niveau` doit être dans `MMA_ACCEPTED_LEVELS = {avance, competiteur-regional, competiteur-national, competiteur-international}`. Sinon erreur bloquante avec message clair pointant vers l'étape Expérience.
- Step 5 (récap) : nouvelle ligne "Camp" avec label complet (`Lutte · Daghestan` / `MMA · Tchétchénie` / `Combo Lutte + MMA (sur devis)`).
- Payload `/api/inscription` inclut `camp_discipline: 'lutte' | 'mma' | 'combo_quote' | null`.

**API `/api/inscription/route.ts`** :
- Accepte et valide `camp_discipline` selon le tunnel (cf. table ci-dessus).
- Pour `session` : check capacité atomique (via `getSessionPlaces(session_id)`) avant insert. Si la discipline choisie est pleine → 409 Conflict avec message "Session complète sur le camp X. Choisis une autre session ou l'autre discipline."
- Dedup étendu à `(candidate_id, tunnel_type, camp_discipline)`.
- Stocke `camp_discipline` en colonne dédiée (et plus en `form_data` jsonb).
- Notification Slack : ajoute ligne `Camp : 🤼 Lutte / 🥊 MMA / 🔀 Combo`.

**Admin** :
- `/admin/inscriptions` (liste) : nouvelle ligne de filtres "Discipline" (Toutes / Lutte / MMA / Combo) avec compteurs globaux. Pills session affichent désormais `L X/15 · M Y/15` au lieu d'un compteur global. Tooltip détaillé "Lutte X/15 (COMPLET?) · MMA Y/15 (COMPLET?) · Z places totales restantes".
- `InscriptionsList.tsx` : badge `camp_discipline` ajouté à chaque ligne (vert Lutte / orange MMA / violet Combo). Badge alerte `⚠ MMA · niveau à vérifier` si discipline=mma et status=recue.
- `/admin/inscriptions/[id]` : nouvelle ligne "Camp choisi" dans le panneau infos avec label complet (Daghestan/Tchétchénie/Devis).

**FAQ (`data/faq.ts`)** :
- FAQ_HOMEPAGE : nouvelles Q "Lutte ou MMA, comment je choisis ?" et "Quel niveau est exigé pour le camp MMA ?". Q existante "Où se déroule le camp" enrichie de "15 places Lutte + 15 places MMA".
- FAQ_CATEGORIES (Entrainement) : Q "MMA, lutte adultes, lutte enfants" enrichie. Nouvelle Q "Comment se passe le combo Lutte + MMA en Sur Mesure ?".

**Layout JSON-LD** :
- 2 `SportsActivityLocation` distincts (Daghestan + Tchétchénie) — déjà fait au 2026-05-12 BREAKING précédent.
- `maximumAttendeeCapacity` des Events = `lutte + mma` (= 30).
- Description Event : "15 places Lutte au Daghestan + 15 places MMA en Tchétchénie (exclusif)".

**À refaire dans une session future (non bloquant)** :
- Affiner la jauge `dual` mobile (peut overflow sur très petits écrans, à confirmer en dev tools).
- ✅ Fait 2026-05-24 : `StoryCard.tsx` prend `campDiscipline` et mappe vers destination + fond (Lutte→Daghestan, MMA→Tchétchénie, combo→Daghestan+Tchétchénie).
- Adapter email transactionnel (V2 Resend) avec mention discipline + destination dans l'objet.
- Logs admin : ajouter event `discipline_change` dans `audit_log` si Ruslan veut basculer une candidature Lutte → MMA en visio (rare mais possible).
- Au-delà de 11 personnes en Groupe ou cas spéciaux : ajouter un champ texte "Détails combo" pour préciser le split souhaité (Sur Mesure).

---

## 🆕 BREAKING — 2026-05-12 (refonte destinations + retrait Coaches/VideoSection)

> **Décision David** : pas de photos de coachs (les visuels AI ne correspondent pas à la réalité) → retrait complet de la section Coaches partout. Ajout de la Tchétchénie comme 2e destination (MMA) en complément du Daghestan (Lutte).

**Modèle nouveau** :
- **Lutte adultes + Lutte enfants** → camp au **Daghestan** (Makhachkala / Kaspiysk), vol intérieur Istanbul → MCX
- **MMA** → camp en **Tchétchénie** (Grozny), vol intérieur Istanbul → GRV
- Une session officielle = UNE destination par participant (selon discipline choisie à l'inscription)
- **Combo Daghestan + Tchétchénie** : possible UNIQUEMENT sur les inscriptions Sur Mesure

**Changements code** :
- `src/app/(site)/page.tsx` : retrait `<VideoSection />` et `<Coaches />` (homepage). Sections restantes : Hero · AudienceSwitcher · Testimonials · VoyageReveal · FacilitatorBand · Philosophie · DestinationShowcase · Sessions · Timeline · Contact · FAQ · CTAFinal (12 sections au lieu de 14).
- `src/components/VideoSection.tsx` reste dans le repo mais orphelin (peut être supprimé au prochain audit).
- `src/components/Coaches.tsx` et `src/data/coaches.ts` orphelins (idem).
- `src/app/(site)/coachs/page.tsx` → réécrit en redirect `redirect('/programme')` + `robots: noindex,nofollow`. Conserve la route active mais bascule tout le SEO vers Programme.
- **Nouvelle page** `src/app/(site)/destinations/tchetchenie/page.tsx` (miroir de `/destinations/dagestan` axé MMA, Grozny, Akhmat Fight Club, héritage Chimaev, mosquée Kadyrov, tours vaïnakh).
- `src/app/(site)/destinations/page.tsx` (hub) refondu en grid 2 cards + bloc "Combo sur-mesure".
- `src/components/Nav.tsx` : panel Destination → label "Destinations" (pluriel), 2 mega-dest-card côte à côte (Daghestan / Tchétchénie) + bloc "Combo Daghestan + Tchétchénie uniquement sur sur-mesure". Mega-prog-secondary : lien `/coachs` remplacé par `/temoignages`. Mobile : accordion Destination ajoute Tchétchénie et lien vue d'ensemble, accordion Programme retire `/coachs`, suffixes par destination ajoutés sur les liens disciplines.
- `src/components/Footer.tsx` : colonne Programmes retire "Nos coachs", ajoute "Daghestan · Lutte" et "Tchétchénie · MMA". Description footer mentionne les 2 destinations.
- `src/app/sitemap.ts` : retrait `/coachs`, ajout `/destinations/tchetchenie` (priority 0.85).
- `src/app/layout.tsx` JSON-LD : retrait import COACHES + retrait des entités Person + retrait `performer` des Events. Ajout d'une 2e `SportsActivityLocation` pour la Tchétchénie (GeoCoordinates Grozny 43.3168, 45.6981, sport MMA, vol Istanbul-Grozny). Events désormais `location: [{...dagestan}, {...tchetchenie}]`.
- `src/components/Hero.tsx` : subtitle "Lutte au Daghestan, MMA en Tchétchénie", stats : "2 Destinations" + "3 Disciplines" + "1-3 semaines" (remplace "9 coachs" et "8 athlètes"). CTA secondaire `/destinations` au lieu de `#video-section` (qui n'existe plus).
- `src/components/CTAFinal.tsx` : "Prochain camp · {dates} {year} · Daghestan (Lutte) ou Tchétchénie (MMA)".
- `src/components/DestinationShowcase.tsx` : 5 paysages alternant Daghestan / Tchétchénie / Caucase Nord, header "DAGHESTAN · TCHÉTCHÉNIE", chaque carte est désormais un `<Link>` vers la destination correspondante.
- `src/components/Sessions.tsx` (homepage) : subtitle "Lutte au Daghestan ou MMA en Tchétchénie selon la discipline choisie à l'inscription". Sub-price card mentionne "vol intérieur depuis Istanbul (Makhachkala pour Lutte ou Grozny pour MMA)".
- `src/components/VoyageReveal.tsx` : step 02 = "Istanbul → Makhachkala (Lutte) ou Grozny (MMA), vol intérieur inclus", step 03 = transfert variable selon destination.
- `src/components/FacilitatorBand.tsx` : item Vol intérieur, Transferts et Encadrement mentionnent les 2 destinations.
- `src/components/AudienceSwitcher.tsx` : sub mentionne "Lutte au Daghestan ou MMA en Tchétchénie".
- `src/components/Philosophie.tsx` : copy mentionne les 2 destinations.
- `src/components/GalerieContent.tsx` : alt photo `mosque-grozny.webp` corrigé (mosquée Akhmad Kadyrov, Grozny, Tchétchénie). Photo orphelin `coachs-salle.webp` reste comme image décorative (catégorie 'Coachs' visuelle, pas de lien).
- `src/data/sessions.ts` : type `destination` passe de `'Dagestan'` à `'Daghestan ou Tchétchénie'`. Toutes les sessions mises à jour. Session `aout-2026` renommée "CAMP CAUCASIEN" (plus "CAMP DAGHESTANAIS").
- `src/data/site.ts` : SITE_DESCRIPTION = "Camps d'entraînement MMA et Lutte au cœur du Caucase. Lutte adultes et enfants au Daghestan, MMA en Tchétchénie. Une discipline par camp. Immersion 1 à 3 semaines, encadrement local."
- `src/data/registration-types.ts` : descriptions Session, Custom, Famille mises à jour pour mentionner les 2 destinations + combo sur-mesure.
- `src/data/faq.ts` : FAQ_HOMEPAGE Q "Le visa", "Inclus", "Langue", dates des camps et nouvelle Q "Où se déroule le camp : Daghestan ou Tchétchénie ?". FAQ_CATEGORIES Q sécurité, visa, transfert, disciplines mises à jour.
- `src/app/(site)/sessions/page.tsx` : metadata + hero + INCLUDES coachs locaux ajustés. SESSIONS hardcoded `name` passe à "CAMP\nCAUCASIEN".
- `src/app/(site)/programme/page.tsx` : titre hero "TROIS DISCIPLINES. DEUX TERRES DU CAUCASE.", labels card "DISCIPLINE · TCHÉTCHÉNIE" / "DISCIPLINE · DAGHESTAN", ghostHref `/destinations` au lieu de `/coachs`.
- `src/app/(site)/programme/mma/page.tsx` : metadata "Tchétchénie", PageHero label "MMA · TCHÉTCHÉNIE", body "MMA EN TCHÉTCHÉNIE", SectionCTA `/destinations/tchetchenie`.
- `src/app/(site)/programme/lutte/page.tsx` : PageHero label "LUTTE · DAGHESTAN", subtitle Makhachkala / Kaspiysk, SectionCTA `/destinations/dagestan`.
- `src/app/(site)/programme/lutte-enfants/page.tsx` : PageHero label "JEUNESSE 8-17 ANS · DAGHESTAN".
- `src/app/(site)/le-camp/page.tsx` : metadata + PageHero subtitle mentionnent les 2 destinations.
- `src/app/(site)/sur-mesure/page.tsx` : nouvelle section "EXCLUSIVITÉ SUR MESURE / COMBINE DAGHESTAN ET TCHÉTCHÉNIE" en intro après PageHero, metadata et hero mis à jour.
- `src/app/(site)/logistique/page.tsx` : metadata, hero subtitle, step visa, vols (paragraphe intro Makhachkala/Grozny + cartes 3 villes adaptées), transferts (1h30 Makhachkala / 30 min Grozny), Infos pratiques (2 aéroports), langue (avar + tchétchène).
- `src/app/(site)/a-propos/page.tsx` : histoire mentionne les 2 destinations, salles partenaires : "Salle Lutte · Makhachkala", "Salle Lutte · Kaspiysk", "Salle MMA · Grozny".
- `src/app/globals.css` : nouvelle classe `.mega-dest-layout--dual` (grid 1fr 1fr 0.9fr desktop, 1fr 1fr tablet, 1fr mobile) + `.mega-dest-card--dual` (aspect 4/5).

**À refaire dans une session future (non bloquant)** :
- Générer des images Nanobanana propres pour Tchétchénie (paysages, salle MMA Grozny). Actuellement on réutilise `mosque-grozny.webp`, `vainakh-towers.webp`, `lake-kezenoy.webp`, `gym-interior.webp`, `sparring-mma-wall.webp`.
- Mettre à jour `clubs-groupes/page.tsx`, `mkr-camp-2026/page.tsx`, `familles/page.tsx`, `cgv/page.tsx` (Article 5), `blog/[slug]/page.tsx` (articles) pour propager la dualité.
- Supprimer ou archiver `VideoSection.tsx`, `Coaches.tsx`, `data/coaches.ts` (orphelins post-2026-05-12).
- Mettre à jour le formulaire d'inscription : déduire la destination depuis la discipline principale choisie, afficher dans le récap.

## 🆕 Changements 2026-05-12 (vrais témoignages vidéo + VideoModal)

- **Vidéos sources** dans `public/videos/testimonials/` :
  - `antoine-testimonie.mp4` (2.7 MB, 480×848, 60s, H.264 CRF 28, AAC 96k) + `antoine-poster.jpg`
  - `lamp-testimonie.mp4` (6.2 MB, 480×853, 108s, H.264 CRF 30, AAC 80k) + `lamp-poster.jpg`
- **Photo LAMP** : `public/images/testimonials/lamp-w.webp` (900×1200 portrait, ~55 KB, crop centré 3:4 depuis original 1:1). LAMP est le combattant à droite (rashguard Ratel Team violet/noir) aux côtés d'un Daghestanais en rouge ACA.
- **Type `Testimonial`** (data/testimonials.ts) : ajout champs optionnels `video` et `videoPoster`. Antoine wired sur sa vidéo, **LAMP ajouté en 2e position** avec quote dédiée "MMA pro · Session Daghestan".
- **Nouveau composant `VideoModal.tsx`** : overlay plein écran portrait 9:16, autoplay au open, controls natifs, fermeture ESC / click overlay / bouton X. Body scroll-lock, focus management. Réutilisable (modal vidéo de témoignage).
- **Nouveau composant `VideoTestimonialsGrid.tsx`** : client component pour la page `/temoignages` (la page reste server). 2 cards 9:16 avec poster + play button → ouvre `VideoModal`.
- **Composant `Testimonials.tsx` (homepage)** : si `testimonial.video` existe, le play button devient un `<button>` qui ouvre le modal. Sinon, plus de play button (la fausse icône SVG décorative `.testi-play` est supprimée du JSX, seul `.testi-play--btn` reste pour les cards avec vidéo).
- **Page `/temoignages`** : VIDEO_TESTIMONIALS passe de 4 fakes (`video-thumb-{1..4}.webp`) à **2 vraies vidéos** (Antoine + LAMP). Layout grid-2 conservé mais cards portrait 9:16 (aspectRatio + maxHeight 70vh).
- **CSS `globals.css`** : ajout section "Video Modal" (`.video-modal-*`, `.testi-play--btn`, `.video-card-play`) en fin de fichier.
- **Note assets** : les 4 anciens `video-thumb-{1..4}.webp` restent dans `public/images/testimonials/` (orphelins, supprimables au prochain audit images).



## 🆕 Changements 2026-05-11 (refonte grille tarifaire par paliers de groupe)

> **BREAKING (pricing)** : décision Ruslan. La grille publique passe d'un modèle 2D (adulte vs enfant × durée) à un modèle par taille de groupe (1-2 / 3-5 / 6-10 / 11+) + forfait dédié Parent + Enfant.

**Nouvelle grille** :
- **1 à 2 personnes** (Solo / Duo) : 1 490 / 2 290 / 2 790 € par adulte (1/2/3 sem)
- **3 à 5 personnes** (Trio à 5) : 1 390 / 1 990 / 2 690 € par adulte
- **6 à 10 personnes** (Club) : 1 290 / 1 790 / 2 390 € par adulte
- **11 personnes et plus / salle entière** : devis sur mesure
- **Forfait Famille (1 parent + 1 enfant inclus)** : 2 590 / 4 790 / 6 890 € selon durée
- **Enfant supplémentaire** : +790 / +1 580 / +2 370 € par semaine
- **Famille avec 2 parents participants** : 2 × tarif Solo/Duo (1 490 €/pers/sem) + 790 €/enfant/sem (le 1er enfant n'est plus inclus)

**Implémentation** :
- `data/pricing.ts` réécrit avec `PRICING_TIERS`, `FAMILY_PRICING`, `getTierForAdults()`, `pricePerAdult()`, `calculatePrice()`, `isOnQuote()`, `parseDuration()`, `priceBreakdown()`. Plus de `ADULT_PRICING` / `CHILD_PRICING`.
- `PricingTable.tsx` refondu : 3 cards paliers + bande "Sur devis" + section dédiée forfait Famille (forfait base + enfant supp).
- `InscriptionLayout.tsx` : ajout `conjointParticipe: boolean` au `FormData`, recap step 5 tarif dynamique (devis sur mesure si club 11+ ou groupe 6-10 → "à partir de"), nouvelle estimation famille live en step 3 avec breakdown.
- Tunnel `groupe` : options "5 personnes / 6-10 personnes / 11-20 (devis)" remplacent les anciens "5-9 / 10-15 / 16-20".
- Payload API `famille` : ajout `conjoint_participe` et `nombre_parents`.
- CSS `globals.css` : `.pricing-grid` passe à 3 cols desktop, 2 cols ≤960px, 1 col ≤720px. Nouvelle classe `.pricing-quote-band`.

**Pages mises à jour** :
- `/sessions` : SESSIONS[].price `à partir de 1 290 €`, section "TU VIENS AVEC TON CLUB ?" copy révisée, sub-price card mentionne Solo/Duo + Club + Famille.
- `/familles` : pilier "Tarifs famille publics" + étape 02 inscription = nouvelle formule.
- `/programme/lutte-enfants` : section "Pour les parents" = forfait famille (plus de tarif enfant isolé).
- `/programme` : section JEUNESSE mentionne forfait Famille au lieu de tarif enfant.
- `/mkr-camp-2026` : stats band `1 490` (au lieu de 1 500).
- `/sur-mesure` : stats band `1 390 € à partir de 3 pers`.
- `/clubs-groupes` : pilier "Tarif dégressif par tête" avec mention paliers Trio / Club / Devis.
- `/cgv` Article 3 : grille publique complète détaillée.
- `/logistique` : tableau budget = `1 290 - 2 790 € / pers` + nouvelle ligne `Forfait Famille 2 590 - 6 890 €`.
- `data/registration-types.ts` : longDescription Famille + Groupe mises à jour.
- `data/faq.ts` : 5 réponses révisées (tarif groupe, sessions, enfants, inscription famille, âge max).
- `data/sessions.ts` : `formatPriceFrom()` retourne `À partir de 1 490 €`.
- `components/Sessions.tsx` : sub-price card mentionne nouvelle grille.
- `components/admin/AdminActions.tsx` : référence pricing actualisée.

**Audit grep** (à relancer si retouche pricing) :
```
grep -E "1 ?500 ?€|2 ?200 ?€|2 ?900 ?€|1 ?000 ?€|1 ?400 ?€|1 ?900 ?€"   → doit être vide dans src/
grep -E "ADULT_PRICING|CHILD_PRICING"                                    → doit être vide
```

---

## 🆕 Changements 2026-05-02 (4 sessions officielles, calendrier 2026 / 2027)

- **3 nouvelles sessions officielles** ajoutées dans `data/sessions.ts` (jusqu'ici 1 seule, `aout-2026`) :
  - `toussaint-2026` — 17 octobre - 7 novembre 2026 (Toussaint FR + octobre CH + Toussaint BE)
  - `fevrier-2027` — 13 février - 6 mars 2027 (vacances d'hiver Zones A/B/C FR + relâche CH + carnaval BE)
  - `paques-2027` — 3 - 24 avril 2027 (vacances de printemps FR + Pâques CH + BE)
- **Helper** `getNextSession(now)` dans `data/sessions.ts` : retourne la prochaine session à venir. Utilisé par `CTAFinal` (qui n'est plus hardcodé).
- **Form `/inscription`** :
  - Accepte deux URL params : `?type=session|custom|famille|groupe` (existant) **et** `?session=<id>` (nouveau, pré-sélectionne la session)
  - `VALID_TYPES` corrigé pour inclure `famille` (oubli historique)
  - Step 3 audience='session' : input disabled remplacé par `<select>` listant les 4 sessions (`SESSIONS.map`)
  - Step 3 audience='famille' RadioGroup : 5 options (4 sessions + sur-mesure) au lieu de 2
  - Step 5 récap : affiche dynamiquement la session sélectionnée
  - `SESSION_MAP` (succès StoryCard) construit dynamiquement depuis `SESSIONS`
  - Payload `session_id` : utilise `form.session` si valide, sinon null
- **Page `/sessions`** : tableau hardcoded passe de 1 à 4 entrées. Hero "QUATRE SESSIONS, UN OBJECTIF". Subtitle mentionne vacances scolaires francophones. Chaque `<article>` a un `id={s.id}` + `scrollMarginTop` pour ancres `#toussaint-2026` etc.
- **Page `/mkr-camp-2026`** : flagship pour la session août — conservé. Section cross-sell repensée : nouvelle section "3 AUTRES SESSIONS OFFICIELLES" (cards Toussaint / Hiver / Pâques pointant vers `/sessions#<id>`) avant la section formats.
- **Composants homepage** :
  - `Sessions.tsx` : label "PROGRAMME 2026" → "CALENDRIER 2026 / 2027", titre "LES 4 SESSIONS", sous-titre vacances francophones. PostulerLink utilise `?type=session&session=${id}`.
  - `Hero.tsx` : carousel auto-renderé sur les 4 sessions (pas de changement code, lit `SESSIONS`). CTA carousel utilise `?type=session&session=${id}`.
  - `CTAFinal.tsx` : "Prochain camp · {dates} {year} · Daghestan" dynamique via `getNextSession()`. Sub-label affiche `${SESSIONS.length} sessions par an`.
- **Nav.tsx** :
  - Mega menu "Le Camp" : Col 2 affiche 4 sessions avec dates abrégées (Été / Toussaint / Hiver / Pâques) pointant vers `/mkr-camp-2026` (août) ou `/sessions#<id>` (autres). Col 3 renommée "Autres formats".
  - Menu mobile accordion "Le Camp" : 4 liens sessions + 4 liens formats + 3 liens préparation
- **`data/registration-types.ts`** : tunnel `session` description / longDescription / dates / cta / href mis à jour ("4 sessions par an", href `/sessions` au lieu de `/mkr-camp-2026`). `aout-2026` reste accessible via le card "MKR Camp 2026" sur la page `/sessions` (anchor `#aout-2026`).
- **`data/faq.ts`** :
  - `FAQ_HOMEPAGE` : nouvelle Q "Quelles sont les dates des prochains camps ?" listant les 4 sessions
  - `FAQ_CATEGORIES` (Inscription) : Q "4 types d'inscription" mise à jour pour pluraliser sessions ; nouvelle Q "Quelles sont les 4 sessions officielles 2026 / 2027 ?"
- **Pages cross-sell** (`/familles`, `/sur-mesure`, `/clubs-groupes`) : mentions "session 17 août - 5 sept" remplacées par "4 sessions par an" (calendrier 2026 / 2027). Page `/familles` : CTA "INSCRIRE MA FAMILLE (SESSION 17 AOÛT)" → "INSCRIRE MA FAMILLE" (le tunnel famille gère le choix de session côté form).

### Pour ajouter / modifier / supprimer une session

1. Modifier `data/sessions.ts` (source unique pour Hero carousel, Sessions homepage, form select, CTAFinal).
2. Modifier `app/(site)/sessions/page.tsx` : tableau `SESSIONS` hardcoded (cards visuelles).
3. Si l'ID change, mettre à jour les ancres dans `Nav.tsx` (mega menu + mobile) et `app/(site)/mkr-camp-2026/page.tsx` (cross-sell).
4. Ajouter / mettre à jour la mention dans `data/faq.ts` (homepage + categories).
5. **Pas besoin** de toucher : `Sessions.tsx`, `Hero.tsx`, `CTAFinal.tsx`, `InscriptionLayout.tsx` (tous lisent `data/sessions.ts`).

---

## 🆕 Changements 2026-05-04 (suppression du paiement Stripe / 100 €)

> **BREAKING** : décision Ruslan + David. On abandonne Stripe et les frais 100 € upfront. L'inscription redevient gratuite ; Ruslan valide chaque candidature manuellement en visio puis envoie le RIB pour un paiement intégral post-visio (virement bancaire ou espèces).

**Migration Supabase appliquée** : `drop_stripe_columns_add_manual_payment_fields`
- DROP : `registration_fee_cents`, `registration_fee_currency`, `registration_fee_paid_at`, `stripe_payment_intent_id`, `stripe_checkout_session_id`
- ADD : `payment_method` (CHECK virement/cash/autre), `payment_date` (date)
- KEEP : `package_amount_cents`, `package_paid_at`

**Code mis à jour** :
- `src/lib/admin-transitions.ts` : `TRANSITION_REMINDER` réécrits (envoi RIB, vérif virement, refund manuel grille CGV).
- `src/components/admin/AdminActions.tsx` : retire toggle « Frais 100€ payés », ajoute select méthode + input date paiement.
- `src/components/admin/InscriptionsList.tsx` + `app/admin/inscriptions/[id]/page.tsx` + `app/admin/inscriptions/page.tsx` : query nettoyée, badge simplifié, section paiement refactor.
- `src/app/api/admin/candidature/[id]/route.ts` : retire handler `fee_paid`, ajoute `payment_method` + `payment_date`.
- Pages publiques : suppression de toutes les mentions Stripe / PayPal / acompte 30 % (CGV, comment-ca-marche, sessions, familles, sur-mesure, clubs-groupes, mkr-camp-2026, merci, faq.ts, Timeline.tsx).

**Spec** : `PLAN_GESTION_INSCRIPTIONS.md` a une bannière BREAKING CHANGE en haut + sections §1.1, §1.3, §1.7, §3.2, §4.2, §7.1 révisées.

---

## 🆕 Changements 2026-05-02 (backend Supabase v1 — capture des candidatures)

- **Projet Supabase** `mkr-inscriptions` (id `bgwvrzgnoqlqqrvflwav`, eu-central-1) — voir spec complète dans [`PLAN_GESTION_INSCRIPTIONS.md`](./PLAN_GESTION_INSCRIPTIONS.md).
- **3 tables** : `candidates` (déduplique par email), `candidatures` (form_data jsonb, status enum, paiement post-visio en colonnes `package_amount_cents` / `package_paid_at` / `payment_method` / `payment_date`), `audit_log` (append-only).
- **API route** `POST /api/inscription` (`src/app/api/inscription/route.ts`) : valide payload, upsert candidate, insert candidature en status `recue`, insère audit_log + Slack webhook fire-and-forget. Retourne `{ ok, candidatureId }`.
- **Lib serveur** `src/lib/supabase-admin.ts` : client Supabase service_role (cached, pas de session).
- **InscriptionLayout** branché sur l'API (`handleSubmit` async, fetch POST, états `isSubmitting` + `submitError`, bouton désactivé pendant envoi).
- **Page admin** `/admin/inscriptions` : protégée par cookie httpOnly + `ADMIN_TOKEN` (proxy.ts). Kanban list + filtres tunnel + status + session, recherche client-side. Page détail `/admin/inscriptions/[id]` avec mutations status + saisie manuelle paiement (montant + méthode + date) + notes admin/visio + timeline audit_log.
- **Env vars requises** : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_TOKEN` + optionnel `SLACK_WEBHOOK_URL` + `NEXT_PUBLIC_SITE_URL`.
- **Dépendance ajoutée** : `@supabase/supabase-js` (^2.105).

### Backlog V2 (optionnel, plus de bloquant côté Stripe)

- **Resend transactional** (emails à Ruslan + au candidat) → besoin de domaine `mkrcamp.com` vérifié (SPF + DKIM + DMARC).
- **Tables additionnelles** : `waitlist`, `session_capacity`, vue `v_session_places` — pour la capacité live 15 places.
- **Vercel Cron** : alerte 7j sans visio, cleanup, etc.
- **Multi-admin** : Supabase Auth (email/pwd ou Magic Link) à la place du cookie partagé `ADMIN_TOKEN`.

### Anti-patterns à respecter (rappel des audits 2026-04-30 / 05-01)

- **Slugs URL ASCII uniquement** : `/preparer-son-camp` (pas `/préparer`). Les routes Next.js mappent au filesystem.
- **Clés d'objet ASCII uniquement** : `coach.experience` (pas `coach.expérience`). Sinon `undefined` au runtime.
- **IDs FAQ catégories ASCII** : labels avec accents OK, ids slug = ASCII.
- **Tarifs en EUR partout** (plus en CHF) post-pivot facilitateur.

---

## 🆕 Changements 2026-04-30 (post-pivot facilitateur, logique 4 tunnels nettoyée)

- **4 tunnels d'inscription** : `/inscription?type=session|custom|famille|groupe`
  - **MKR Camp 2026** : adultes uniquement, 17/08-05/09 verrouillé
  - **Sur Mesure** : 1 à 4 adultes (Solo/Duo/Trio/Quatuor), tes dates, 90j min
  - **Famille** : parent + enfant 8-17 obligatoire, sub-choix session ou sur mesure
  - **Club & Groupe** : 5 à 20 personnes, devis sur mesure
- **Pas de duplication famille** : le tunnel Famille est obligatoire pour partir avec un enfant
- **Nouvelle page** : `/familles` (camp parent + enfant)
- **Nouveaux data files** : `data/pricing.ts` (grille fixe), `data/registration-types.ts` (4 types)
- **Nouveaux composants** : `<AudienceSwitcher />`, `<PricingTable />`, `<FacilitatorBand />` (homepage)
- **Photos kids** : 4 HEIC convertis + 3 nouvelles Nanobanana (kids-coach-cercle, parent-enfant-tapis, kids-sparring-encadre)
- **InscriptionLayout** refactor : Step 0 sélecteur + Step 3 adaptatif par tunnel + tarif live
- **Footer** : col "Inscriptions" 4 liens + col "Programmes" enrichie
- **Mega menu Le Camp** : 4 inscriptions affichées
- **Menu mobile** : accordion "S'inscrire" 4 liens
- **Page `/programme`** : section S&C remplacée par section Jeunesse 8-17
- **Mega menu Programme** : 3e card S&C remplacée par card JEUNESSE
- **Hero subtitle** : élargi "Solo, en famille ou en club. MKR organise tout"
- **CGV** : Article 10 nouveau "Mineurs et autorisation parentale"

---

## 0 — Architecture rapide

```
mkrcamp.com/
├── src/app/
│   ├── layout.tsx               → root layout (JSON-LD Organization + SportsActivityLocation)
│   ├── inscription/page.tsx     → page /inscription (HORS group `(site)`)
│   ├── sitemap.ts               → sitemap.xml (28 URLs)
│   ├── robots.ts                → robots.txt
│   ├── api/
│   │   └── inscription/route.ts → POST /api/inscription (Supabase upsert candidate + insert candidature)
│   ├── admin/
│   │   └── inscriptions/page.tsx → /admin/inscriptions?token=XXX (read-only liste 200 dossiers, token-protégé)
│   └── (site)/                  → group route avec layout commun
│       ├── layout.tsx           → wrap Nav + Footer + StickyMobileCTA
│       ├── page.tsx             → /  (homepage, sections dynamic-imported)
│       └── [25 dossiers/page.tsx] → toutes les autres URLs
├── src/components/  (36 fichiers .tsx)
├── src/data/        (6 fichiers .ts — single sources of truth)
├── src/lib/         (supabase-admin.ts — client service_role serveur)
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
**Sections (ordre)** : (mis à jour 2026-05-12 : refonte AIDA/StoryBrand — Philosophie + Destinations remontés avant Témoignages, Voyage repoussé après la rassurance, FAQ avant Contact)
1. `<Hero />` — vidéos en boucle + carousel sessions inline (Attention)
2. `<AudienceSwitcher />` — 4 cards "Pour qui ?" (session/custom/famille/groupe) (segmentation)
3. `<Philosophie />` — bento "POURQUOI LE CAUCASE" (3 cards) (Why / aspiration)
4. `<DestinationShowcase />` — grid 4 paysages (matérialisation visuelle du rêve)
5. `<Testimonials />` — carousel TÉMOIGNAGES (data/testimonials.ts) (preuve sociale)
6. **`<VerticalVideoSplit />`** — vidéo verticale Antoine parcours 54s (preuve sociale visuelle, ajouté 2026-05-26)
7. `<FacilitatorBand />` — "MKR organise tout" 6 prestations (lever objection "c'est compliqué")
7. `<VoyageReveal />` — "Comment y aller" : trajet Istanbul→Makhachkala + transfert 1h30 (logistique concrète)
8. `<Sessions />` — cards depuis `data/sessions.ts` (passage à l'action : "quand")
9. `<Timeline />` — 5 étapes parcours (Postuler → Validation → Préparation → Voyage → Immersion) ("comment je m'inscris")
10. `<FAQ />` — top 6 questions (data/faq.ts FAQ_HOMEPAGE) (lever les dernières objections)
11. `<Contact />` — bloc info contact (téléphone, email, instagram) (alternative pour ceux qui veulent parler)
12. `<CTAFinal />` — "Prochain camp · {dates}" + montagne SVG (action finale)
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
**Sections** : PageHero · **VerticalVideoSplit (Antoine parcours, ajouté 2026-05-26)** · Description split · CinematicReveal · Techniques grid-3x2 · Session timeline · SectionCTA `/sessions` + `/programme/lutte`

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
**Sections (ordre 2026-05-14)** : PageHero "VIENS T'ENTRAÎNER EN FAMILLE" · CinematicReveal `priere-collective-mkr.webp` "L'HÉRITAGE SE TRANSMET" · Description split (kids-alignes + Antoine portrait) · PILLARS grid-3x2 · Section sécurité split (kids-course-flou-1) · 3 témoignages parents · `<PricingTable />` complet · 3-step process inscription (sans CTA inline) · SectionCTA `/inscription?type=famille`
**Métadonnées** : title canonical /familles · description 8-17 ans avec parent
**Important** : utilise `<PricingTable withHeader={true} />` (réutilisable)
**Changement 2026-05-14** : témoignages remontés AVANT pricing (preuve sociale avant le prix), CTA dupliqués du process supprimés, SectionCTA href corrigé `?type=famille` (était `?type=session`).

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
- `STEPS` (l.~14) : 6 étapes — 1.Inscription 5min · 2.Appel 48h · 3.**Paiement post-visio** (RIB envoyé après validation, virement/espèces) · 4.Guide · 5.Départ · 6.Camp **1 à 3 semaines**
- `PROCESS_FAQ` (l.53) : 4 Q/R sur le processus
**Sections** : PageHero · CinematicReveal · Process flow (6 divs alternés) · Politique annulation (>60j 100%, 30-60j 50%, <30j 0%) · Moyens paiement grid-3 (Virement / Espèces / Autre) · `<FAQAccordion>` · SectionCTA

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
**Sections** : PageHero · **VerticalVideoSplit (Antoine parcours featured, ajouté 2026-05-26)** · Label séparateur "AUTRES TÉMOIGNAGES / INTERVIEWS FACE CAMÉRA" · VideoTestimonialsGrid (Antoine interview + LAMP) · Témoignages écrits grid-3 · Stats · SectionCTA

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
- `ARTICLES_MAP` (l.16) : Record<slug, Article> avec content HTML inline. Les 6 slugs du `/blog` sont tous mappés et présents dans `sitemap.ts` BLOG_SLUGS. Vérifié 2026-05-02.
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
- Logistique : **session** ('aout-2026' uniquement maintenant), **duree** (1/2/3 semaines, plus de "1 mois"), villeDepart
- Méta : sourceDecouverte, message, certifMedical, accepteConditions, pret
**Validations** : par step (l.94)
**Submit success** : génère `<StoryCard />` Instagram téléchargeable (avec `SESSION_MAP` l.~145 → 1 entrée actuellement)
**Pour ajouter une session** : modifier (1) `data/sessions.ts`, (2) options select l.~445, (3) `SESSION_MAP` l.~145

---

### 📞 `/contact` — Contact
**Fichier** : `src/app/(site)/contact/page.tsx`
**Composant** : `<ContactForm />` (formulaire simple : Nom, Email, Sujet [select], Message)
**Sujets disponibles** (ContactForm.tsx) : general, partenariat, clubs, presse, autre
**Coordonnées affichées** : email contact@mkrcamp.com · WhatsApp **+33 6 66 17 76 91** (wa.me/33666177691) · Instagram @mkrcamp

---

### ℹ️ `/a-propos` — Notre histoire
**Fichier** : `src/app/(site)/a-propos/page.tsx`
**Sections (refonte 2026-05-23 — vraies photos Ruslan)** : PageHero · POURQUOI MKR EXISTE (texte) · CinematicReveal HÉRITAGE · MISSION (quote) · QUI SOMMES-NOUS (slider triple casquette + bio + "EN FRANCE / SUR PLACE") · **PARCOURS · DU TAPIS FRANÇAIS AUX SALLES DU CAUCASE (galerie 4 photos)** · SALLES PARTENAIRES · SectionCTA
**Composant clé** : `<RuslanRevealSlider />` (client component) — slider before/after drag + keyboard, photo chemise noire ↔ photo Superman R, raconte la triple casquette Tchétchène + Daghestan + INSEP.

---

### 📥 `/guide-caucase` — Guide PDF gratuit (Daghestan + Tchétchénie)
**Fichier** : `src/app/(site)/guide-caucase/page.tsx`
**Migration 2026-05-14** : ancienne route `/guide-dagestan` supprimée + redirect 301 dans `next.config.ts`. Le guide couvre désormais les 2 destinations (Daghestan/Lutte + Tchétchénie/MMA).
**Tableaux locaux** : `GUIDE_CONTENTS` (6 items : Visa, Vols, Budget, Prep, Équipement, Culture), `PERSONAS` (3 micro-personas Solo/Famille/Club), `FAQ_QUICK` (4 Q/R), `TESTIMONIAL_QUICK` (2 quotes)
**Composant** : `<GuideForm />` async (fetch POST `/api/guide-caucase`, capture Supabase `guide_leads`, retourne `downloadUrl`, auto-open PDF en nouvel onglet, fallback bouton, honeypot, UTM tracking via `useSearchParams`)
**Sections** : PageHero · Mockup open-book + form (layout split GUIDE_CONTENTS + form sticky) · CinematicReveal "DEUX TERRES DE COMBAT" · Pour qui c'est (3 personas) · Sneak peek (3 thumbnails) · 2 témoignages courts · FAQ rapide (4 Q/R) · Form sticky bas
**JSON-LD** : `DigitalDocument` ajouté (lead magnet declarable)
**PDF source** : `docs/guide-caucase/guide.html` + `docs/guide-caucase/styles/print.css` + `docs/guide-caucase/build.sh` (WeasyPrint 68.1)
**PDF livré** : `public/guide-caucase.pdf` (20 pages A4 portrait, 2.2 MB, palette MKR)
**Backend** : route `POST /api/guide-caucase` (`src/app/api/guide-caucase/route.ts`) → table Supabase `guide_leads` (projet `bgwvrzgnoqlqqrvflwav`)
**Images** : 5 visuels landing (`public/images/guide-caucase/`) + 7 chapter openers (`public/images/guide-caucase/pdf-internal/`)

---

### 🙏 `/merci` — Confirmation candidature
**Fichier** : `src/app/(site)/merci/page.tsx`
**Métadonnées** : `robots: { index: false }`
**Sections** : Icon check · CANDIDATURE REÇUE · 3 étapes prochaines (Appel 48h, Validation+paiement post-visio, Guide) · 2 boutons retour

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
| `AudienceSwitcher.tsx` | 4 cards "Pour qui ?" — entre VideoSection et FacilitatorBand | `data/registration-types.ts` |
| `FacilitatorBand.tsx` | "MKR organise tout" — 6 prestations (visa, vol, transferts, héberg., repas, encadrement) | hardcoded FACILITATOR_ITEMS |
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
SITE_URL = 'https://mkrcamp.com'
SITE_NAME = 'MKR Caucasian Camp'
SITE_EMAIL = 'contact@mkrcamp.com'
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
| – | villeDepart, sourceDecouverte, message | optionnel |
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
| **Logo** | `public/logo-white.webp` (Nav, SiteLoader, StoryCard) · `public/logo-{dark,light,transparent,white}.png` haute-res · `public/images/logo-mkr.png` (JSON-LD Organization). Source : `brand-identity/LOGO/mkr-cmc-{fullcolor,white}.png`. Anciens logos loup+aigle dans `public/_old-logos-loup-aigle/` |
| **Favicon / icônes** | `src/app/favicon.ico` (multi-tailles 16/32/48 — Google + navigateurs) · `src/app/icon.png` (512×512 — auto-link Next.js) · `src/app/apple-icon.png` (180×180 — iOS) · `public/icons/icon-{192,512}.png` + `icon-maskable-512.png` (PWA Android) · `src/app/manifest.ts` (servi à `/manifest.webmanifest`) · déclaration explicite dans `metadata.icons` + `metadata.manifest` (`src/app/layout.tsx`) |
| **Coordonnées contact (téléphone, email)** | `components/Contact.tsx` (homepage) + `app/(site)/contact/page.tsx` + `app/(site)/sessions/page.tsx:195` (WhatsApp groupes) + `data/site.ts` (SITE_EMAIL) |
| **Hero homepage (titre/subtitle)** | `components/Hero.tsx` lignes 160-170 |
| **Hero stats (2 destinations / 3 disciplines / 1-3 semaines)** | `components/Hero.tsx` l.175-188 |
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
| **Vidéos hero** | Boucle 2 vidéos : `public/videos/hero-mountains.mp4` (3.5s) puis MKR core qui joue en entier avant retour montagne. Desktop : `hero-mkr-core.mp4` (55s, cycle 58.5s). Mobile ≤700px : `hero-mkr-core-vertical.mp4` (720x1280, 45.5s, cycle 49s). Switch desktop/mobile via matchMedia dans `components/Hero.tsx`. Posters JPG `hero-*-poster.jpg` évitent l'écran noir avant `canplay`. Pexels village/forest/clouds gardés sur disque mais non utilisés. |
| **Vidéo Antoine parcours (3 surfaces)** | `src/data/antoine-parcours.ts` (single source : assets + moments + 3 variants mma/temoignages/home). Composant : `src/components/VerticalVideoSplit.tsx`. Assets : `public/videos/testimonials/antoine-parcours.{mp4,webm,jpg}`. Pour changer la copy, toucher uniquement le data file. |

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
| `components/Nav.tsx` | mega-camp panel | label "Session MKR 2026 · 17 août" (lien vers `/mkr-camp-2026`) |
**Composants dynamiques (auto-mise à jour)** : `Sessions.tsx` (homepage), `Hero.tsx` (carousel) lisent `data/sessions.ts`.
**⚠️** Si on ajoute/modifie/supprime une session : toucher au minimum les 4 endroits hardcodés.

> **Note refacto mega menu (2026-05-02)** : panel Le Camp restructuré en 3 colonnes (Feature / Formats / Préparer ma venue). L'ancien `mega-camp-accent` (box visuelle "SESSION OFFICIELLE") a été supprimé pour éviter le doublon avec le 1er lien de la liste. Mobile : 4 accordions (Le Camp, Programme, Destination, Découvrir) au lieu de 5, suppression du doublon "Famille". Logistique + Guide PDF déplacés du panel "Infos" vers "Destination". Inscription retirée du panel (CTA POSTULER suffit).

### Stats hero (1-3 semaines / 2 destinations / 3 disciplines)
> Décision 2026-05-20 : retrait définitif des chiffres "9 coachs / 8 athlètes" partout. On ne publie plus de nombre exact de coachs (le nombre fluctue par session). Remplacé par "coachs locaux" ou "coachs daghestanais et tchétchènes en poste à l'année".

| Fichier | Ligne | Forme |
|---|---|---|
| `components/Hero.tsx` | 175-188 | hero-stats homepage : "2 Destinations" + "3 Disciplines" + "1-3 semaines" (audit OK 2026-05-20) |
| `components/VideoSection.tsx` | 11, 45-48 | orphelin post-2026-05-12, peut être supprimé |
| `app/(site)/temoignages/page.tsx` | ~138-148 | stats-band à auditer si "9 coachs" encore présent |
| `app/(site)/programme/page.tsx` | ~28-39 | stats-band (2 sessions/jour / 6 jours / 3 disciplines) |
| `app/(site)/page.tsx` | 19 | metadata description |
| `app/(site)/coachs/page.tsx` | 9 | page redirect, metadata désormais générique |
| `components/Philosophie.tsx` | 25 | "ce séjour au Caucase (1 à 3 semaines)" |
| `components/Timeline.tsx` | 143 | "Une à trois semaines au Caucase" |
| `app/(site)/familles/page.tsx` | 92 | "encadrement par des coachs locaux expérimentés" (corrigé 2026-05-20) |
**⚠️** Si jamais on rebascule sur un chiffre de coachs (ex: 11 coachs), modifier ces 9 endroits + Instagram CAPTIONS.md + 4 caption.md individuels + manifest.mjs.

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

### Modèle de paiement (post-visio, virement / cash, pas de Stripe)
> Révision 2026-05-04. Si on rebranche un paiement upfront un jour, retoucher TOUS ces fichiers.

| Fichier | Forme |
|---|---|
| `app/(site)/cgv/page.tsx` | Article 3 « Tarifs et paiement » |
| `app/(site)/comment-ca-marche/page.tsx` | étape 03 + FAQ « Quand est-ce que je paye ? » + grid 3 moyens (Virement/Espèces/Autre) |
| `app/(site)/sessions/page.tsx` | section MODALITÉS PAIEMENT + reassurance « Sans paiement initial » |
| `app/(site)/familles/page.tsx` | étape 03 « Validation et paiement » |
| `app/(site)/sur-mesure/page.tsx` | étape 03 PROCESS |
| `app/(site)/clubs-groupes/page.tsx` | étape 04 PROCESS |
| `app/(site)/mkr-camp-2026/page.tsx` | TIMELINE J-60 « Visio + paiement » |
| `app/(site)/merci/page.tsx` | étape 02 « Validation et paiement » |
| `data/faq.ts` | 3 réponses (processus, annulation, moyens) — FAQ_CATEGORIES Inscription |
| `components/Timeline.tsx` | étape 03 homepage « Visio validée, package réglé par virement » |

### Email contact
| Fichier | Forme |
|---|---|
| `data/site.ts` | SITE_EMAIL = 'contact@mkrcamp.com' |
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

### Tarifs publics (grille par taille de groupe + forfait Famille — refonte 2026-05-11)

> **Propagation 100% dynamique** depuis 2026-05-11 : changer un nombre dans `data/pricing.ts` → toutes les pages re-bake automatiquement au prochain `next build`. Aucun chiffre n'est répété en dur dans le runtime (les commentaires JSDoc d'`pricing.ts` et `pricing-copy.ts` ne sont que de la doc).

**Source unique technique** : `data/pricing.ts` (`PRICING_TIERS`, `FAMILY_PRICING`, helpers `getTierForAdults`, `pricePerAdult`, `calculatePrice`, `isOnQuote`, `parseDuration`)

**Source unique marketing copy** : `lib/pricing-copy.ts` (`MIN_PRICE_PER_ADULT_LABEL`, `SOLO_PRICE_1WEEK_LABEL`, `DUO_ONE_LINE_BARE`, `TRIO_ONE_LINE_BARE`, `CLUB_ONE_LINE_BARE`, `FAMILY_BASE_PROSE`, `FAMILY_BASE_1WEEK_LABEL`, `FAMILY_BASE_RANGE_LABEL`, `FAMILY_EXTRA_CHILD_1WEEK_LABEL`, `FAMILY_EXTRA_CHILD_FULL`, `PACKAGE_PER_ADULT_RANGE_LABEL`, `ADMIN_SOLO_DUO_HINT`, `FAMILY_FORFAIT_DETAIL`, `FAMILY_FORFAIT_TEASER`, `PRICING_GRID_PROSE`, `pricePerAdultLabel(adults, weeks)`) — toutes les phrases marketing dérivées de `pricing.ts`.

**Pour changer un prix demain** : éditer UNIQUEMENT `data/pricing.ts`. Lancer `rm -rf .next && npx next build`. Toutes les pages, FAQ, CGV, registration types, admin dashboard, hero stats, sub-prices se mettent à jour automatiquement.
| Fichier | Forme |
|---|---|
| `data/pricing.ts` | source of truth complète (4 paliers groupe + forfait Famille + enfant supp) |
| `components/PricingTable.tsx` | composant réutilisable (sur `/sessions`, `/familles`, `/mkr-camp-2026`) |
| `components/InscriptionLayout.tsx` | options select durée tarifées dynamiquement, estimation famille live (step 3), recap step 5 via `calculatePrice()` + checkbox `conjointParticipe` |
| `app/(site)/sessions/page.tsx` | sub-price cards + section "TU VIENS AVEC TON CLUB ?" |
| `app/(site)/familles/page.tsx` | pilier tarifs + étape 02 inscription |
| `app/(site)/programme/lutte-enfants/page.tsx` | section "Pour les parents" (forfait Famille) |
| `app/(site)/programme/page.tsx` | section JEUNESSE |
| `app/(site)/mkr-camp-2026/page.tsx` | stats band 1 490 € |
| `app/(site)/sur-mesure/page.tsx` | stats band 1 390 € à partir de 3 pers |
| `app/(site)/clubs-groupes/page.tsx` | pilier tarif dégressif |
| `app/(site)/cgv/page.tsx` | Article 3 grille publique complète |
| `app/(site)/logistique/page.tsx` | tableau budget par adulte + ligne forfait Famille |
| `data/registration-types.ts` | longDescription Famille et Groupe |
| `data/faq.ts` | 5 Q/R tarifs (groupe, sessions, enfants, inscription famille, âge max) |
| `data/sessions.ts` | helper `formatPriceFrom()` retourne `À partir de 1 490 €` |
| `components/Sessions.tsx` (homepage) | sub-price card |
| `components/admin/AdminActions.tsx` | hint montant package |
**⚠️** Si on change un tarif : modifier UNIQUEMENT `data/pricing.ts`. La plupart des autres endroits propagent. Les pages textuelles avec mention de chiffres en dur (CGV, FAQ, hero stats, sessions sub-price) doivent être retouchées séparément, voir la liste exhaustive ci-dessus.

### Codes de recommandation + liens d'affiliation (ajouté 2026-05-23, étendu 2026-06-12)

**Source unique** : `src/data/referral-codes.ts` (6 partenaires : STRIKE, ZEZE74, RAKHIM86, TENGIZ, MMASPIRIT en `flat` 50€ + PAOLOZ en `percent` 10% + helpers `findReferralCode`, `getActiveCodes`, `getPartnersWithSourceOption`, `findCodeBySourceValue`, `computeCommissionEur`, `affiliateLink`)

**2 modèles de commission par partenaire** (champ `commissionType`) :
- `flat` : forfait fixe `bonusEur` (50€), figé à l'inscription. Salles/coachs.
- `percent` : `commissionPct` % du CA encaissé (`package_amount_cents`). Influenceurs (PaoloZ = 10%). Le montant euro n'est PAS connu à l'inscription (CA inconnu) : il est calculé à la transition `soldee` et recalculé si Ruslan édite le CA. Stocké dans `referral_bonus_eur` (montant payable canonique → le dashboard d'agrégation marche sans changement).

**Liens d'affiliation** (ajouté 2026-06-12) : `affiliateLink(code)` → `https://mkrcamp.com/?ref=<code>`. `proxy.ts` valide le `?ref` (findReferralCode, insensible casse) et pose le cookie `mkr_ref` (90j depuis 2026-06-15, SameSite=Lax, secure en prod, lisible JS). Last-touch. Un `?ref` inconnu/inactif est ignoré (pas de cookie). Le cookie pré-remplit le code dans le formulaire (le bandeau de confiance site-wide a été retiré le 2026-06-15).

| Fichier | Forme |
|---|---|
| `data/referral-codes.ts` | source of truth, `ReferralCode` (commissionType flat/percent, bonusEur?, commissionPct?), helpers `computeCommissionEur(partner, packageAmountCents)` + `affiliateLink(code)` + `SITE_BASE_URL` |
| `proxy.ts` | capture `?ref` valide → cookie `mkr_ref` (helper `applyReferralCapture`, branche pages publiques uniquement, pas admin/api) |
| `components/ReferralBanner.tsx` | bandeau de confiance site-wide « Tu viens de la part de X » (FR+EN `common.referral_banner`), dismissable (sessionStorage `mkr_ref_banner_dismissed`), monté dans `[locale]/layout.tsx` dans le NextIntlClientProvider au-dessus du Nav, Icon `x` |
| `components/InscriptionLayout.tsx` | useEffect lit cookie `mkr_ref` au montage → pré-remplit `codeRecommandation` + synchronise `sourceDecouverte` (n'écrase pas un choix candidat). Le feedback vert « Recommandé par X » existant s'affiche automatiquement |
| `app/api/inscription/route.ts` | snapshot `referral_commission_type`/`referral_commission_pct` ; `referral_bonus_eur` = bonusEur pour flat, null pour percent |
| `app/api/admin/candidature/[id]/route.ts` | trigger auto `pending → due` à `soldee` + calcul % du CA (computeCommissionEur) ; recalcul à l'édition de `package_amount_cents` (sauf payout figé paid/cancelled, et jamais de mise à null si CA=0) ; audit `referral_bonus_recomputed`. `→ cancelled` sur `annulee`/`refusee` |
| `app/admin/inscriptions/[id]/page.tsx` | SELECT + commission_type/pct, `<ReferralPanel />` reçoit referralCommissionType/Pct + packageAmountCents |
| `components/admin/ReferralPanel.tsx` | lignes « Modèle » (Forfait fixe / X % du CA encaissé) + « Commission » (montant € ou « CA à saisir » si percent sans CA, + détail `P % × CA €`) |
| `app/admin/referrals/page.tsx` | colonne « Modèle » + garde-fou orange « ⚠ N CA à saisir » (percent soldée/due sans CA) + bloc `<ReferralLinks>` en tête |
| `components/admin/ReferralLinks.tsx` | nouveau : liens d'affiliation prêts à copier par partenaire actif (bouton Copier, navigator.clipboard) |
| `tests/affiliate/ref-capture.spec.ts` | e2e Playwright (projet `affiliate`, `npm run test:affiliate`) : ?ref→cookie→bandeau→persistance. Requiert dev server |
| Supabase `candidatures` | + 2 colonnes : `referral_commission_type` (text check flat/percent), `referral_commission_pct` (numeric). Migration `add_referral_commission_model` (projet bgwvrzgnoqlqqrvflwav) |

**Lifecycle status** :
- `not_applicable` : pas de code ou code invalide saisi.
- `pending` : code valide, candidature en cours.
- `due` : candidature `soldee`, commission à payer (50€ flat, ou X% du CA si CA saisi sinon « CA à saisir »).
- `paid` : payé (date + méthode renseignées dans l'admin).
- `cancelled` : candidature annulée ou refusée, commission annulée.

**Ajouter un partenaire forfait** : éditer `data/referral-codes.ts` (`commissionType: 'flat', bonusEur: N`) + commit + push + Vercel redeploy.
**Ajouter un influenceur %** : éditer `data/referral-codes.ts` (`commissionType: 'percent', commissionPct: N`) + commit + push + redeploy. Son lien = `mkrcamp.com/?ref=<code>` (récupérable via le bloc « Liens d'affiliation » dans `/admin/referrals`).
**Désactiver un code** : `active: false` (historique préservé).
Le `partnerName` + le modèle de commission sont snapshotés à l'inscription, donc une modif ultérieure du data file n'affecte pas l'historique.

**Audit log events** : `referral_attached`, `referral_due` (trigger soldee), `referral_bonus_recomputed` (recalcul % sur édition CA), `referral_cancelled`, `referral_payout_status_change` / `_paid_at_change` / `_method_change` (mutations manuelles admin).

### 4 types d'inscription (session / custom / famille / groupe)
**Source unique** : `data/registration-types.ts` (REGISTRATION_TYPES)
**Logique nettoyée 2026-04-30** : pas de duplication famille — chaque tunnel a sa cible précise.

| Tunnel | Cible | Composition | Dates | Durée |
|---|---|---|---|---|
| `session` MKR Camp 2026 | Adultes uniquement (recommandé) | 1 à 15 adultes | Fenêtre session officielle (4 par an) | 1, 2 ou 3 sem au choix |
| `custom` Sur Mesure | Adultes uniquement | 1 à 4 (Solo/Duo/Trio/Quatuor) | Tes dates, 90j min | 1, 2 ou 3 sem au choix |
| `famille` Famille | Parent + enfant 8-17 obligatoire | 1+ parent + 1+ enfant (max 6) | Sub-choix session OU sur mesure | 1, 2 ou 3 sem au choix |
| `groupe` Club & Groupe | Club/groupe organisé | 5 à 20 personnes | Tes dates, 90j min | 1, 2 ou 3 sem au choix |

| Fichier | Forme |
|---|---|
| `data/registration-types.ts` | 4 objets RegistrationType avec id, label, badge, description, image, etc. |
| `components/AudienceSwitcher.tsx` | composant avec 4 cards photo (grid 4 col desktop / 2x2 tablet / 1 col mobile) |
| `components/InscriptionLayout.tsx` | sélecteur Step 0 + state `audience` + step 3 adaptatif par tunnel |
| `app/inscription/page.tsx` | parse `?type=session\|custom\|famille\|groupe` et passe `initialAudience` |
| `app/(site)/page.tsx` (homepage) | `<AudienceSwitcher />` entre VideoSection et FacilitatorBand |
| `app/(site)/sessions/page.tsx` | `<AudienceSwitcher withHeader={false} />` après PageHero |
| `components/Nav.tsx` | mega-camp panel (4 liens) + menu mobile "S'inscrire" accordion (4 liens) |
| `components/Footer.tsx` | colonne "Inscriptions" (4 liens) |
**⚠️** Si on change un wording : modifier UNIQUEMENT `data/registration-types.ts`. Le reste propage.

**Spécificités tunnel `famille`** :
- Pré-remplissage automatique : `vientAvecFamille=true`, `session=<prochaine session>`, `duree='3-semaines'` (modifiable)
- Sub-choix radio en step 3 : "Rejoindre une session officielle" OU "Camp famille sur mesure"
- Durée au choix dans tous les cas : 1, 2 ou 3 semaines (select dédié). Plus de durée fixe pour la sous-option "session officielle".
- Si sur mesure : date picker + durée libres
- Champs `nombreEnfants` et `enfantsAges` obligatoires
- Tarif calculé live : 1 parent (1500/2200/2900 selon durée) + N enfants (1000/1400/1900 selon durée)

**Spécificités tunnel `custom`** :
- Sélecteur "Composition" obligatoire : Solo (1) / Duo (2) / Trio (3) / Quatuor (4)
- Tarif calculé : composition × tarif durée
- Si user veut venir avec enfant : note redirection vers Famille (pas d'option famille ici)

**Spécificités tunnel `session`** :
- Date verrouillée sur la fenêtre de session officielle choisie (Été 2026, Toussaint 2026, Hiver 2027 ou Pâques 2027)
- Durée au choix : 1, 2 ou 3 semaines (au sein de la fenêtre de 3 semaines de la session). Plus de durée verrouillée. Tarif live (1500/2200/2900 EUR adulte) affiché dans le select.
- Note redirection vers Famille si user a un enfant à inscrire (pas d'option famille ici)

**Spécificités tunnel `groupe`** :
- Nombre participants min 5 (les 2-4 sont basculés sur Sur Mesure)
- Champs : nom club, nombre participants, niveau groupe, date début, durée
- Pas de calcul tarif (devis sur mesure)

### Camp Famille (parent + enfant 8-17)
| Fichier | Rôle |
|---|---|
| `app/(site)/familles/page.tsx` | page dédiée complète |
| `app/(site)/programme/lutte-enfants/page.tsx` | section "Pour les parents" rassurante |
| `components/InscriptionLayout.tsx` | option "Tu viens avec ta famille ?" + champs nombreEnfants/enfantsAges |
| `components/Footer.tsx` | lien "Camp Famille" col Programmes |
| `components/Nav.tsx` | menu mobile accordion Programme |
| `app/sitemap.ts` | URL `/familles` priority 0.85 |

### Guide Caucase (lead magnet PDF 20 pages, mai 2026)
| Fichier | Forme |
|---|---|
| `src/app/(site)/guide-caucase/page.tsx` | landing page enrichie (mockup, personas, sneak peek, FAQ, témoignages, form sticky) |
| `src/app/api/guide-caucase/route.ts` | API POST capture lead Supabase `guide_leads` + Slack notif |
| `src/components/GuideForm.tsx` | form async honeypot UTM, ouvre PDF instant + fallback bouton download |
| `src/lib/supabase-admin.ts` | client Supabase service_role (réutilisé depuis `/api/inscription`) |
| `next.config.ts` | redirect 301 `/guide-dagestan` → `/guide-caucase` |
| `src/app/sitemap.ts` | URL `/guide-caucase` priority 0.6 |
| `src/app/(site)/logistique/page.tsx` | SectionCTA ghostHref `/guide-caucase` |
| `src/app/(site)/preparer-son-camp/page.tsx` | CTA inline + SectionCTA ghostHref `/guide-caucase` |
| `src/components/Nav.tsx` | mega menu Destination + menu mobile accordion |
| `public/guide-caucase.pdf` | livrable PDF 20 pages, 2.2 MB, servi statiquement |
| `docs/guide-caucase/guide.html` | source HTML du PDF |
| `docs/guide-caucase/styles/print.css` | CSS print A4 portrait avec palette MKR |
| `docs/guide-caucase/build.sh` | script weasyprint pour rebuild |
| `public/images/guide-caucase/*.webp` | 5 visuels landing (cover, mockup, 3 thumbnails) |
| `public/images/guide-caucase/pdf-internal/*.webp` | 7 chapter openers PDF |
| Supabase table `guide_leads` (projet `bgwvrzgnoqlqqrvflwav`) | capture leads, unique index (email, source) |
**⚠️** Si on rebuild le PDF, lancer `./docs/guide-caucase/build.sh` puis commit le nouveau `public/guide-caucase.pdf`.
**⚠️** `SUPABASE_SERVICE_ROLE_KEY` est vide dans `.env.local` local : l'API fonctionne uniquement en prod Vercel ou avec la clé renseignée.

### Photos Ruslan fondateur (vraies, ajoutées 2026-05-23)
**Dossier** : `public/images/ruslan/` (racine, pas dans un sous-dossier)
| Photo | Source | Usage |
|---|---|---|
| `ruslan-portrait-chemise-noire.webp` | 702×840 portrait, costume noir sous arbre | Slider /a-propos "AVANT" + carte FONDATEUR — utiliser partout où on veut le côté manager/entrepreneur |
| `ruslan-superman-reveal.webp` | 1198×1198 square, ouvre veste sur t-shirt "R" Superman | Slider /a-propos "APRÈS" — usage exclusif slider triple casquette pour l'instant |
| `ruslan-championnat-france-takedown.webp` | 1600×1066, singlet bleu "FRA LUTTE" en pleine action UWW | Galerie /a-propos PARCOURS · pourrait aller sur /coachs ou /programme/lutte |
| `ruslan-championnat-france-ffl.webp` | 1600×1066, singlet bleu FFL face adversaire rouge, scoreboard "MOUKHTAROV R." | Galerie /a-propos PARCOURS · preuve équipe France |
| `ruslan-lutte-clinch-nb.webp` | 716×1074 portrait N&B, clinch combat | Galerie /a-propos PARCOURS |
| `ruslan-entrainement-besancon.webp` | 635×635 N&B, projection aérienne salle Besançon | Galerie /a-propos PARCOURS · pourrait aller sur /programme/lutte |
| `ruslan-asics-equipe-france.webp` | 304×456 petit portrait veste Asics France | Usage limité (résolution faible) · thumb ou badge équipe France |
**Règle** : ces photos sont les VRAIES photos de Ruslan (validées 2026-05-23). À privilégier sur tout placeholder AI / coach AI-généré. L'ancien `/images/coaches/ruslan.webp` (généré AI) reste sur disque mais n'est plus référencé.

### Photos Ruslan — mapping audience/page (collection MKR)
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

1. **2 destinations** : Daghestan (Lutte adultes + Lutte enfants, vol Istanbul-Makhachkala) et Tchétchénie (MMA, vol Istanbul-Grozny). Une session officielle = une destination par participant. Combo Daghestan + Tchétchénie uniquement en Sur Mesure. *(refonte 2026-05-12, remplace l'ancienne règle "pas de Tchétchénie")*
2. **3 disciplines proposées** : Lutte adultes, Lutte enfants, MMA. **Pas** Boxe ni Sambo en discipline proposée. Les coachs Boxe/Sambo restent affichés sur `/coachs` (background).
3. **Camp 1 à 3 semaines** dans la copy publique (pas "3 semaines" en absolu).
4. **Pas de chiffre de coachs publié** (décision 2026-05-20). On dit "coachs locaux" ou "coachs daghestanais et tchétchènes en poste à l'année", jamais un nombre exact (le nombre fluctue selon la session).
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
15. **Pas de paiement upfront, pas de Stripe, pas de PayPal, pas d'acompte 30 %** (révision 2026-05-04). L'inscription en ligne est gratuite. Validation manuelle Ruslan en visio puis paiement intégral du package par **virement bancaire ou espèces** (RIB envoyé manuellement post-visio). Toutes les pages publiques doivent suivre cette logique.

---

## 8 — Workflow recommandé pour modifier une page

1. **Lis ce SITEMAP.md** d'abord pour repérer le ou les fichiers concernés.
2. **Pour les changements de contenu CEO** (téléphone, sessions, disciplines, horaires, repas, etc.) : aller directement à **§6bis Propagation Map** et toucher TOUS les endroits listés pour cette info, sinon une page restera incohérente.
3. **Pour les autres changements** : utiliser §6 Quick lookup pour identifier le fichier.
4. **Identifie les single sources of truth** : si la donnée est dans `data/`, modifie-y en priorité ; puis répète dans les tableaux hardcodés des pages.
5. **Audit grep automatique** avant de finir : pour les règles CEO, lancer ces greps pour confirmer 0 résidu (sur `src/` uniquement, hors commentaires admin internes) :
   ```
   grep -i "tchetch|grozny|GRV"           → doit être vide
   grep "3 repas|trois repas"             → doit être vide
   grep "2-3 heures|2 a 3 heures"         → doit être vide
   grep "240+|240 \+"                     → doit être vide
   grep "wa\.me/41|XXXXXXXXX"             → doit être vide
   grep "PRINTEMPS GEORGIEN|GÉORGIEN"     → doit être vide
   grep -i "stripe|paypal|acompte"        → doit être vide (révision 2026-05-04)
   grep -i "carte bancaire|mastercard"    → doit être vide (révision 2026-05-04)
   grep -i "frais d'inscription|100\s*€"  → ne doit apparaître que dans les commentaires admin legacy archive
   ```
6. **Toujours `rm -rf .next && npx next build`** après modification structurelle pour confirmer 35 routes statiques OK.
7. **Vérifie la propagation Nav/Footer/mobile** — c'est l'erreur classique : modifier un texte sur une page mais l'oublier dans le mega menu desktop, dans le menu mobile, dans le footer. Toujours vérifier ces 3 surfaces transverses.
8. **Mettre à jour ce SITEMAP.md** si la structure a changé (nouvelle page, suppression, refactor important, ou ajout d'un endroit où une info CEO apparaît).

---

### Vidéo Antoine parcours (composant `VerticalVideoSplit`, ajouté 2026-05-26)
| Fichier | Forme |
|---|---|
| `src/data/antoine-parcours.ts` | source unique — assets + 5 moments + 3 variants copy |
| `src/components/VerticalVideoSplit.tsx` | composant client (autoplay mute IO, sound toggle, timeline sync, modal) |
| `src/components/VideoModal.tsx` | réutilisé pour clic plein écran (déjà existant) |
| `src/components/Icon.tsx` | ajouts `volume-on` / `volume-off` / `fullscreen` |
| `src/app/globals.css` | section `/* Vertical Video Split */` en fin de fichier (~490 lignes, `.vvs-*`) |
| `src/app/(site)/programme/mma/page.tsx` | usage variant `mma` après PageHero |
| `src/app/(site)/temoignages/page.tsx` | usage variant `temoignages` avant VideoTestimonialsGrid + label séparateur |
| `src/app/(site)/page.tsx` | usage variant `home` dynamic-importé entre Testimonials et FacilitatorBand |
| `public/videos/testimonials/antoine-parcours.{mp4,webm,jpg}` | 3 assets vidéo (24 MB MP4, 20 MB WebM, 72 KB poster) |
**⚠️** Si on change la copy d'une variant, modifier uniquement `data/antoine-parcours.ts`. Si on change les timestamps des moments (actuellement indicatifs : 06/18/31/42/50s), idem. Pour remplacer la vidéo entièrement : ré-encoder les 3 assets via ffmpeg `pad=1080:1920:0:3:black` (source 1080×1914) — cf. plan `docs/superpowers/plans/2026-05-26-video-antoine-parcours-mma.md` tâche 1.

---

*Dernière régénération : 2026-05-26 — ajout VerticalVideoSplit + data/antoine-parcours.ts + assets vidéo Antoine parcours (3 surfaces : MMA, temoignages, home).*
