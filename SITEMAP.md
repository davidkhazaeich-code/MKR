# SITEMAP MKR Caucasian Camp — Cartographie complète

> **Fichier de référence pour Claude Code.** Mise à jour : 2026-07-13 (admin : audit UX/UI complet du back office + fixes).
> Lis ce fichier en priorité avant toute intervention sur le site MKR. Il évite de re-explorer.

## 🆕 2026-07-13 (admin : audit UX/UI complet du back office + fixes fonctionnels, commit 2c3deb7)

> **Demande David** : audit complet du back office pour le meilleur UX/UI possible, fluide, rapide, parfaitement fonctionnel, en autonomie. Audit livré via le skill impeccable (5 dimensions), corrections poussées en prod, QA Playwright avant/après sur mkrcamp.com/admin.

**Bugs corrigés** :
1. **Badge cassé partout** (`ui/Badge.tsx`) : `${color}1a` invalide quand color est un `var(--x)` → fond transparent + bordure 100% saturée (vérifié computed style en prod). Fix `color-mix(in srgb, color 10%/25%, transparent)`. Tout badge doit passer par ce composant.
2. **404 dossier avalée** (`inscriptions/[id]/page.tsx`) : `notFound()` était DANS le try/catch → « Configuration manquante : NEXT_HTTP_ERROR_FALLBACK;404 ». Déplacé hors try + nouveau **`src/app/admin/not-found.tsx`** (404 admin stylée). Ne jamais appeler notFound() dans un try qui catch tout.
3. **FAB « Actions » visible en desktop** : `.adm-fab` défini APRÈS `.adm-hide-desktop` gagnait à spécificité égale (même pattern que `feedback_fx_grid_clobbers_sticky`). Règle explicite `@media (min-width:1024px){.adm-fab{display:none}}`.
4. **Perte de notes admin/visio** : autosave débounce 900ms annulé si départ de page immédiat (Esc, retour liste) → flush `fetch keepalive` à l'unmount + `pagehide` (`AdminActions.tsx`).
5. **Overflow horizontal 2px mobile** : `.adm-filter-row` margin -1rem vs gutter 0.85rem → gouttière unifiée `--adm-gutter` sur `.adm-container` (0.85/1/2rem selon breakpoint).
6. **Messages multi-lignes des modales écrasés** : `.adm-modal-message` passe en `white-space: pre-line` (récaps contrat/relance construits avec \n).
7. **Stagger de liste mort** : `animationDelay` était sur le `<li>`, pas sur `.adm-list-item` animé → passé au `<Link>` via prop.

**UX / vitesse** :
- Filtres liste en `<Link>` (soft nav RSC) au lieu de `<a>` full reload + **skeletons `loading.tsx`** sur les 4 écrans (`inscriptions`, `[id]`, `referrals`, `guide-leads`) : la navigation admin est instantanée avec feedback (`.adm-skeleton` shimmer dans admin.css).
- **Nav sections dans la Topbar** (`ui/Topbar.tsx`, prop `nav: 'inscriptions'|'referrals'|'guide-leads'`) : onglets Candidatures / Referral / Leads guide avec état actif (`aria-current`). Le breadcrumb (prop `crumbs`) reste pour la fiche détail. Les anciens liens texte du h-meta sont retirés.
- `ReferralPanel` : `router.refresh()` + toast au lieu de `window.location.reload()` ; commission percent affiche une **projection** quand le CA est connu (« ~321 € estimée, figée à la soldée ») au lieu du faux « CA à saisir ».
- Fiche : date de naissance formatée + **âge calculé** (`formatBirthDate`), « Montant à définir » au lieu de « — € (montant à définir) ».

