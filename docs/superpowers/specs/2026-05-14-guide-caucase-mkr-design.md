---
title: Guide Caucase MKR — Design Spec
status: approved-design
date: 2026-05-14
owner: David Khazaei (DKDP)
client: MKR Caucasian Camp
supersedes: 2026-05-14-guide-dagestan-mkr-design.md
related:
  - SITEMAP.md
  - docs/GUIDE-RUSLAN.md
---

# Guide Caucase MKR — Design Spec

## 1. Contexte et problème

Le projet a pivoté de "Guide Daghestan" vers "Guide Caucase" pour refléter l'offre actuelle MKR (refonte SITEMAP 2026-05-12) :

- **Lutte adultes et enfants** : camp au **Daghestan** (Makhachkala / Kaspiysk)
- **MMA** : camp en **Tchétchénie** (Grozny)
- **Combo Lutte + MMA** : possible uniquement sur les inscriptions Sur Mesure

État actuel (2026-05-14) :

- `src/app/(site)/guide-dagestan/page.tsx` existe — landing teaser mono-destination, à élargir au Caucase entier.
- `src/components/GuideForm.tsx` factice : `onSubmit={e => e.preventDefault()}`, aucune capture, aucune livraison.
- Aucun PDF n'a été produit.
- Aucune route API `/api/guide-*`.

Cette spec couvre la production de bout en bout du livrable Caucase (PDF + capture + landing + visuels) et la migration de l'URL `/guide-dagestan` → `/guide-caucase` avec redirect 301 et propagation des liens internes.

## 2. Objectifs

- **Produire** un PDF de 20 pages premium couvrant les 2 destinations MKR (Lutte au Daghestan, MMA en Tchétchénie), à la marque MKR, livrable instantané après opt-in.
- **Capturer** les emails dans Supabase comme nouvelle source de leads qualifiés (segment "découverte / pas encore prêt à candidater").
- **Renommer** la route `/guide-dagestan` → `/guide-caucase` et l'enrichir (preuve, sneak peek, micro-personas, FAQ rapide).
- **Garder** la cohérence avec les règles SITEMAP (1-3 semaines, 2 destinations Daghestan/Tchétchénie, 2 repas/jour, vol Istanbul-Makhachkala ou Istanbul-Grozny inclus, horaires Lutte 10h30/17h30, MMA 11h00/18h00, WhatsApp +33 6 66 17 76 91, fondateur **Ruslan Mukhtarov**).

Non-objectifs (sortis du périmètre V1) :

- Email transactionnel Resend (nécessite vérification domaine `mkrcamp.com` SPF/DKIM/DMARC — backlog V2).
- Version anglaise / russe du guide (FR uniquement V1).
- Guide spécialisé par discipline (Lutte enfants à part, MMA à part) — V1 unifié.
- A/B testing de la landing.

## 3. Architecture technique

### 3.1 PDF — Génération HTML + WeasyPrint

**Stack** :
- Template HTML + CSS print (A4 portrait, 210 × 297 mm)
- Génération via `/opt/homebrew/bin/weasyprint` (binaire, pas le module Python — voir feedback memory `feedback_weasyprint_macos.md`)
- Sortie : `public/guide-caucase.pdf` (servi statiquement par Next.js)
- Source HTML versionnée dans `docs/guide-caucase/` (template + contenu + assets)

**Pourquoi WeasyPrint et pas Gamma / Canva** :
- Contrôle 100 % de la brand MKR (typo, palette, photos, layout)
- Scriptable (regen après update contenu en `weasyprint guide.html guide.pdf`)
- Reproductible pour de futurs guides MKR

**Charte print MKR appliquée** :
- Titres : Roboto Condensed Black 900, uppercase, letter-spacing serré
- Body : Inter ou Crimson Text (à valider en revue du template, lecture papier)
- Palette à sourcer depuis `brand-identity/` ; default proposé : primary rouge `#E11D2A` (CTA / accents), vert MKR `#1A4D3A` (cards data), fonds crème `#F8F5F0`, sections dark `#0E0E0E` pour chapter openers
- Photos pleine page sur les chapter openers (p1, 4-5, 6, 7, 13-14, 17, 20)
- Numérotation discrète footer + mention `mkrcamp.com` en watermark