**Design system** :
- **`/admin/guide-leads` rebâti sur le DS admin** : il utilisait des tokens inexistants (`--adm-accent` #E11D2A rouge hors charte, `--adm-surface-2` slate), une classe fantôme `.adm-filter-chip` (zéro CSS, padding 0) et Roboto Condensed jamais chargée. Désormais : Topbar nav, `.adm-pill` pour les sources, export CSV en pill discrète, table `.adm-table`, badge EN par lead, empty state standard.
- **Styles table partagés** `.adm-table` / `.adm-table-wrap` / `.adm-table-num` / `.adm-table-mono` dans admin.css — referrals ET guide-leads convergent dessus. Toute future table admin doit les utiliser.
- Palette type partenaire harmonisée liste ↔ referrals (gym vert #4ade80, influenceur violet #a78bfa, coach orange #f59e0b).
- Copy : « **Club et Groupe** » partout (aligné sur `messages/fr/data.registration-types.json`, règle sans esperluette), em dashes → « · », emoji ⚠️ retiré des modales, « cookie 90 jours » (valeur réelle de proxy.ts, disait 60).
- A11y : `role=progressbar` sur la barre paiement, styles `:disabled` inputs/textarea/select, cibles tactiles 44px étendues à `.adm-btn`/`.adm-action-btn`, `aria-busy` sur les skeletons.
- **PRODUCT.md** ajouté à la racine (contexte design du repo : registre brand pour le site public, product pour /admin).

**Vérifs** : `tsc` 0 erreur · i18n-check 2815 clés (admin FR inline, aucun `messages/**`) · `next build` compile vert · QA Playwright prod avant/après (badges teintés OK, 404 « Dossier introuvable » OK, nav topbar OK, export CSV 200 text/csv, 0 overflow 390px, FAB masqué desktop / visible mobile, modale pre-line OK). Aucun endpoint API modifié.

**Dette notée (non bloquante)** : recherche liste limitée aux 200 dossiers chargés (OK au volume actuel) ; barres latérales de statut conservées volontairement (signature visuelle assumée) ; `SUPABASE_SERVICE_ROLE_KEY` reste vide en `.env.local` local → l'admin ne tourne qu'en prod (clé à coller depuis Supabase Studio pour du dev local).

## 🆕 2026-07-10 (home allégée : grille des paysages « DEUX TERRES DU CAUCASE » déplacée vers /destinations)

> **Demande David** : la section `DestinationShowcase` (eyebrow « DEUX TERRES DU CAUCASE » + titre « DAGHESTAN · TCHÉTCHÉNIE » + grille de 5 paysages) prenait trop de place sur la home → déplacée sur le hub `/destinations`, **version épurée** (sans le titre en double, le hero du hub affiche déjà « DEUX TERRES DU CAUCASE »).

**Fichiers touchés** :
- `src/app/[locale]/(site)/page.tsx` : retrait de l'import dynamique + du rendu `<DestinationShowcase />` (et de son `data-scroll-section` « Les destinations »). Ordre home devient Philosophie → Témoignages.
- `src/app/[locale]/(site)/destinations/page.tsx` : import + `<DestinationShowcase />` inséré **entre la section `dest-hub`** (2 cartes + combo note) **et le comparatif**.
- `src/components/DestinationShowcase.tsx` : namespace `home.destination_showcase` → `destinations.root.showcase` ; header réduit au seul eyebrow (`<h2>` titre + subtitle + footer CTA `explore_cta` retirés) ; `aria-labelledby` → `aria-label` ; carte `kezenoy` (lac frontalier) pointe désormais vers `/sur-mesure` (le combo) au lieu de `/destinations` (page courante).
- `messages/{fr,en}/home.json` : bloc `destination_showcase` **retiré**.
- `messages/{fr,en}/destinations.json` : bloc `root.showcase` **ajouté** = nouvel eyebrow `label` (« LE CAUCASE EN IMAGES » / « THE CAUCASUS IN PICTURES ») + les 5 `landscapes` déplacés **verbatim**.

**CSS inchangé** : les classes `.dest-showcase-*` et `#destination-showcase` (globals.css) sont réutilisées telles quelles. ⚠️ `#destination-showcase` masque encore les cartes 3-5 en ≤480px (`nth-child(n+3){display:none}`, optimisation héritée de la home) — à relâcher si on veut les 5 paysages en mobile sur la page destinations.

**QA** : `tsc --noEmit` 0 erreur · `i18n-check` 2815 clés FR=EN · `next build --experimental-build-mode compile` OK.

## 🆕 2026-07-10 (témoignages : refonte des cartes vidéo « Interviews face caméra » — cadre portrait serré, centré, responsive)

> **Demande David** : sur `/temoignages`, l'affichage des vidéos était mauvais (« encadrement trop large et non responsif »). **Cause racine** : `VideoTestimonialsGrid` rendait les vidéos **portrait 9/16** dans une `.grid-2` (2 colonnes ~50% de `.inner`, ~560px) via des `.content-card` paddées, avec `aspectRatio: 9/16` + `maxHeight: 70vh` inline. Le `max-height` rétrécissait la **largeur** du média (~403px) sous celle de sa colonne (~525px) tout en le laissant **aligné à gauche** (la grille ne centrait pas) → grand **vide sombre à droite** de chaque carte = le « cadre trop large ». En prime, le poster portait `.section-photo-img` (règle globale **paysage 16/10** + `width: calc(100% + 4rem)` + marges négatives, pensée pour des images qui débordent le padding d'une content-card) qui parasitait le rendu.

**Fix (composant + CSS + i18n, aucune donnée, aucune migration)** :
- **`src/components/VideoTestimonialsGrid.tsx`** réécrit : plus de `.grid-2`/`.content-card`/`.section-photo-img`/styles inline. Structure `<figure class="vtg-card">` → `.vtg-media` (9/16) contenant `.vtg-poster` + `.vtg-badge` + bouton `.video-card-play` avec `.vtg-play-circle`, puis `<figcaption class="vtg-meta">` (nom + discipline).
- **`src/app/globals.css`** : bloc « Video Testimonials grid » (remplace l'ancien `.video-card-play`). `.vtg-grid` = `display:flex; flex-wrap:wrap; justify-content:center` (2 cartes **centrées** desktop, 1 colonne centrée mobile). `.vtg-card { flex: 0 1 300px; max-width:100% }` (jamais `width:100%` en flex sinon 1 carte/rangée). `.vtg-media` aspect-ratio 9/16 **sans** max-height (le ratio tient tout seul), bord + ombre + radius 16px, scrims haut/bas uniquement (centre libre pour le play). Bouton play circulaire 64px (hover → orange + scale, `prefers-reduced-motion` respecté).
- **i18n** : `alt`/`aria-label` étaient **hardcodés FR** (interdit AGENTS.md, fuyaient sur `/en/testimonials`) → clés `temoignages.video_section.video_alt` + `play_aria` (param ICU `{name}`, FR+EN), construites côté page serveur dans `VIDEO_ITEMS` et passées au composant.

**Le featured `VerticalVideoSplit` (Antoine) est resté inchangé** (déjà correct : `.vvs-media` centre son `.vvs-frame`, pas de vide latéral).

**Vérifs (Playwright headless isolé, profil MCP verrouillé par session parallèle)** : `/temoignages` à 1440/1180/390/320 → média **9/16 exact (ratio 0.563)**, **deadspace = 0**, **0 overflow horizontal**, cartes centrées. `/en/testimonials` 200 + alt/aria bien en anglais. `tsc` sans nouvelle erreur, `i18n-check` 2819 clés OK, `next build --experimental-build-mode compile` vert.

## 🆕 2026-07-09 (galerie : bug « images par-dessus les filtres » corrigé + refonte UX/UI responsive)

> **Bug rapporté David** : sur `/galerie`, les images se positionnaient PAR-DESSUS la barre de filtres. **Cause racine** (confirmée navigateur, style calculé) : la section était `<section className="galerie-section fx-grid">`. La règle générique `.fx-grid > * { position: relative; z-index: 1 }` (globals.css) a la **même spécificité (0,1,0)** que `.galerie-filters-bar { position: sticky; z-index: 290 }` mais est **définie plus bas** → elle gagne et rétrograde la barre en `position: relative; z-index: 1`. Du coup (a) la barre n'était plus sticky, (b) son `top: 72px` (offset sticky) **décalait la barre relative de 72px vers le bas dans la 1re rangée d'images**, et (c) à z-index égal, la grille (plus loin dans le DOM) peignait par-dessus. Un seul sélecteur générique causait tout. Voir memory `feedback_fx_grid_clobbers_sticky`.

**Fichiers touchés** : `src/components/GalerieContent.tsx`, `src/app/globals.css` (bloc galerie), `messages/{fr,en}/galerie.json` (3 clés vidéos).

**Corrections + refonte** (David a choisi : masonry ratios naturels + placeholder vidéos soigné) :
1. **Fix racine** : retrait de `fx-grid` sur `.galerie-section` (la texture diagonale était invisible derrière les images plein cadre) → plus aucun `.fx-grid > *` pour clobber. Barre = `position: sticky; top: var(--nav-h); z-index: 20` (sous le header fixe z-300, au-dessus de la grille). Cartes : suppression des hacks `z-index: 0` / `isolation` devenus inutiles.
2. **État « stuck »** : remplacement du `ScrollTrigger` (qui lisait `self.scroll() > 8`, imprécis) par un **sentinel 1px + IntersectionObserver** (`rootMargin: -(nav-h+1)px`) → l'ombre de la barre s'active exactement quand elle colle sous la nav.
3. **Masonry ratios naturels** : chaque `<img>` reçoit ses **vraies dimensions px** (mesurées au build via `sips`, bakées dans `const DIMS` de GalerieContent.tsx) → ratio d'origine réservé (zéro CLS), aucun recadrage. Retrait du faux `aspectRatio` 3/4/4/3 par parité d'index + du `content-visibility` (lazy-load suffit pour 55 imgs, évite les sauts de scroll dus au mauvais `contain-intrinsic-size`). Colonnes CSS : 4 (≥1600) / 3 / 2 (≤980) / 1 (≤430).
4. **Reveal GSAP** allégé : retrait du `filter: blur()` (coûteux + créait des stacking contexts par carte), on garde opacity + y + scale. `matchMedia` isReduced/isMotion conservé.
5. **Hover carte** : scrim dégradé bas (`.gal-card::after`) + label catégorie révélé (`.gal-card-cat`, ex. « MMA ») + icône loupe (`.gal-card-zoom`, z-index 2 au-dessus du scrim).
6. **Section vidéos** : les 2 cadres vides « cassés » → panneau « bientôt » soigné (`.galerie-videos-soon`) : motif pellicule + bouton play orange + badge BIENTÔT à gauche, description + CTA ghost « VOIR SUR INSTAGRAM » (`SOCIALS.instagram`) à droite. Clés i18n `videos.badge/description/cta` (FR+EN). Stack 1 col ≤720px.

**Lightbox inchangée** (déjà bonne : clavier, préload, compteur, catégorie, alt).

**Vérifs (Playwright headless, isolé — le profil MCP était verrouillé par une session parallèle)** : sur 1440/820/390, barre `position: sticky` z-index 20 top 72px, `data-stuck` bascule correctement, **elementFromPoint au centre de la barre = la barre (jamais une image) sur 5 points** → overlap éliminé, **0 overflow horizontal**. Filtre MMA (état actif + re-render), lightbox (compteur « 1 / 20 »), panneau vidéos desktop+mobile OK. `tsc` clean (GalerieContent), `i18n-check` 2817 clés FR=EN.

**Pour re-mesurer les dimensions si on ajoute/retire des photos** : `for p in $(grep -oE "img: '/[^']+'" src/components/GalerieContent.tsx | sed "s/img: '//;s/'//"); do sips -g pixelWidth -g pixelHeight "public$p"; done` puis mettre à jour la map `DIMS`. **Ne JAMAIS remettre `fx-grid` sur `.galerie-section`** (re-casse la barre sticky).

## 🆕 2026-07-08 (email relance : avertissement « place libérée » + bouton d'abandon de place self-service)

> **Demande David** : dans l'email de RELANCE, expliquer que sans retour dans les prochains jours on retire la place réservée, ET ajouter un bouton « J'abandonne ma place » qui passe la candidature en annulation (le compteur se libère automatiquement).

**Copy relance renforcée** (`src/lib/visio-email.ts`, variante `reminder` UNIQUEMENT) : l'encart d'urgence prévient maintenant « sans réponse dans les prochains jours, on devra libérer la place qu'on t'a réservée ». Bloc secondaire discret sous le CTA (divider + muted) : « Tu ne peux plus venir au camp ? » / « Can't join the camp anymore? » + lien ghost « J'abandonne ma place » / « I give up my place » → lien d'annulation. Rendu seulement si `cancelUrl` fourni (jamais dans l'email de confirmation post-inscription).

**Lien d'abandon self-service sécurisé** :
- **Jeton** : colonne `candidatures.cancel_token uuid not null default gen_random_uuid()` (migration `add_cancel_token`, backfill auto des lignes existantes). Non devinable (122 bits), propre à chaque dossier.
- **Route publique** `src/app/api/cancel-place/route.ts` (hors admin, laissée passer par `proxy.ts` comme toute route `/api` non-admin) :
  - `GET ?c=<id>&t=<token>` = **page de confirmation brandée uniquement, AUCUNE mutation** (évite l'auto-annulation par un pré-fetch de lien / scanner email type Outlook Safe Links). Vérifie le couple (id, token).
  - `POST` (formulaire de la page) = annulation effective : `recue → annulee` (garde-fou `.eq('status','recue')` anti-course) + payout referral pending/due → `cancelled` + audit `status_change` (actor `candidate`, note « abandon volontaire ») + `referral_cancelled`. **Miroir de la logique `annulee` de `api/admin/candidature/[id]/route.ts`** (source d'autorité).
  - La place se libère automatiquement : `annulee` est exclu de `CONSUMING_STATUSES` (`lib/places.ts`), aucun compteur à toucher.
  - Garde-fous : annulation seulement depuis `recue` ; `annulee` = idempotent (« déjà annulée ») ; autre statut (validee/soldee) = « contacte-nous » (pas d'auto-annulation d'un dossier avancé) ; token/id non-uuid ou introuvable = « lien invalide ».
- **Pages HTML** : `src/lib/cancel-page.ts` (`buildCancelPage(state, {locale,id,token})`, états `confirm|done|already|not_cancellable|invalid`), même charte que l'email (bandeau logo blanc + carte sombre), **bilingue selon `submission_language` du candidat** (PAS la locale d'URL, c'est une route API neutre). Isolé du route handler pour rester prévisualisable/testable.
- **Câblage** : les routes `visio-reminder` (send + preview) sélectionnent `cancel_token` et passent `cancelUrl = ${SITE_URL}/api/cancel-place?c=…&t=…` à `buildVisioEmail`. La preview admin montre donc aussi le bouton d'abandon.

**Sécurité** : GET safe (pas de mutation) → immunisé contre les pré-fetch. POST = capacité portée par le token (pas de cookie de session → pas de CSRF pertinent). Impossible d'annuler le dossier d'autrui (uuid id + uuid token requis) ni un dossier payé. Escape HTML systématique (`escapeHtml`).

**Vérifs** : `tsc` 0 erreur, `i18n-check` 2812 OK (aucun `messages/**`), `next build` complet vert (route `/api/cancel-place` = ƒ dynamique), rendus Playwright : email relance FR+EN (encart renforcé + bouton abandon) desktop+mobile, pages cancel confirm/done/already/not_cancellable/invalid FR+EN.

**Où changer la copy** : email → `src/lib/visio-email.ts` (`buildCopy`, blocs `reminder`) ; pages d'abandon → `src/lib/cancel-page.ts` (`buildCancelPage`).

## 🆕 2026-07-08 (admin : bouton « Relance visio » qui renvoie l'email d'invitation à réserver la visio)

> **Demande David** : ajouter un bouton dans le back office pour renvoyer un rappel au prospect l'invitant à réserver sa visio avec Ruslan, belle mise en page (photo + logo), dans la bonne langue selon le prospect, avec le lien d'appel, email responsive.

**Idée clé** : l'email de confirmation post-inscription (`notifyCandidate`) était DÉJÀ le mail responsive voulu (logo + photo Ruslan + CTA Cal, FR/EN). On l'a extrait en template unique réutilisable et on en a dérivé une variante « relance », renvoyée à la demande depuis `/admin/inscriptions/[id]`.

**Chaîne complète** :
1. **Template partagé** : `src/lib/visio-email.ts` — `buildVisioEmail({ prenom, campDiscipline, dureeSemaines, locale, variant })` retourne `{ subject, html, text }`. `variant: 'confirmation' | 'reminder'`, même layout (logo `logo-dark.png` sur **bandeau d'en-tête blanc** — reste visible même quand le client d'email force le thème clair et strippe le fond sombre, cf. règle ci-dessous ; + photo `ruslan-portrait-chemise-noire.jpg` servis en absolu via `SITE_URL`, un seul CTA `CAL_BOOKING_URL`), seuls eyebrow/objet/intro changent. Source UNIQUE : les 2 emails ne peuvent plus dériver.
   - ⚠️ **Logo email = version foncée sur bandeau blanc** (décision David 2026-07-08). Beaucoup de clients (Gmail, Apple Mail en mode clair) ne respectent pas le fond sombre de l'email → un logo blanc y devient invisible. On force donc un bandeau blanc dédié en haut avec `logo-dark.png` (logo couleur à texte foncé), toujours lisible quel que soit le rendu du client. Ne PAS remettre `logo-white.png` sur fond sombre dans les emails.
2. **Refactor** `src/app/api/inscription/route.ts` : `notifyCandidate` appelle `buildVisioEmail({ variant:'confirmation' })` (les ~90 lignes de HTML inline + constantes `CAL_BOOKING_URL`/`DISCIPLINE_LABELS_EN`/`SITE_URL` retirées de la route ; `escapeHtml` retiré de l'import). **Sortie identique** (objets vérifiés : « Il te reste une étape… » / « One step left… »), zéro régression pour le candidat au submit.
3. **Route envoi** `POST /api/admin/candidature/[id]/visio-reminder/route.ts` (calquée sur `contract/send`) : garde-fous (email présent, `status==='recue'`) → `buildVisioEmail({ variant:'reminder' })` → `sendMail` (to candidat, **bcc + replyTo** `contact@mkrcamp.com`, tag `'visio-reminder'`) → update `visio_reminder_sent_at` + `visio_reminder_count++` + audit `visio_reminder_sent`. Email KO = aucun état modifié (502), rejouable.
4. **Route aperçu** `GET …/visio-reminder/preview/route.ts` : renvoie le HTML du mail relance (`text/html`), aucun envoi, aucun état (ouvert dans un onglet).
5. **UI** `src/components/admin/VisioReminderCard.tsx` (rendue par `AdminActions`, juste après la carte Statut) : **visible uniquement sur les dossiers `recue`** (le rappel sert à faire réserver la visio, seule étape qui valide). Destinataire + langue, état « Rappel envoyé le X · N fois » (si count>0), blocage si email manquant, bouton **Prévisualiser** (ouvre le GET) + bouton **Envoyer le rappel** → `ConfirmModal` → POST, toast + `router.refresh` + état optimiste.
6. **Câblage** : `AdminActions.tsx` (import + 2 props `visioReminderSentAt`/`visioReminderCount` + rendu carte), `[id]/page.tsx` (SELECT `visio_reminder_sent_at, visio_reminder_count` + interface + props + `describeEvent('visio_reminder_sent')` → « Rappel visio envoyé »), `src/lib/email.ts` (tag `'visio-reminder'` ajouté à l'union).
7. **Migration Supabase** (`bgwvrzgnoqlqqrvflwav`, `add_visio_reminder_tracking`) : `alter table candidatures add column visio_reminder_sent_at timestamptz, add column visio_reminder_count integer not null default 0`.

**Pas d'impact i18n** : strings email FR/EN inline dans `visio-email.ts` (comme `notifyCandidate` et l'email contrat), admin 100% FR inline → **aucun `messages/**` touché**, parité intacte (2812 clés). **Vérifs** : `tsc --noEmit` 0 erreur, `i18n-check` 2812 OK, `next build --experimental-build-mode compile` OK (2 nouvelles routes API), **rendu visuel** relance FR + EN à 600px (desktop) et 375px (mobile) via Playwright → logo + photo OK, responsive, glossaire EN respecté (« Wrestling · Dagestan », « Immersion among champions »).

**Pour modifier la copy de l'email visio** : `src/lib/visio-email.ts` (fonction `buildCopy`, blocs `confirmation`/`reminder` × `fr`/`en`). Un seul endroit pour les 2 emails.

## 🆕 2026-07-07 (blog : 8e article « Combien ça coûte de s'entraîner au Daghestan » FR + EN + styles tableaux d'article)

> Nouvel article étude de coûts (demande David : combien coûte de s'entraîner au Dagestan, comparatif complet, risques du solo, univers fermé, mise en avant MKR). Slug canonical `combien-coute-s-entrainer-au-dagestan` ↔ EN `how-much-does-it-cost-to-train-in-dagestan`. Catégorie **Logistique**, ~2 650 mots par locale (~3 400 avec TL;DR + FAQ), TL;DR 5 points + FAQ 7 Q/R, **3 tableaux HTML** (budget solo ligne par ligne, grille MKR 2026, comparatif 10 critères avec colonne MKR surlignée `.is-mkr`) + **2 SVG inline** (« Cinq portes qui ne s'ouvrent pas toutes seules » barrières du solo + bar chart budget réel 2 semaines), 5 images Nanobanana (héro still-life sac/passeport/roubles 1920×1080 `cout-entrainement-dagestan.webp` généré Gemini 3 Pro + 4 inline 1600×900 `cout-dagestan-{arrivee,salle,coach,repas}.webp`, repas en mode Réalité Brute). Enregistré via la checklist 5 fichiers (cf. section 2026-07-06), relatedSlugs mis à jour sur 4 articles voisins (comment-s-entrainer, pourquoi-le-dagestan, preparer-son-premier-camp, securite-dagestan-2026).

**Cohérence chiffres (à maintenir si le pricing change)** : grille = `data/pricing.ts` verbatim (1 690/2 790/3 490 duo · 1 490/2 490/3 090 trio · 1 290/2 190/2 690 club · Famille 2 490/4 390/5 890 + 790/sem/enfant supp). Solo aligné article 7 (60-80 €/j sur place, ~800 € de vols, e-visa UE ~16j, cash only). Concurrents anglophones : 3 199-3 499 $ les 2 semaines (tarifs publics 2026 constatés sur les organisateurs US type Rise N'Glide/Fighter Travel en juillet 2026), cités en **catégorie générique sans nommer personne** dans l'article (même approche que l'article 7). Supplément -30j mentionné honnêtement en FAQ « frais cachés ».

**Nouveau CSS générique blog (réutilisable)** : `.article-table-wrap` (overflow-x auto + bordure + fond surface, zéro overflow page) et `.article-table` (variante `--compare` min-width 680px, `caption` Barlow Condensed en primary, `th` uppercase muted, `.is-mkr` colonne surlignée rust 10%, `.article-table-total` ligne total bordée primary, media query 640px) ajoutés dans `globals.css` entre `.article-illustration` et `.blog-related`. Tout futur tableau d'article doit utiliser ces classes.

**QA** : i18n-check 2812 clés OK · tsc clean · build 86 pages (84 + 2 nouvelles routes article) · Playwright 3 breakpoints (375/768/1440) × 2 locales = 0 overflow horizontal, 3 tables scrollables à 375px, 1 seul h1 · JSON-LD BlogPosting + FAQPage émis · og:image = héro webp · redirect 308 wrong-locale OK (`/en/blog/<fr-slug>` → slug EN). Note : le « Daghestan » (avec H) détecté dans le HTML EN vient du JSON-LD racine `data/site.ts` (préexistant, hors scope, déjà documenté au 2026-06-12).

## 🆕 2026-07-07 (admin : retirer la validation d'un dossier — retour VALIDEE → RECUE)

> **Demande David** : pouvoir enlever la validation d'un dossier depuis le dashboard pour le remettre à l'état initial. Cas d'usage : un dossier validé par erreur alors que la visio de sélection n'avait pas encore été faite.

**Nouvelle transition admin** `validee → recue` (« retirer la validation »). Elle vient s'ajouter aux transitions existantes de `validee` (`soldee` / `annulee` / `reportee`). C'est le **seul** chemin retour vers `recue` ; les autres statuts (soldee, camp_fait, terminaux) ne peuvent toujours pas revenir en arrière.

**4 fichiers touchés (admin only, aucun i18n, pas de migration DB)** :
- `src/lib/admin-transitions.ts` : `ALLOWED_TRANSITIONS.validee` ajoute `'recue'` + `TRANSITION_REMINDER.recue` (rappel : faire la visio avant de revalider) + commentaire de flow.
- `src/app/api/admin/candidature/[id]/route.ts` : sur `next==='recue'`, **reset de `souvenir_sent_at` à null** (+ audit `souvenir_reset`) pour que l'image souvenir reparte à la prochaine (vraie) validation (l'envoi souvenir reste idempotent via cette colonne). `souvenir_sent_at` ajouté au SELECT. Sans effet si aucun souvenir n'avait été envoyé.
- `src/components/admin/AdminActions.tsx` : bouton **« Retirer la validation »** (via `ACTION_LABEL` override, icône `history`, couleur grise neutre `ACTION_COLOR.recue`), ajouté à `NEEDS_CONFIRM` + `ACTION_CONFIRM.recue` (modale de confirmation, variant `warning`). Aucun raccourci clavier (pas de déclenchement accidentel).
- `src/app/admin/inscriptions/[id]/page.tsx` : `describeEvent` gère `souvenir_sent` et `souvenir_reset` (timeline propre).

**Comportement clé à retenir** : retirer la validation renvoie l'image souvenir à la prochaine validation (le candidat peut donc recevoir l'email « dossier validé » une 2e fois si le dossier est revalidé). C'est volontaire (« état initial »). Vérifs : `tsc` clean, `next build` compile OK, `i18n-check` 2791 clés OK, table de transitions testée (validee→recue autorisé, soldee/camp_fait→recue interdits).

## 🆕 2026-07-06 (écran de succès orienté conversion + email post-inscription refondu)

> **Demande David** : maximiser la conversion et la prise d'appel obligatoire (la visio valide le dossier), refondre l'email post-inscription pour pousser l'appel (photo Ruslan + logo, responsive), et garder la conversion Google Ads au submit. **Phase 1 livrée** (écran succès + email) **et Phase 2 livrée** (image souvenir générée serveur + envoyée par email à la validation `validee` du dossier).

**Écran de succès** (`InscriptionLayout.tsx` branche `submitted` + `globals.css` + `messages/{fr,en}/inscription.json` clés `success.*`) : recadré 100% sur la visio obligatoire. Sous-titre « une seule étape pour valider ton dossier », bloc réassurance `success.call_why` (3 points : Ruslan valide en personne / 15 min / dossier validé qu'après l'appel), petite confirmation `success.booked_confirm` après réservation, teaser `success.souvenir_teaser` (l'image souvenir arrive par email à la validation). **StoryCard retirée de l'écran** (plus de partage immédiat) : `StoryCard` import + états `forceShare`/share block supprimés. **VisioBooking sorti de `.cand-success`** (colonne 560px) et remonté en enfant direct de `.insc-success-page` → centrage normal-flow (`max-width:560px`, puis `1040px` ≥1152px) au lieu du débordement flex (plus simple, cf. commentaire CSS). Conversion `trackConversion('visio')` conservée au booking.

**Email candidat** (`notifyCandidate` dans `api/inscription/route.ts`) : refonte complète en **HTML responsive table-based** (compat Gmail/Apple/Outlook), thème sombre marque, **logo `logo-white.png` + photo de Ruslan** (`public/images/ruslan/ruslan-portrait-chemise-noire.jpg`, jpg créé pour compat email, servie en absolu via `SITE_URL`), eyebrow « DERNIÈRE ÉTAPE, OBLIGATOIRE », crédibilité (ex-équipe de France, INSEP), **un seul CTA fort** vers Cal, recap camp/durée, encart d'urgence (« sans cet appel, dossier pas validé »). Bilingue FR/EN (strings inline dans la route, pas `messages/**`). Vérifié via rendu Playwright desktop + mobile.

**Google Ads** : la conversion au submit était déjà câblée (`trackConversion('inscription')` → `generate_lead` + label + enhanced conversions email/tel/nom). `api/inscription` renvoie désormais `packageAmountCents` dans la réponse (dispo pour une valeur de conversion). Vérifs : `next build --experimental-build-mode compile` OK, `i18n-check` OK (2772 clés).

**Phase 2 — image souvenir gatée (envoyée à la validation)** :
- **`src/lib/souvenir-image.tsx`** : `renderSouvenirPng({prenom, campDiscipline, session, locale})` → PNG portrait **1080×1350** (4:5, optimal Instagram) via Satori (`next/og`). Réutilise les polices de marque (`public/og-fonts/` Teko + Barlow) et des **fonds PNG** de `public/og-bg/` (Satori ne décode pas le webp de façon fiable → dagestan-panorama / sparring-mma-wall / takedown-wrestling selon la discipline). Layout : logo + « DOSSIER VALIDÉ » + prénom géant (Teko, auto-scale) + discipline·destination + session + footer tagline `@mkrcamp`. Bilingue.
- **`src/lib/souvenir-notify.tsx`** : `sendSouvenirIfNeeded(candidatureId)` → fetch candidature+candidat, garde-fous (`status==='validee'`, `souvenir_sent_at` null, email présent), rendu PNG (try/catch → jamais bloquant), **email de félicitations HTML responsive** (logo, prochaines étapes, image en pièce jointe, bcc contact@) puis update `souvenir_sent_at` + audit `souvenir_sent`. Ne throw jamais, idempotent.
- **Trigger** : `api/admin/candidature/[id]/route.ts` — `export const runtime = 'nodejs'` + `await sendSouvenirIfNeeded(id)` quand `updates.status === 'validee'` (awaité car le travail post-réponse n'est pas fiable en serverless Vercel ; fail-safe : si le rendu échoue, la validation passe quand même).
- **Migration Supabase** (projet `bgwvrzgnoqlqqrvflwav`) : `alter table candidatures add column souvenir_sent_at timestamptz` (garde-fou anti-double-envoi).
- **Vérifié** : rendu réel des 2 disciplines via route de preview temporaire (supprimée après QA), `next build` compile OK.
- **Reste** : pas de renvoi manuel dans l'admin (v1 = auto à la validation uniquement) ; l'ancien composant client `StoryCard.tsx` devient orphelin (plus rendu).

## 🆕 2026-07-06 (Instagram mis en valeur dans le header, desktop + responsive)

> **Demande David** : mettre l'Instagram (@mkrcamp) en valeur dans le menu header, desktop et responsive, soigné UX/UI. Avant, l'IG ne vivait que dans le Footer et le bloc Contact ; il était absent de la barre de nav.

**Fichiers touchés** : `src/components/Nav.tsx` (+ import `SOCIALS` depuis `@/data/site`), `src/app/globals.css` (bloc `/* Nav Instagram */` après le mobile menu), `messages/{fr,en}/common.json` (3 clés miroir). Aucune dépendance, aucune route, aucune donnée.

**Ce qui a été ajouté** :
- **Desktop (`.nav-right`)** : une pastille sociale `.nav-ig` (lien vers `SOCIALS.instagram`, nouvel onglet) insérée entre le LocaleSwitcher et le CTA POSTULER. **Version minimaliste aux couleurs MKR** (pas de dégradé Instagram, décision David 2026-07-06) : glyphe rust `--primary` (#C84B31) dans un carré `--surface-high` bordé `--ghost-border` ; au survol, bordure `--primary` + halo `--primary-glow`. Handle `@mkrcamp` affiché ≥ 1361px (`.nav-ig-handle`), masqué en dessous → icône seule.
- **Mobile / tablette (≤1100px)** : la même pastille reste visible dans la top bar **avant le hamburger** (cible tactile 44px), accès direct sans ouvrir le menu.
- **Drawer mobile (`.mob-cta-wrap`)** : bouton `.mob-instagram` « SUIVRE @MKRCAMP » (EN « FOLLOW @MKRCAMP ») en **ghost aux couleurs MKR** (fond `--surface`, bordure `--ghost-border`, glyphe rust `--primary`, texte blanc ; survol → bordure `--primary` + halo `--primary-glow`), placé au-dessus de WhatsApp et POSTULER. Hiérarchie : POSTULER (primaire, orange plein) > WhatsApp (vert) > Instagram (ghost bordé).
- **A11y** : `aria-label` localisé (`nav.social_instagram_aria`), `rel="noopener noreferrer"`, `target="_blank"`, `focus-visible` (contour blanc sur l'icône), `prefers-reduced-motion` respecté (pas de lift/scale).

**Clés i18n ajoutées (parité 2770)** : `common.nav.social_instagram_handle` (« @mkrcamp », identique FR/EN), `common.nav.social_instagram_aria`, `common.nav.mobile.cta_instagram`. Cf. aussi la ligne « Réseaux sociaux » de la Propagation Map (§6bis) qui inclut désormais `Nav.tsx`.

**QA** : i18n-check OK (2770 clés), `tsc --noEmit` clean, `next build` ✓ Compiled successfully, captures Playwright header aux breakpoints 1440 (chip+handle) / 1200 (icône seule) / 390 (top bar + drawer) en FR et EN → rendu conforme, zéro overflow. Erreurs console dev = préexistantes (api/places 500 sans clé Supabase locale, CSP analytics/ads), non liées.

## 🆕 2026-07-06 (refonte conversion des pages destination FR+EN, commit 5020974)

> **Demande David** : reprendre de A à Z les pages destination (zone, camp, spécificités) pour maximiser les conversions du trafic SEO/SEA. Pages refondues : `/le-camp`, `/destinations` (hub), `/destinations/dagestan`, `/destinations/tchetchenie`, `/programme/lutte`, `/programme/mma` (FR + EN). Spec : `docs/superpowers/specs/2026-07-06-refonte-pages-destination-conversion-design.md`.

**6 nouveaux composants LP réutilisables** (CSS en fin de `globals.css`, section « LP conversion ») :
| Composant | Classes | Rôle |
|---|---|---|
| `KeyFactsBand` | `.kfb-*` | Bandeau sous hero, message match annonces Google (visa inclus, vol intérieur, 2 sessions/j, sélection, 15 places) |
| `AudienceFit` | `.afit-*` | Qualification « C'est pour toi si / Passe ton tour si » (règle d'entrée assumée) |
| `PageFaq` | `.pfaq-*` | FAQ de page (réutilise FAQAccordion) + JSON-LD FAQPage inline, questions spécifiques par page |
| `ProcessStrip` | `.pstrip-*` | 4 étapes candidature → départ, note « aucun paiement avant validation » |
| `PriceAnchor` | `.panchor-*` | Prix dérivé de `data/pricing.ts` (jamais en dur), prochaine session `getNextSession()`, places live `PlacesRestantes`, CTA + WhatsApp |
| `UpdatedAt` | `.updated-at` | Datestamp visible (prop `date` par page, à bumper à chaque révision éditoriale) |

**Clés i18n** : nouveaux groupes par page (`key_facts`, `fit`, `process`, `faq`) dans `messages/{fr,en}/{le-camp,destinations,programme}.json` + labels partagés `common.lp.*` (updated_at, price_anchor). Parité 2767 clés.

**Décisions de contenu appliquées** :
- **Règle d'entrée 2026-06-20 propagée** (memory `project_mkr_entry_rule_1an_base_sol`) : minimum 1 an de pratique + vraie base au sol, MMA Avancé 5+ ans. Touche aussi `data.faq.json` (3 réponses), `preparer-son-camp.json` (section niveau), `programme.root.pour_qui`, llms.txt. Le discours « ouvert à tous / débutants motivés » est supprimé du site.
- **Sécurité honnête** : les advisories officielles (France déconseille la Russie, FCDO le Caucase Nord) sont assumées frontalement puis cadrées par le protocole MKR. Fini le « le Quai d'Orsay ne déconseille que les zones frontalières » (inexact).
- **Noms de champions** : zéro nom sur les 6 pages refondues (continuité policy Google Ads du commit 1fb37ab). Khabib retiré de partout (destinations, hub, llms) sauf l'article blog conservé. Exception : légende photo factuelle Chimaev sur `/programme/mma` (preuve sociale photos réelles, décision 2026-05-23). OG tchetchenie nettoyée. Image `pads-direct-kadyrov.webp` remplacée par `pads-akhmat-power-fairtex.webp` sur programme/mma.
- **Faits recherche intégrés** (sourcés, rapport interne 2026-07-06) : Khasavyourt 8 ors olympiques sur 4 cycles, 50 000+ lutteurs licenciés à Makhachkala, ACA 2e organisation MMA mondiale par combattants classés, vol direct IST-GRV ~2h30, cartes bancaires étrangères inopérantes en Russie (cash euros).

**🐛 Fix conversion EN important** : `SectionCTA.tsx` utilisait `next/link` brut → sur les pages EN, les CTA renvoyaient vers les routes FR (`/inscription` au lieu de `/en/apply`). Passage au `Link` de `@/i18n/navigation` avec cast (pattern Hero/Sessions). Touche les 21 pages qui rendent SectionCTA.

**llms.txt + llms-en.txt resync complets** : grille tarifaire juin 2026 (l'ancienne grille pré-refonte y traînait), visa désormais INCLUS (était listé non inclus, faux depuis 2026-05-14), règle d'entrée, section « Regle d'entree (selection) », FAQ IA enrichies (accès sans invitation impossible, cash, trajet). Datestamp « Mis a jour : 2026-07-06 ».

**QA** : parité i18n 2767 clés OK, tsc clean, build vert, QA Playwright CLI 10 pages × 3 viewports (375/768/1440) = 0 overflow horizontal, 1 seul h1/page, JSON-LD FAQPage présent sur les 5 pages de contenu. Captures dans `/tmp/mkr-qa/`.

**Pour modifier une page destination désormais** : le contenu vit dans `messages/{fr,en}/<ns>.json` (groupes `key_facts`, `tldr`, `fit`, `process`, `faq`), la structure dans le `page.tsx`. Bumper la const `UPDATED` de la page à chaque révision éditoriale substantielle. Les prix ne se modifient QUE via `data/pricing.ts` (PriceAnchor et llms.txt : penser à resync llms manuellement si la grille change).

## 🆕 2026-07-06 (VisioBooking Cal.com : mise en page responsive desktop large + mobile)

> **Demande David** : améliorer la mise en page du calendrier Cal.com de l'écran de succès, autant en desktop large qu'en responsive mobile. Fichiers touchés : `src/components/VisioBooking.tsx` (1 flag) + `src/app/globals.css` (bloc `.visio-booking*`). Aucune clé i18n, aucun changement de dépendance. On garde `@calcom/embed-react` (déjà câblé thème sombre + accent marque + prefill + events `bookingSuccessful`) : le problème était purement CSS, pas la lib.

**Cause racine** : le calendrier vivait dans `.cand-success` (colonne de texte **cap 560px**), donc écrasé sur desktop. En plus, `hideEventTypeDetails: false` forçait une mise en page 2 colonnes illisible sur mobile (en-têtes de jours qui se chevauchaient).

**3 corrections** :
1. **`hideEventTypeDetails: true`** (dans `cal('ui', …)`) : masque la colonne "détails de l'event" (redondante, le titre/sous-titre autour donnent déjà le contexte). Résultat : **mobile = mois plein largeur propre**, **desktop = mois + créneaux côte à côte**.
2. **Breakout responsive** (`.visio-booking`) : jusqu'à 1151px le calendrier reste dans la colonne étroite (≤560px = mois plein propre) ; **à partir de 1152px** il sort du cap 560px vers une bande centrée `min(1040px, calc(100vw - 6rem))`. Technique = débordement symétrique d'un enfant plus large que son parent flex centré (`.cand-success` est `align-items:center` et centré dans le viewport → l'enfant large déborde à égalité des 2 côtés → reste centré à l'écran).
3. **`min-height` calibré + cadre + spinner** : `min-height` volontairement < à la hauteur réelle du calendrier à chaque breakpoint (mobile ~386px, colonne 560 ~566px, desktop mois+créneaux ~570px) → **zéro bande noire vide** sous l'iframe. Cadre premium (`box-shadow` inset + ombre portée, radius 16px). Spinner de chargement **langue-neutre** (pas de texte à traduire) en `::after` sous l'iframe (`z-index:0`, l'iframe `z-index:1` le recouvre au chargement).

**⚠️ Pièges Cal.com appris (réutilisables pour tout embed Cal)** :
- Cal choisit sa mise en page d'après **le viewport**, pas la largeur de l'iframe. Avec `useSlotsViewOnSmallScreen: 'true'`, dès que l'embed dépasse ~600px de large à un **viewport < 1024px**, Cal bascule en "vue créneaux" cassée (mini-picker qui chevauche + panneau de créneaux vide). D'où : **on n'élargit qu'à 1152px** (marge au-dessus de la bascule interne 1024px de Cal, instable pile à 1024). En dessous, on garde ≤560px (mois plein, toujours propre).
- **On garde `useSlotsViewOnSmallScreen: 'true'`** : c'est lui qui donne le mois compact propre sur mobile (sans lui, Cal empile mois + tous les créneaux = 810px+ de haut).
- **Test en `file://` = faux négatifs** : l'API de créneaux de Cal échoue par intermittence sur une origine nulle (`file://`) → panneau de créneaux vide. Toujours tester un embed Cal **via HTTP** (`python3 -m http.server`) : sur origine réelle (prod `https://mkrcamp.com`), le rendu large est déterministe (vérifié 3/3).

**Vérifié** : rendu réel du calendrier Cal via Playwright headless (harnais reproduisant DOM + CSS de l'écran de succès), sur origine HTTP, aux breakpoints 390 / 900 / 1100 / 1152 / 1440px → tous propres, `gap` conteneur/iframe = 0 partout. L'écran de succès n'est pas atteignable en local (submit Supabase requis), d'où le harnais.

## 🆕 2026-07-06 (blog : 7e article « Comment s'entraîner au Daghestan » FR + EN)

> Nouvel article, slug canonical `comment-s-entrainer-au-dagestan` ↔ EN `how-to-train-in-dagestan`. Catégorie Préparation, ~1700 mots par locale, TL;DR 5 points + FAQ 7 Q/R (JSON-LD BlogPosting + FAQPage émis par le template), SVG « journée type » inline (texte clair sur `--surface` sombre), 2 images Nanobanana conformes metaprompt (`entrainement-dagestan.webp` héro 1920×1071 + `entrainement-dagestan-course.webp` figure 1600×894, webp 131/151 KB). Référencé dans les `relatedSlugs` de 4 articles existants (dont 2 slots qui pointaient vers `khabib-methode-entrainement`, retirés conformément à la règle « pas de Khabib »). Contenu aligné sur la règle d'entrée 2026-06-20 (1 an de pratique + base au sol, MMA Tchétchénie avancé).

**Enregistrer un nouvel article blog = 5 fichiers** (le reste est automatique : sitemap, hreflang, OG, listes, related) :
1. `messages/fr/blog/<slug>.json` + `messages/en/blog/<slug>.json` (article complet, MÊME nom de fichier canonical pour les 2 locales)
2. `messages/{fr,en}/blog.json` (entrée index : title, excerpt, date, read_time, category, img_alt)
3. `src/data/blog.ts` (union `BlogSlug` + entrée `BLOG_POSTS` + maillage `relatedSlugs`)
4. `src/i18n/routing.ts` (`BLOG_SLUG_MAP` : slug EN localisé)
5. `src/i18n/request.ts` (`BLOG_SLUGS` : sinon namespace non chargé → fallback « Article en cours de rédaction »)

**Fix i18n blog au passage** :
- Template `blog/[slug]/page.tsx` : « À RETENIR », « QUESTIONS FRÉQUENTES » et « de lecture » étaient hardcodés FR (fuyaient sur les pages EN) → clés `blog.{tldr_label,faq_title,read_time_suffix}` (FR + EN, parité 2680 clés OK). Breadcrumb JSON-LD Accueil/Home localisé.
- Liste `blog/page.tsx` : héro « LE JOURNAL DU CAMP » hardcodé → const `BLOG_LIST_HERO` fr/en (EN = « THE CAMP JOURNAL »).
- ⚠️ Dette restante : le `content_html` EN des **6 anciens articles** pointe encore vers les chemins FR (`/logistique`, `/clubs-groupes`…). Le nouvel article utilise les chemins localisés `/en/...` : faire pareil pour tout nouvel article, et reprendre les 6 anciens un jour.

**Fix switch de langue sur les articles (bug rapporté David 2026-07-06)** :
- **Cause** : `LocaleSwitcher.tsx` appelait `router.replace(pathname)` où `usePathname()` next-intl renvoie le TEMPLATE `/blog/[slug]` sur les routes dynamiques, sans jamais passer les `params` → next-intl ne peut pas construire l'URL, le clic FR/EN ne faisait rien sur les pages article (OK partout ailleurs, seule route dynamique publique).
- **Fix 1 (client)** : `LocaleSwitcher` lit `useParams()`, et sur `/blog/[slug]` remappe le slug vers la locale cible via `getCanonicalBlogSlug` + `getBlogSlug` avant `router.replace({ pathname, params }, { locale })`.
- **Fix 2 (serveur, SEO)** : `blog/[slug]/page.tsx` fait un `permanentRedirect` (308, export ajouté à `src/i18n/navigation.ts`) de tout slug de mauvaise locale vers l'URL localisée (`/en/blog/<fr-slug>` → `/en/blog/<en-slug>` et inversement, pour les 7 articles) : zéro contenu dupliqué, tous les points d'entrée corrigés (y compris les liens FR des 6 anciens articles EN).
- Vérifié Playwright : clic EN/FR sur article neuf + ancien article + `/le-camp` + home + `/blog` → URLs et contenus corrects, non-régression statique OK.

## 🆕 2026-07-03 (balise Google Ads AW-18296696470 + suivi des conversions + Consent Mode v2)

> **Demande David** : poser la balise Google Ads pour tracker toutes les conversions, **surtout la validation du formulaire d'inscription**, avec **Consent Mode v2 + bandeau cookies**. Version « balise directe » (pas de GTM/GA4 pour l'instant). Voir memory `project_mkr_google_ads_campaign`.

**Balise de base** : `src/app/[locale]/layout.tsx` injecte gtag.js (`AW-18296696470`) via `next/script` (`strategy="afterInteractive"`). Elle couvre donc **toutes les pages publiques FR + EN + `/inscription`** (le layout `[locale]` est la racine du site), mais **PAS `/admin`** (layout séparé `src/app/admin/layout.tsx`, sans tag). ID centralisé dans `src/lib/gtag.ts`.

**Helper conversions** : `src/lib/gtag.ts` — `trackConversion(action, params?)` et `trackEvent(name, params?)`, safe côté serveur et avant chargement de gtag (no-op sinon, fallback `dataLayer.push`). Pour chaque action, un **évènement GA nommé** est toujours envoyé (approche event-based : l'écran de succès est une SPA, pas une URL `/merci`) ; si un **label** Google Ads est configuré, la conversion classique `send_to: 'AW-18296696470/<label>'` part aussi. Labels vides par défaut → renseigner soit les constantes `LABELS` dans `gtag.ts`, soit les env `NEXT_PUBLIC_GADS_LABEL_{INSCRIPTION,CONTACT,GUIDE,VISIO}`.

**4 points de conversion câblés** :
| Action | Fichier / déclencheur | Évènement GA |
|---|---|---|
| **Inscription soumise** (la principale) | `InscriptionLayout.tsx` `handleSubmit` après succès `/api/inscription` (tous tunnels) | `generate_lead` (+ `transaction_id`=candidatureId, `tunnel`, `camp_discipline`) |
| Visio Cal.com réservée | `InscriptionLayout.tsx` `onBooked` (`bookingSuccessfulV2`), ref-guard anti-double | `schedule_call` |
| Contact envoyé | `ContactForm.tsx` après succès `/api/contact` | `contact` |
| Guide téléchargé | `GuideForm.tsx` après succès `/api/guide-caucase` | `guide_download` |

**CSP ouverte** (`next.config.ts`) : `script-src` + `www.googletagmanager.com www.googleadservices.com googleads.g.doubleclick.net` ; `connect-src` + `googletagmanager + google-analytics (+ *.google-analytics) + googleadservices + doubleclick + www.google.com` ; `frame-src` + `td.doubleclick.net + www.googletagmanager.com`. Les pixels de conversion passent par `img-src 'https:'` (déjà large). **Sans ça, la balise est bloquée et rien ne remonte.**

**Vérifié** : `tsc` clean sur les fichiers touchés (seuls les préexistants `contract-pdf.tsx` erronent), `i18n-check` OK (2651 clés, aucun `messages/**` touché), `next build --experimental-build-mode compile` OK, runtime dev = balise présente sur `/`, `/en`, `/inscription`, absente sur `/admin`, header CSP correct. ⚠️ `node_modules` était désync (`@react-pdf/renderer` manquant) → `npm install` requis avant tout build.

**Consentement (Google Consent Mode v2)** : signaux `ad_storage`/`ad_user_data`/`ad_personalization`/`analytics_storage` en **`denied` par défaut** (script inline dans le `<head>` du layout, exécuté avant gtag.js) + `ads_data_redaction` + `url_passthrough`. Bandeau cookies `src/components/CookieConsent.tsx` (bilingue `common.cookie_consent`, monté dans `[locale]/layout.tsx`) : « Accepter » / « Refuser » (poids égal, conforme), choix mémorisé dans le cookie `mkr_consent` (180j) et propagé via `gtag('consent','update',…)`. Tant que l'utilisateur n'a pas accepté, la mesure part sans cookies (modélisation). CSS `.cookie-consent*` en fin de `globals.css`. **Design compact 2026-07-05** : carte discrète ancrée en bas à gauche (largeur max 21rem, plus de bandeau centré 42rem), copy raccourcie à une phrase (FR+EN), fondu d'entrée (delay 0.8s, `prefers-reduced-motion` respecté) ; en mobile ≤768px, offset `bottom: calc(56px + safe-area + 0.6rem)` pour ne jamais masquer le sticky CTA POSTULER (z 180 vs bandeau z 200).

**Reste à faire (non bloquant, cf. plan campagne)** : (1) créer les actions de conversion côté Google Ads (event-based sur les 4 évènements, ou coller un label dans `gtag.ts`) ; (2) éventuel **CMP granulaire** par finalité (le bandeau actuel est accept/refus global, suffisant mais pas par catégorie) ; (3) valeur de conversion = montant package ; (4) GA4 + GTM si besoin d'un plan de taggage plus riche ; (5) Enhanced Conversions for Leads + capture GCLID pour la vente offline post-visio.

**Pour changer l'ID de balise ou un label** : `src/lib/gtag.ts` (`GADS_ID`, `LABELS`). **Bandeau / consentement** : `src/components/CookieConsent.tsx` + script default dans `[locale]/layout.tsx` + textes `common.cookie_consent` (FR+EN).

## 🆕 2026-07-03 (contrat de participation : génération + envoi depuis le dashboard)

> **Feature David** : Ruslan génère, prévisualise et envoie le **contrat de participation PDF** au candidat depuis `/admin/inscriptions/[id]`, avec archivage de la copie exacte. Spec complète : `docs/superpowers/specs/2026-07-03-mkr-contrat-validation-design.md`.

**Chaîne complète** :
1. **DB (migrations `add_contract_fields` + `add_next_contract_number_fn`)** : 12 colonnes `contract_*` sur `candidatures` (dates, durée, inclusions/exclusions texte 1 item/ligne, note, échéance, locale fr/en, `contract_number` unique via séquence `contract_number_seq` + rpc `next_contract_number()`, sent_at/sent_count/pdf_path) + bucket Storage **privé** `contracts` (chemin `{candidature_id}/MKR-YYYY-XXXX-vN.pdf`).
2. **Contenu** : `src/data/contract.ts` = source unique FR+EN (partie MKR, RIB Revolut Ruslan — ⚠️ **IBAN placeholder, envoi bloqué par `isRibConfigured()` tant que non renseigné**, prestations par défaut = miroir CGV art. 5/6, grille annulation localisée mappée sur `REFUND_TIERS` par index, clauses acceptation/assurance/CGV, translittération cyrillique `sanitizeForPdf`).
3. **PDF** : `src/lib/contract-pdf.tsx` (`@react-pdf/renderer` v4.5.1, en `serverExternalPackages` — jamais bundlé par Turbopack). Fonts brand Teko/Barlow + logo lus via `fs` depuis `public/` (pattern OG éprouvé) + `outputFileTracingIncludes` sur les 2 routes (ceinture-bretelles), fallback Helvetica sans crash. Filigrane « APERÇU » sur la route preview uniquement. ⚠️ Teko : `lineHeight` explicite obligatoire sur les gros corps (sinon chevauchement) ; filigrane = un seul mot (le texte rotaté wrappe).
4. **Routes** (protégées proxy) : `GET …/contract/preview` (PDF inline filigrané, ne stocke rien), `POST …/contract/send` (PDF → upload Storage → email candidat avec PJ + **bcc contact@mkrcamp.com** + replyTo contact@ → update + audit `contract_sent` ; échec email = aucun état modifié), `GET …/contract/file` (URL signée 60 s vers la dernière copie envoyée). PATCH `/api/admin/candidature/[id]` étendu : champs contrat validés (fin ≥ début, échéance ≤ début, durée 1-12) + attribution du n° au premier save + audit `contract_fields_update` (1 event, liste des champs).
5. **UI** : `src/components/admin/ContractCard.tsx` (rendue par `AdminActions`, montant/statut LIVE). Pré-remplissage intelligent : dates depuis la session officielle (`SESSIONS`) ou `date_debut_souhaitee`, fin auto = début + semaines×7 (fin de session si durée pleine) tant que non éditée à la main, échéance J+14 clampée au début, prestations par défaut dans la langue du contrat (bascule auto si non éditées), langue pré-réglée sur `submission_language`. **Montant du séjour éditable dans la carte** (même champ `package_amount_cents` que la carte Paiement — source unique, pas de montant contractuel séparé ; audit + recompute commissions % via le PATCH existant, resync bidirectionnelle Paiement↔Contrat via `onAmountSaved`). **Enregistrement explicite** (document légal, pas d'auto-save), save-then-preview anti popup-blocker (`window.open('about:blank')` puis redirect), modale de confirmation avec récap (destinataire, n°, montant, langue), bouton « Renvoyer » avec avertissement vN, ligne d'état + lien « Voir le PDF envoyé », bloc « À compléter avant envoi » listant les garde-fous en clair (miroir des garde-fous serveur qui restent l'autorité).
6. **Email** : `src/lib/email.ts` étendu (`attachments` base64 + `bcc` + tag `'contract'`). Email candidat FR tutoiement / EN, récap + RIB dans le corps + PDF joint `MKR-YYYY-XXXX-contrat.pdf`.

**Garde-fous envoi (serveur)** : statut ∈ {validee, soldee}, email présent, montant non nul (« sur devis » bloqué), dates/durée/échéance valides, IBAN réel configuré.

**Reminder transition `validee` mis à jour** (`admin-transitions.ts`) : pointe vers la carte Contrat (le RIB part dans le contrat, plus à envoyer à la main).

**Pas d'impact i18n** : contenu contrat inline FR/EN dans `contract.ts`, admin FR inline. Parité `i18n-check` intacte (2651 clés).

**Vérifs** : `tsc --noEmit` OK · i18n-check OK · `next build --experimental-build-mode compile` (Turbopack) OK · rendu PDF FR/EN validé visuellement (fonts, logo, cyrillique translittéré, montant, filigrane).

**Reste à faire** : renseigner l'IBAN réel dans `src/data/contract.ts` (constante `CONTRACT_RIB.iban`) — l'envoi est bloqué d'ici là. Follow-ups possibles : badge « contrat envoyé » dans la liste `/admin/inscriptions`, relance auto échéance dépassée, e-signature.

## 🆕 2026-06-23 (montant package auto-calculé et persisté à l'inscription)

> **Bug rapporté David** : « le montant dans le backend doit correspondre à la demande et à son prix ». **Cause racine** : le formulaire calculait bien le prix exact de la demande (récap `InscriptionLayout` étape finale via `calculatePrice`) **mais ne l'envoyait jamais** — `POST /api/inscription` n'écrivait pas `package_amount_cents`. Résultat : `package_amount_cents` était `NULL` sur **100% des candidatures** (les 10 dernières vérifiées), Ruslan devait recalculer et le saisir à la main. Le backend ne reflétait donc jamais le prix de la demande.

**Fix (3 couches, server-side, jamais le client)** :
1. **`src/data/pricing.ts`** — nouveau helper pur `estimateDemandAmountCents({ tunnel, weeks, campDiscipline, composition, parents, children, groupSize })` → centimes EUR, en **miroir exact** de la dérivation adults/children/isQuote du récap du form. Retourne `null` pour les cas **sur devis** (combo, 11+, club 6-10 « à partir de », durée absente). Réutilise `calculatePrice`/`isOnQuote` (DRY, single source `PRICING_TIERS`).
2. **`src/app/api/inscription/route.ts`** — dérive les inputs depuis la demande validée + `form_data` (custom.composition / famille.nombre_parents+enfants / groupe.nombre_participants), calcule `package_amount_cents` et le **persiste à l'insert** (firm prices uniquement, sinon `null` = sur devis). Audit_log `package_amount_estimated`. Le montant est aussi ajouté aux notifs **email + Slack** (« Montant (selon demande) », `formatAmountLabel`, « Sur devis » si null).
3. **`src/components/admin/AdminActions.tsx`** — hint « Montant package » réécrit : pré-rempli depuis la grille selon la demande, ajustable, vide = sur devis.

**Backfill** : `UPDATE` Supabase (projet `bgwvrzgnoqlqqrvflwav`) des 10 candidatures à `package_amount_cents IS NULL` avec la grille (audit_log `package_amount_backfilled`). Vérifié : **0 null, 0 mismatch, 0 firm-price manquant** sur l'ensemble. Logique SQL = miroir de `calculatePrice` (dry-run validé avant apply).

**Interaction referral** : améliore le système % (PaoloZ). À `soldee`, la commission % se calcule désormais sur un CA non-null (avant : « CA à saisir » si Ruslan oubliait de saisir). Pas de régression : à l'insert le payout est `pending`, aucun recompute prématuré ; l'édition admin du montant recalcule comme avant.

**Pas d'impact i18n** : messages d'erreur API et libellés admin/notifs sont des strings FR inline (pas `messages/**`), parité intacte. `tsc --noEmit` OK + `next build` OK.

**Pour changer un prix** : toujours `data/pricing.ts` uniquement. `estimateDemandAmountCents` (donc le montant persisté) se met à jour automatiquement au prochain build.

## 🆕 2026-06-19 (refonte du template OG : polices de marque + layout anti-superposition)

> **Bug rapporté David** : sur les vignettes OG (ex. /sessions « ÉTÉ »), le texte était illisible, **superposé au logo** et **pas dans la bonne typographie**. Cause racine double dans `src/lib/og-template.tsx`.

**Cause racine #1 — aucune police chargée** : `next/og` (Satori) ignore `fontWeight: 900/800/...` si on ne lui passe pas explicitement des fichiers de police. Sans `fonts`, il retombe sur **Geist Regular 400** (le TTF par défaut bundlé dans `@vercel/og`). D'où le titre fin/illisible et hors-charte (le site utilise **Teko** + **Barlow Condensed**). ⚠️ Satori ne lit **que TTF/OTF/WOFF, jamais woff2** → on ne peut pas réutiliser les fichiers `next/font`.

**Cause racine #2 — superposition** : le bloc titre était `position:absolute; top:0; height:100%; justifyContent:center`, donc centré sur TOUTE la hauteur → il chevauchait le logo absolu (haut) et le footer (bas) dès que le titre était long (auto-scale qui wrap).

**Fix** :
1. **Polices de marque chargées** dans `ImageResponse({ fonts })` : `public/og-fonts/Teko-Bold.ttf` (titre, 700), `BarlowCondensed-SemiBold.ttf` (keywords + footer + tagline, 600), `Barlow-Medium.ttf` (sous-titre, 500). Lues via `fs.readFile` (même pattern que le logo/bg). Source fiable des TTF statiques : **Fontsource jsdelivr** (`cdn.jsdelivr.net/fontsource/fonts/<famille>@latest/latin-<poids>-normal.ttf`). ⚠️ l'API Google `/l/font?kit=` renvoie un format obfusqué non-TTF. Loader caché + `try/catch` → fallback gracieux (police défaut) si fichier absent, jamais de crash. Comme les OG sont **SSG-prérendues au build**, les TTF ne sont nécessaires qu'au build (présents dans le repo, non gitignorés).
2. **Layout en colonne flex** (header logo+keywords / `main flex:1` centré / footer) → le titre ne peut **structurellement plus** chevaucher le logo ni le footer, quelle que soit sa longueur. Auto-scale du titre recalibré pour Teko (condensé : 56→150px).
3. **2 OG sans fond corrigées** : `/programme/mma` → `/og-bg/sparring-mma-wall.png`, `/destinations/tchetchenie` → `/og-bg/mosque-grozny.png` (asset orphelin enfin utilisé). Elles n'avaient aucun `bgImage` (rendu noir plat).

**Vérifié** : les 30 routes OG re-rendues (FR + EN, accents É/È/À/Ç/Œ OK, cas extrêmes titre 2 lignes + sous-titre 86 chars), `next build` OK (30 routes ● SSG), rendu confirmé en `next start` (prod). Aucune clé i18n touchée (parité intacte, pas de propagation EN). Fichiers : `src/lib/og-template.tsx`, `public/og-fonts/*.ttf`, `programme/mma/opengraph-image.tsx`, `destinations/tchetchenie/opengraph-image.tsx`. **Pour ajouter une OG** : créer `opengraph-image.tsx` avec `COPY.{fr,en}` + passer un `bgImage` existant de `public/og-bg/` (4 dispos). Ne jamais demander un `fontWeight` non chargé.

## 🆕 2026-06-19 (image Instagram à partager révélée APRÈS la réservation de la visio)

> **Décision David** : sur l'écran de succès, l'image `<StoryCard />` à partager sur Instagram ne doit apparaître qu'**une fois la visio Cal.com réservée** (récompense de fin de parcours), au lieu de s'afficher en même temps que le calendrier.

**Mécanisme** : Cal.com émet nativement l'event `bookingSuccessfulV2` (+ legacy `bookingSuccessful`) quand une réservation est confirmée dans l'embed. `VisioBooking.tsx` s'y abonne via `cal('on', { action, callback })` (API confirmée dans `@calcom/embed-core/dist/src/sdk-action-manager.d.ts`) et appelle un nouveau prop `onBooked`. Callback gardé dans un `useRef` pour que l'effet de montage reste à deps `[]` (pas de re-souscription).

**Écran de succès** (`InscriptionLayout.tsx`, branche `if (submitted)`) : 2 nouveaux states `visioBooked` / `forceShare`.
- Avant réservation : à la place de la StoryCard, une ligne discrète `.insc-share-locked` (clé `success.share_locked_hint`) + lien `success.share_reveal_link` (« L'afficher maintenant ») qui force l'affichage (`forceShare`). **Filet pour les non-bookers** : ceux qui réservent plus tard via le lien de l'email ne perdent pas l'image.
- Après réservation (`bookingSuccessfulV2` → `setVisioBooked(true)`) OU `forceShare` : la StoryCard s'affiche (`.insc-share-block--revealed`, fade-up) précédée d'un badge `.insc-booked-badge` « Visio réservée » (clé `success.booked_badge`, accent marque, pas de vert hors-charte).

**i18n** : 3 clés ajoutées dans `messages/{fr,en}/inscription.json` → `success.booked_badge`, `success.share_locked_hint`, `success.share_reveal_link`. Parité OK (2651 clés). **CSS** : `.insc-share-block--revealed`, `.insc-booked-badge`, `.insc-share-locked`, `.insc-share-reveal` ajoutés à la section « Bloc de partage » de `globals.css`.

**Limite de test** : la révélation déclenchée par la réservation n'est pas testable en local (écran de succès = submit Supabase réussi + vraie réservation Cal). Confirmer par une réservation test sur le déploiement. Build + parité OK. Memory : `reference_calcom_booking_event`.

## 🆕 2026-06-19 (anti-spam invisible du formulaire d'inscription)

> **Décision David** : renforcer l'anti-spam de `/api/inscription` SANS dégrader l'UX (aucun CAPTCHA, aucune friction visible, aucun compte tiers). 3 couches invisibles ajoutées par-dessus l'existant (honeypot `_hp` + rate-limit in-memory + dedup 60s + caps de taille).

**Couches ajoutées** (`src/app/api/inscription/route.ts`, ordre d'exécution) :
1. **Time-trap** : `InscriptionLayout.tsx` envoie `form_started_at` (ms epoch du montage, via `useState(() => Date.now())`). Le serveur rejette si `0 <= elapsed < MIN_FILL_MS` (4000ms) avec une **réponse 200 fake** (`candidatureId:'noop'`, comme le honeypot, pour ne pas signaler la détection aux bots). Absence du champ TOLÉRÉE (client en cache pendant un déploiement → pas de faux positif). Un humain met > 4s sur un tunnel 4-5 étapes, donc zéro faux positif.
2. **Blocage emails jetables** : `src/lib/disposable-email.ts` (`isDisposableEmail`, ~48 domaines connus mailinator/yopmail/guerrillamail/temp-mail… + sous-domaines, liste conservatrice). Refus = **400 user-facing localisé FR/EN** (message inline, pas dans `messages/**`). Réutilisable pour `/api/contact` et `/api/guide-caucase` (pas encore branché).
3. **Rate-limit DURABLE** : après `getSupabaseAdmin()`, compte les candidatures réellement créées par IP sur 1h (`DURABLE_IP_LIMIT=10`, `DURABLE_IP_WINDOW_SECONDS=3600`) via `.eq('form_data->_meta->>ip', ip)`. Survit aux cold starts serverless (≠ le bucket in-memory de `lib/rate-limit.ts` qui leak et n'est pas partagé entre instances Vercel). **Fail-open** (try/catch + skip si `ip==='unknown'`) : un souci d'infra ne bloque jamais un vrai candidat. L'IP est déjà stockée dans `form_data._meta.ip` (vérifié : 8/8 lignes l'ont), donc le filtre JSON matche en prod.

**Pas de changement i18n** : les messages d'erreur API sont des strings TS inline (FR/EN), pas des clés `messages/**` → la CI i18n n'est pas concernée. **Aucun changement UX** côté formulaire (time-trap 100% invisible). Build OK, gates testées en local via curl (honeypot/time-trap → 200 noop ; jetable → 400 FR/EN ; email normal → passe). Memory : `project_mkr_inscription_antispam`.

## 🆕 2026-06-19 (chooser /inscription : affichage instantané + compactage mobile)

> **Décision David** : sur l'écran de choix du type d'inscription (`/inscription` sans `?type=`), le texte arrivait trop tard après les images. La page doit être directe, sans animation d'entrée, charger le plus vite possible, et bien lisible en mobile (comprendre qu'il y a plusieurs types d'inscription).

**Cause** : la branche `if (!audience)` de `InscriptionLayout.tsx` rend le chooser dans `<div className="insc-success-page">`, wrapper PARTAGÉ avec l'écran de succès post-submit. Celui-ci porte des animations d'entrée (`globals.css` ~3270-3285) : `.cand-success-title` fade-up à **0.85s**, `.cand-success-sub` à **1s**. Le chooser héritait de ces délais alors que les cartes/images s'affichent direct → "le texte arrive après les images".

**Fix** :
- Wrapper du chooser passé à `className="insc-success-page insc-chooser"`. Nouvel override CSS `.insc-success-page.insc-chooser .label-tag/.cand-success-title/.cand-success-sub { opacity:1; animation:none }` (juste après le bloc d'anim success-page). ⚠️ Ne PAS tuer globalement les anims de `.insc-success-page` : le vrai écran de succès (branche `if (submitted)`, sans `.insc-chooser`) les garde.
- Retiré le `style={{ transitionDelay: ... }}` par carte. Première image de carte en `loading="eager" fetchPriority="high"` (les autres restent `lazy`).
- Marge du grid sortie de l'inline → CSS `.insc-audience-selector .audience-grid { margin-top: 2.5rem }`.
- Mobile ≤600px (bloc média ajouté après `.audience-card--clickable.audience-card--photo`) : photo `aspect-ratio: 5/2`, description `-webkit-line-clamp: 2`, marges/CTA resserrés, grid `margin-top: 1.5rem` → la 2e carte dépasse sous la ligne de flottaison.

**Fichiers** : `src/components/InscriptionLayout.tsx` (branche `!audience`), `src/app/globals.css`. Aucun changement de copy (pas de propagation i18n). Build OK, vérifié screenshots 390px (carte 2 peek) + 1280px (grille 4 col intacte). Memory : `project_mkr_inscription_chooser_instant`.

## 🆕 2026-06-17 (visio de sélection Cal.com en fin de candidature + email candidat)

> **Décision David** : à la fin du tunnel d'inscription, le lead doit réserver sa visio de sélection avec Ruslan (calendrier Cal.com inline, event `15min`). La réservation déclenche nativement l'invitation iCal (.ics) aux deux parties. En plus, le candidat reçoit un email de confirmation avec le lien de réservation pour valider son dossier. Comble le backlog V2 « Email transactionnel candidat » (cf. anciennes notes "À refaire").

**Dépendance ajoutée** : `@calcom/embed-react@^1.5.3` (composant React inline, pas de `<script>` brut).

**Env** : `NEXT_PUBLIC_CAL_LINK=ruslan-mukhtarov-mkr/15min` (`.env.local` + à reporter sur Vercel). Valeur de repli codée en dur si absente. Lien public = `https://cal.com/ruslan-mukhtarov-mkr/15min`.

**Nouveau composant** : `src/components/VisioBooking.tsx` (client, dynamic-importé). Calendrier Cal.com inline pré-rempli avec `name` + `email` du candidat. Titre/sous-titre i18n `inscription.success.booking`. Lien texte de repli si l'embed ne charge pas.

**Écran de succès réordonné** (`src/components/InscriptionLayout.tsx`, bloc `if (submitted)`) : 1. message « Candidature reçue » · 2. **`<VisioBooking />` = action principale** · 3. `<StoryCard />` repassé en action secondaire dans `.insc-share-block` sous séparateur (`inscription.success.share_label`) · 4. lien retour accueil.

**Email candidat** (`src/app/api/inscription/route.ts`) : nouvelle fonction `notifyCandidate()` (fire-and-forget dans le `Promise.all` aux côtés de `notifySlack`/`notifyEmail`, ne bloque jamais). Localisée FR/EN selon `submission_language`. Récap camp + durée + bouton CTA vers le lien Cal. Tag Resend `inscription-candidate` (ajouté à l'union de `src/lib/email.ts`). Expéditeur `contact@mkrcamp.com` (compte Resend MKR, domaine vérifié 2026-07-09). La notif interne à Ruslan (`notifyEmail`) est inchangée. `escapeHtml` ajouté à l'import depuis `@/lib/email`.

**CSS** : section `/* Visio Booking */` en fin de `globals.css` (`.visio-booking*`, `.visio-booking-embed` height 680px/560px mobile, `.insc-share-block`, `.insc-share-label`).

**i18n** : clés `success.booking.{step,title,subtitle,fallback_prefix,fallback_link}` + `success.share_label` dans `messages/{fr,en}/inscription.json`. Parité 2645 clés OK. Build OK.

**Hors périmètre (V2 possible)** : webhook Cal.com → Supabase pour tracer `visio_booked_at` + badge admin « visio réservée ». Pour l'instant les RDV se voient dans le compte Cal.com.

**Spec** : `docs/superpowers/specs/2026-06-17-mkr-visio-booking-design.md`.

### 🐛 Correctif 2026-06-19 (le calendrier ne s'affichait pas : CSP + thème + hauteur)

> **Symptôme** : sur l'écran de succès, le calendrier Cal.com était une **boîte noire vide** (capture David). **Cause racine = la CSP de `next.config.ts`**, pas le composant. Reproduit : CSP appliquée → `embed.js` bloqué → aucune iframe injectée → boîte vide. CSP retirée → l'embed rend parfaitement.

**3 corrections (toutes vérifiées Playwright desktop + mobile 390px) :**

1. **CSP (`next.config.ts`) — LA cause** : `script-src 'self' 'unsafe-inline'` bloquait `https://app.cal.com/embed/embed.js`, et l'absence de `frame-src` faisait retomber l'iframe sur `default-src 'self'` (donc bloquée). Ajouté `https://app.cal.com` à `script-src` + `connect-src`, et **nouvelle directive** `frame-src 'self' https://app.cal.com https://cal.com`. ⚠️ `frame-ancestors 'none'` (qui empêche les AUTRES d'embarquer MKR) est SANS RAPPORT — ne pas confondre avec `frame-src` (ce que MKR embarque). **Tout futur embed tiers (YouTube, Maps, widget BSport...) exige d'ajouter son origine ici.**
2. **Thème (`VisioBooking.tsx`)** : l'embed rendait en clair sur l'écran sombre MKR. `theme: 'dark'` doit être dans le **`config` du `<Cal>`** (= param d'URL de l'iframe), pas seulement dans `cal('ui', ...)` (trop tardif, URL déjà construite). Couleur de marque via `cssVarsPerTheme` (les 2 clés `dark` + `light` requises par les types). Accent `cal-brand: #C84B31`.
3. **Hauteur (`globals.css` + `VisioBooking.tsx`)** : `.visio-booking-embed` était `height: 680px; overflow: hidden`, ce qui coupait le contenu mobile (~1015px empilé). Passé en `min-height` + enfant `height: auto`, `<Cal style={{height:'auto'}}>` + `useSlotsViewOnSmallScreen: 'true'` (vue créneaux compacte sur petit écran). Le conteneur grandit avec le contenu, plus de découpe.

**Fichiers** : `next.config.ts` (CSP), `src/components/VisioBooking.tsx` (config theme + slots + height auto), `src/app/globals.css` (`.visio-booking-embed` min-height + enfant height auto). `tsc --noEmit` OK, `next build` OK.

---

## 🆕 2026-06-17 (audit i18n composants : extraction des strings FR hardcodées)

> **Bug rapporté** : le bouton « Découvrir » (chevron scroll homepage) restait en français sur `/en`. **Cause** : plusieurs composants `.tsx` contenaient des strings FR en dur, qui contournent totalement le système i18n. Le filet `scripts/i18n-check.js` ne valide QUE la parité des clés JSON, il NE détecte PAS les strings hardcodées dans les `.tsx`. Il faut un grep TSX dédié pour les attraper.

**Composants migrés vers next-intl (live)** :
- `ScrollNav.tsx` → `common.scroll_nav` (le bug « Découvrir » rapporté + aria sections + fallback)
- `VideoModal.tsx` → `common.video_modal` (rendu sur /programme/mma, /temoignages, home via VerticalVideoSplit)
- `Breadcrumb.tsx` → `common.breadcrumb` (async server component, ~12 pages)
- `SiteLoader.tsx` → `common.site_loader` (layout racine)
- `ScrollIndicator.tsx` → `common.scroll_indicator` (CinematicReveal + DestinationReveal)
- `DestinationSafetyProtocol.tsx` → `destinations.safety_protocol` (async, /destinations/dagestan + /tchetchenie)
- `PricingTable.tsx` → **nouveau namespace `pricing_table`** (FR+EN), async server component, `getTranslations('pricing_table')`. Les NUMÉROS restent dans `data/pricing.ts` (`PRICING_TIERS`, `FAMILY_PRICING`, `formatEUR`), seuls les libellés (label/range/pitch des paliers, listes inclus/non-inclus, copy famille, CTA) passent en i18n. Enregistré dans `src/i18n/request.ts` `FLAT_NAMESPACES`. Rendu sur 5 pages : /familles, /sur-mesure, /sessions, /clubs-groupes, /mkr-camp-2026 (toutes ×2 locales). Bug de contenu corrigé au passage : « Hébergement de camp » était listé 2× dans les inclus.

**Orphelins NON migrés (non rendus, à supprimer au prochain audit)** : `VideoSection.tsx`, `RuslanRevealSlider.tsx`, `CandidatureForm.tsx` (le vrai form est `InscriptionLayout.tsx`).

**Réflexe à ajouter au workflow i18n** : après `node scripts/i18n-check.js` (parité JSON), lancer aussi un grep des strings FR hardcodées dans les composants LIVE :
```
for f in $(grep -rln "" src/components --include="*.tsx" | grep -v /admin/); do
  grep -q "useTranslations\|getTranslations" "$f" || grep -lE "aria-label=\"[^\"]*[éèàç]|>[A-ZÉ][a-zéèàç ]{3,}<" "$f"
done
```
Parité après fix : **2639 clés** FR=EN. Build OK (82 pages).

**Blogs SEO/GEO (commit b426b3a)** : les 6 articles avaient `meta_title: null` (FR+EN) → next-intl logguait `MISSING_MESSAGE` à chaque build (il traite une valeur `null` comme clé manquante) et aucun `<title>` SEO custom. Ajout de meta_titles SEO (keyword en tête, 45-56 chars, brand « MKR Caucasian Camp », glossaire EN Dagestan/Wrestling) dans `messages/{fr,en}/blog/<slug>.json`. Contenu, `about`/`tldr`/`faq` (GEO) et `keywords` étaient déjà traduits et complets. `MISSING_MESSAGE` count = 0 après fix.

**OG images localisées + meta descriptions (commits ea39113 + aa802b2)** :
- **OG images** : les 25 `opengraph-image.tsx` existaient mais n'étaient JAMAIS servies. `localizedMetadata` ET le root `layout.tsx` posaient un `openGraph.images` par défaut (`/images/social/og-image.webp` statique) qui override la file-convention Next → 1 seule image statique FR pour TOUTES les pages, 2 langues. **Fix** : retrait du défaut dans `localizedMetadata` (n'émet `images` que si le caller en passe, ex. blog avec image d'article) + retrait `openGraph.images`/`twitter.images` du root layout → la file-convention `opengraph-image.tsx` par route reprend la main. Chaque OG route convertie au pattern `generateImageMetadata` (alt localisé) + `COPY.{fr,en}` + `locale` passé à `createOgImageResponse` (tagline footer localisée « Immersion among champions »). `og-template.tsx` accepte un param `locale`.
- **Piège route-group** : les enfants directs du groupe `(site)` (cgv, mentions-legales, politique-de-confidentialite, merci, coachs) **n'héritent PAS** de l'OG du groupe-racine → sans fichier propre, plus de `og:image`. → 5 nouveaux `opengraph-image.tsx` créés. (blog/[slug] hérite de `blog/opengraph-image.tsx` ET passe son image d'article, donc OK.)
- **30 OG routes** au total, bilingues, rendu vérifié 1200×630 PNG par locale.
- **Meta descriptions** : 5 desc FR blog (190-224 chars) + EN le-camp (186) > limite SERP ~160 → retaillées 146-154 chars.
- **Pour ajouter une page avec OG localisée** : créer `opengraph-image.tsx` dans le segment de la PAGE (pas au niveau d'un route-group), suivre le pattern `generateImageMetadata` + `COPY.{fr,en}`. Ne JAMAIS reposer un `openGraph.images` par défaut dans `localizedMetadata`/layout (re-casserait toutes les OG dynamiques).

**Blog : section « Sur le même sujet » + routing EN (commits 3fcabe7 + 316a5fd)** :
- **Images cassées** : `data/blog.ts` pointait 4 fichiers inexistants (khabib-entrainement→khabib-methode, lutte-daghestan→lutte-guide, nutrition-combat→nutrition, preparer-camp→prep-camp). Réparé (corrige aussi le hero de ces 4 articles).
- **Headers hardcodés FR** : « À lire ensuite »/« Sur le même sujet » + « Lire l'article » → `blog.related.{eyebrow,title}` + `blog.read_article`. Animation `.reveal` staggered ajoutée aux cards.
- **Routing EN cassé (pré-existant)** : les liens blog (liste + cards related) utilisaient `next/link href="/blog/<fr-slug>"` sans préfixe → lecteurs EN envoyés sur l'article FR ; et le sitemap/hreflang publiaient `/en/blog/<en-slug>` qui tombaient sur le fallback « Article en cours de rédaction » (la page ne matchait que les slugs canoniques FR). **Fix** : (1) page résout slug→canonique via `getCanonicalBlogSlug`, (2) `generateStaticParams` locale-aware (param parent `locale`) émet `/en/blog/<en-slug>` + `/blog/<fr-slug>`, (3) liens via `Link` next-intl en object form `{ pathname:'/blog/[slug]', params:{ slug: getBlogSlug(canonical, lang) } }` (préfixe auto + slug localisé), (4) `url` JSON-LD localisé. Vérifié : `/en/blog/<en-slug>` rend le vrai article EN, FR intact. Détail : memory `feedback_nextintl_localized_dynamic_slug`.

> ⚠️ **CORRECTION 2026-06-17** : l'entrée « 2026-06-12 » ci-dessous est INEXACTE. La page `/tarifs`, `opengraph-image.tsx`, `PriceEstimator.tsx`, `messages/{fr,en}/tarifs.json` et `messages/{fr,en}/pricing_table.json` décrits N'EXISTAIENT PAS dans le repo (jamais commités ou revertés). Au 2026-06-17, `PricingTable.tsx` était encore 100% FR hardcodé (jamais migré comme l'entrée le prétend). Seul le travail d'affiliation (`referral-codes.ts`) du 2026-06-12 était réel. La migration i18n de `PricingTable` a réellement été faite le 2026-06-17 (voir entrée ci-dessus), mais sans page `/tarifs` ni simulateur. **À refaire si besoin** : créer la page `/tarifs` + `PriceEstimator` décrits ci-dessous.

## 🆕 2026-06-12 (nouvelle page /tarifs + simulateur de prix + PricingTable i18n) — ⚠️ NON IMPLÉMENTÉ, voir correction ci-dessus

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
| 0 Identité | prenom, nom, dateNaissance, pays, email, **telephone**, villeDepart | age ≥ 18, email regex, **tel ≥ 6 chiffres** |
| 1 Expérience | disciplinePrincipale (DISCIPLINES select), anneesPratique, niveau | required |
| – | disciplinesSecondaires[], club, coach, palmares, lienVideo | optionnel |
| 2 Santé | conditionPhysique, blessuresRecentes, contreIndications, deuxFoisJour | required |
| – | blessuresDetail, contreIndicationsDetail | conditionnels |
| 3 Logistique | session, duree (1/2/3 semaines) | required |
| – | message | optionnel |
| 4 Confirmation | **sourceDecouverte**, certifMedical, accepteConditions, pret | checkbox required |

> **🆕 2026-06-15 — Champs obligatoires durcis (décision David, tous tunnels)** : le composant `Field` accepte désormais un prop `required` qui affiche un astérisque `*` (`.cand-required`, `aria-hidden`) sur tous les champs validés — avant, aucun astérisque n'existait (le candidat découvrait les requis au moment de l'erreur). **Téléphone** devient obligatoire (parcours individuel + contact groupe) car Ruslan rappelle chaque candidat pour la visio de sélection (validation : non vide + ≥ 6 chiffres, clés `telephone_required` / `telephone_invalid`). **Source de découverte** devient obligatoire à l'étape finale (tous tunnels, clé `source_required`) ; le panneau `<details>` "détails supplémentaires" s'ouvre automatiquement si erreur sur ce champ. Champs restés optionnels : disciplines secondaires, club, coach, palmarès, lien vidéo, message, code de recommandation. Clés i18n ajoutées dans `messages/{fr,en}/inscription.json` → `errors.by_field`.

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
| **Balise Google Ads / conversions / consentement** | `src/lib/gtag.ts` (`GADS_ID` = AW-18296696470, `LABELS`) + injection + Consent Mode dans `src/app/[locale]/layout.tsx` + CSP dans `next.config.ts` + bandeau `src/components/CookieConsent.tsx` (textes `common.cookie_consent`). Points de conversion : `InscriptionLayout.tsx` (inscription + visio), `ContactForm.tsx`, `GuideForm.tsx`. Voir section « 🆕 2026-07-03 (balise Google Ads) » en tête. |
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
| `components/Nav.tsx` | chip Instagram desktop (`.nav-ig` + handle) + bouton drawer mobile (`.mob-instagram`), lit `SOCIALS.instagram` (ajouté 2026-07-06) |
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