### 3.2 Architecture 20 pages — Guide Caucase

| Page | Section | Type | Notes |
|---|---|---|---|
| 1 | Couverture | Hero | Photo grand paysage Caucase + titre "GUIDE CAUCASE" + sous-titre "Lutte au Daghestan, MMA en Tchétchénie" |
| 2 | Édito Ruslan Mukhtarov | Narrative | Pourquoi ce guide, vision MKR, signature "Ruslan Mukhtarov, fondateur MKR" |
| 3 | Sommaire | Index | 6 sections + numéros pages |
| 4-5 | Le Caucase en chiffres | Infographie | Carte 2 zones (Daghestan + Tchétchénie), 6 stats clés communes + 3 stats spécifiques Daghestan + 3 spécifiques Tchétchénie |
| 6 | Pourquoi le Daghestan domine la lutte mondiale | Story | Héritage Khabib, Islam Makhachev, école Hassavyourt, médailles olympiques |
| 7 | Pourquoi la Tchétchénie domine le MMA | Story | Akhmat Fight Club, héritage Khamzat Chimaev, Grozny capitale moderne |
| 8-9 | Visa Russie pas-à-pas | Actionable | Commun aux 2 destinations. Documents par pays FR/CH/BE/CA, délais 5-10 j ouvrés, frais, checklist, lettre invitation MKR |
| 10-11 | Vols | Actionable | Itinéraires Istanbul → Makhachkala (MCX, Lutte) OU Istanbul → Grozny (GRV, MMA). Comparatif Turkish Airlines / Pegasus, fenêtres prix, réserver 90 j avant |
| 12 | Budget complet | Tableau | Package 1 290-2 790 €, vol intl, visa, assurance, équipement, perso. Identique pour Daghestan et Tchétchénie |
| 13-14 | Prép physique 6 semaines | Programme | Semaine par semaine (cardio base 1-2, force 3-4, endurance spé 5, affûtage 6). Note "intensifie le grappling si Lutte / intensifie le striking si MMA" |
| 15 | Prép mentale | Conseil | Isolement, choc culturel, immersion totale (commun) |
| 16 | Équipement complet | Checklist | 2 cols : Vêtements/Protection 7 items + Hygiène/Admin 5 items (cf SITEMAP, pas de Kimono/Trousse/Adaptateur). Note "gants MMA si discipline MMA" |
| 17 | Sur place : journée type | Planning | 7h30 → 22h00, 2 repas/jour, horaires Lutte 10h30/17h30 (Daghestan) ou MMA 11h00/18h00 (Tchétchénie) |
| 18 | Culture et immersion | Culture | Mots avar pour Daghestan (Salam, Rahmat) + mots tchétchènes pour Tchétchénie (Salam, Dik), religion (Islam), gastronomie commune (khinkali, chudu, urbech) |
| 19 | Témoignages anciens | Preuve | Antoine (Lutte Daghestan) + LAMP (MMA Tchétchénie) |
| 20 | Prochaines étapes | CTA | 4 sessions 2026/2027, WhatsApp +33 6 66 17 76 91, lien postuler `/inscription` |

**Différenciation visuelle Daghestan vs Tchétchénie** dans le PDF :
- Bandes de couleur ou icônes en haut de page pour orienter le lecteur (ex: bleu nuit pour pages Daghestan, vert profond pour pages Tchétchénie, neutre pour pages communes)
- Carte du Caucase en p4-5 avec les 2 zones surlignées dans leurs couleurs respectives
- Les pages 6 (Daghestan/Lutte) et 7 (Tchétchénie/MMA) servent de chapter openers thématiques

### 3.3 Landing `/guide-caucase` enrichie

**Migration URL** :
- Nouvelle route `src/app/(site)/guide-caucase/page.tsx` (copie enrichie de l'ancienne)
- Ancienne route `src/app/(site)/guide-dagestan/page.tsx` à supprimer
- Redirect 301 dans `next.config.ts` : `/guide-dagestan` → `/guide-caucase` (préserve les éventuels backlinks)
- Sitemap mis à jour : retrait `/guide-dagestan`, ajout `/guide-caucase` priority 0.6
- Propagation des liens internes : `/logistique` (SectionCTA ghostHref) + tout autre lien interne actuel

**Sections existantes adaptées** :
- PageHero : titre "TU PARS T'ENTRAÎNER AU CAUCASE", subtitle élargi 2 destinations
- CinematicReveal : passer de "TERRE DE CHAMPIONS" mono-Daghestan à "DEUX TERRES DE COMBAT" duo Daghestan + Tchétchénie

**Sections ajoutées** :

1. **Mockup PDF "open book"** dans le hero — visuel central qui montre 2 pages ouvertes (couverture + une page interne). Image Nanobanana.
2. **"Pour qui ce guide"** — 3 micro-personas (Solo aventurier / Famille avec enfants / Club organisé).
3. **Sneak peek** — Grid 3-4 thumbnails de pages internes (carte Caucase, visa, budget).
4. **2 témoignages courts** sur l'utilité du guide (un Daghestan/Lutte, un Tchétchénie/MMA).
5. **FAQ rapide** — 4 Q/R : "C'est vraiment gratuit ?", "Je le reçois quand ?", "Format ?", "Disponible en anglais ?".
6. **Trust signals** sous le form : "Pas de spam · 1 email max · Désinscription en 1 clic".
7. **Form sticky bas de page** (re-rappel CTA).

**Métadonnées** :
- Title : "Guide gratuit Caucase : Lutte au Daghestan, MMA en Tchétchénie | MKR"
- Description : "Guide complet de 20 pages pour partir t'entraîner au Caucase. Visa, vols, budget, préparation, équipement, culture. Téléchargement instantané."
- Canonical `https://mkrcamp.com/guide-caucase`
- JSON-LD `Schema.DigitalDocument` pour signaler le livrable

### 3.4 Backend capture + livraison

**Migration Supabase** (projet `bgwvrzgnoqlqqrvflwav`, eu-central-1) :

```sql
create table guide_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  locale text default 'fr',
  source text,                -- guide-caucase, future: guide-tchetchenie-pro, etc.
  utm_source text,
  utm_medium text,
  utm_campaign text,
  ip text,
  user_agent text,
  created_at timestamptz default now()
);

create unique index guide_leads_email_source_idx on guide_leads (email, source);
create index guide_leads_created_at_idx on guide_leads (created_at desc);
```

**API route** `src/app/api/guide-caucase/route.ts` :

- Validation email (regex + maxlength)
- Upsert sur `(email, source)` (idempotent)
- Insert dans `guide_leads` via `supabase-admin` (service_role)
- Slack notif fire-and-forget (nouvelle entrée lead → Slack webhook si présent)
- Réponse JSON `{ ok: true, downloadUrl: '/guide-caucase.pdf' }`
- Erreurs explicites (400 invalid email, 500 db error)

**Form `<GuideForm />` refondu** :

- État local `isSubmitting`, `error`, `downloadUrl`
- Submit async fetch POST
- Sur succès : remplacer le form par un panneau "Ton guide est prêt !" + bouton "Télécharger maintenant" qui pointe sur `downloadUrl`
- Sur erreur : message inline
- Champ caché honeypot (anti-bot)
- Track UTM params depuis `useSearchParams`

**Livraison** :
- PDF statique servi par Next.js depuis `public/guide-caucase.pdf`
- Pas d'email V1 (Resend hors scope, backlog V2)
- Download direct = UX la plus simple, instant gratification

### 3.5 Visuels — pipeline Nanobanana

**Images à générer** (system prompt = `clients Claude/MKR caucasian camp/image-generation/metaprompt.md`) :

| Asset | Usage | Format |
|---|---|---|
| `guide-caucase-cover.webp` | Couverture PDF (p1) + mockup landing | Portrait 2:3 |
| `guide-caucase-mockup-openbook.webp` | Hero landing | Paysage 4:3 |
| `guide-page-carte-caucase.webp` | Sneak peek landing | Portrait 2:3 |
| `guide-page-visa.webp` | Sneak peek landing | Portrait 2:3 |
| `guide-page-budget.webp` | Sneak peek landing | Portrait 2:3 |
| `pdf-chapter-caucase-map.webp` | PDF p4-5 (carte 2 zones) | Paysage |
| `pdf-chapter-daghestan-lutte.webp` | PDF p6 (héritage lutte) | Paysage |
| `pdf-chapter-tchetchenie-mma.webp` | PDF p7 (héritage MMA Grozny) | Paysage |
| `pdf-chapter-vol.webp` | PDF p10-11 | Paysage |
| `pdf-chapter-prep.webp` | PDF p13-14 | Paysage |
| `pdf-chapter-arrivee.webp` | PDF p17 | Paysage |
| `pdf-chapter-culture.webp` | PDF p18 | Paysage |

12 images. Toutes compressées via `baoyu-compress-image` avant intégration. Toutes vérifiées sur les règles globales (pas de second écran, pas d'em dash dans le texte des images, etc.).

**Pour les 2 chapter openers Daghestan vs Tchétchénie** :
- p6 Daghestan/Lutte : ambiance lutteur tapis Makhachkala, palette bleu nuit / brun terre
- p7 Tchétchénie/MMA : ambiance ring MMA Grozny ou mosquée Kadyrov + sparring, palette plus vive / vert profond

## 4. Découpage en lots livrables

| Lot | Contenu | Bloque le suivant ? |
|---|---|---|
| **L1 — Backend** | Migration Supabase + API route `/api/guide-caucase` + refonte `GuideForm.tsx` + tests manuels | Non |
| **L2 — Visuels** | 12 images Nanobanana + compression | Non |
| **L3 — PDF** | Template HTML/CSS + contenu rédigé + génération WeasyPrint | Oui pour démo end-to-end |
| **L4 — Landing migrée et enrichie** | Nouvelle route `/guide-caucase` + redirect 301 + sitemap + propagation liens + sections ajoutées + form connecté | Oui pour ship |
| **L5 — QA** | Test parcours opt-in → download, audit Lighthouse, vérif règles globales, audit grep "Tchétchénie" présente bien (et pas dégradée), SITEMAP MKR à jour | Oui pour shipping prod |

Ordre d'exécution recommandé : L1 + L2 en parallèle, puis L3 et L4 séquentiel, puis L5.

## 5. Risques et mitigations

| Risque | Impact | Mitigation |
|---|---|---|
| Template WeasyPrint long à régler (typo, marges, sauts page) | +0.5-1 j | Démarrer par template minimal valable, itérer |
| Photos Nanobanana qui ne respectent pas la brand MKR | Visuels génériques | Utiliser `metaprompt.md` MKR systématiquement, valider 1 image avant batch |
| Photos Tchétchénie réalistes difficiles (peu de refs) | Visuels génériques pour p7 | Voir SITEMAP "À refaire" : Nanobanana propres pour Tchétchénie déjà flagué en backlog, on les produit ici |
| Lead Supabase double envoi (user clique 2x) | UX dégradée | Upsert sur `(email, source)` + bouton disabled pendant submit |
| Domain `mkrcamp.com` jamais vérifié pour Resend | Pas d'email V1 | Acté : V1 sans Resend, download direct |
| Contenu PDF qui copie/colle des sections du site | Texte AI-tell, doublon SEO | Passer le texte au skill `humanizer` + reformuler systématiquement |
| Redirect 301 `/guide-dagestan` mal configuré | 404 sur backlinks externes ou rétrogradation SEO | Tester redirect en local avant deploy, vérifier `next.config.ts` |
| Témoignage MMA Tchétchénie côté p19 | LAMP est-il vraiment allé en Tchétchénie ? | Voir SITEMAP — LAMP "MMA pro · Session Daghestan", donc Daghestan. Soit on adapte le quote, soit on trouve un autre quote MMA Tchétchénie, sinon on garde 2 témoignages Daghestan + un encart "premiers retours camp Tchétchénie à venir" |

## 6. Conventions et règles à respecter

Issues du SITEMAP MKR + memories globales :

- **Fondateur = Ruslan Mukhtarov** (nom complet dans tous les supports officiels)
- Pas d'em dash dans le contenu
- Pas d'emoji nulle part (SVG inline ou Icon component)
- Toujours accents FR
- Pas de signe & (toujours "et")
- Pas de fond noir/charcoal en bloc (sauf chapter openers volontaires PDF)
- Compresser toutes les images avant intégration
- Pas de second écran dans les visuels (règle absolue)
- Téléphone : `+33 6 66 17 76 91` (jamais XXX, jamais +41)
- 3 disciplines : Lutte adultes, Lutte enfants, MMA
- 2 destinations : **Daghestan** (Lutte) + **Tchétchénie** (MMA)
- 2 repas / jour (jamais 3)
- 4 sessions 2026/2027 (Été, Toussaint, Hiver, Pâques)
- Tarifs à partir de 1 490 € / adulte (palier Solo/Duo 1 sem)
- Modèle paiement post-visio (pas Stripe, pas acompte)
- Vol intérieur Istanbul → Makhachkala (Lutte) OU Istanbul → Grozny (MMA) inclus
- Transfert 1h30 Makhachkala / 30 min Grozny
- Horaires Lutte 10h30/17h30, MMA 11h00/18h00
- Antoine Petit-Jean = combattant invité, jamais "fondateur"
- Combo Lutte + MMA séquentiel UNIQUEMENT sur Sur Mesure (jamais sur session officielle)

## 7. Critères de réussite (Definition of Done)

- [ ] PDF de 20 pages produit, servi sur `/guide-caucase.pdf`, ouvre sans erreur sur Preview macOS et Chrome
- [ ] Form `/guide-caucase` capture les leads dans Supabase `guide_leads`
- [ ] Bouton download apparaît instantanément après opt-in
- [ ] Redirect 301 `/guide-dagestan` → `/guide-caucase` fonctionne (test en local)
- [ ] Page landing enrichie passe Lighthouse mobile ≥ 90 Performance et 100 A11y
- [ ] `next build` passe sans erreur, sitemap à jour (retrait /guide-dagestan, ajout /guide-caucase)
- [ ] Propagation des liens internes faite (SectionCTA `/logistique`, mega menu si présent, footer si présent)
- [ ] 12 images générées, compressées et intégrées
- [ ] Tous les greps SITEMAP passent (em dash, ampersand, second écran, etc.) sur PDF html et landing
- [ ] Memory `project_mkr_guide_caucase.md` créée avec stack utilisée et URLs prod
- [ ] SITEMAP.md MKR mis à jour : nouvelle entrée `/guide-caucase`, ancien `/guide-dagestan` archivé en redirect, nouvelle table Supabase `guide_leads`, propagation map des liens internes mise à jour

## 8. Décisions verrouillées par David (2026-05-14)

1. **Fondateur** : Ruslan Mukhtarov (nom complet) — appliqué partout dans le PDF et la landing
2. **Pivot Daghestan → Caucase** : guide couvre les 2 destinations (Daghestan/Lutte + Tchétchénie/MMA)
3. **Témoignages p19** : 2 réels (Antoine Lutte Daghestan + LAMP MMA Tchétchénie — adapter le quote LAMP si nécessaire ou prendre un autre quote MMA)
4. **Palette PDF** : default proposé (rouge `#E11D2A` + vert `#1A4D3A` + crème `#F8F5F0`). Sourcer la charte officielle depuis `brand-identity/` avant attaquer le template et override si différent
5. **Route URL** : `/guide-caucase` (avec redirect 301 de `/guide-dagestan`)
6. **Fichier PDF** : `public/guide-caucase.pdf`
