---
title: Guide Daghestan MKR — Design Spec
status: approved-design
date: 2026-05-14
owner: David Khazaei (DKDP)
client: MKR Caucasian Camp
related:
  - SITEMAP.md
  - docs/GUIDE-RUSLAN.md
---

# Guide Daghestan MKR — Design Spec

## 1. Contexte et problème

État actuel (2026-05-14) :

- `src/app/(site)/guide-dagestan/page.tsx` existe — landing teaser avec PageHero, CinematicReveal, 6 cards `GUIDE_CONTENTS` et un formulaire.
- `src/components/GuideForm.tsx` est factice : `onSubmit={e => e.preventDefault()}`, aucune capture, aucune livraison.
- Aucun PDF n'a été produit.
- Aucune route API `/api/guide-*` n'existe.
- Le SITEMAP promet un guide de 20 pages couvrant 6 sections (Visa, Vols, Budget, Prep 6 sem, Équipement, Conseils anciens).

Donc le "guide" est aujourd'hui une promesse vide. Cette spec couvre la production de bout en bout du livrable promis et l'enrichissement de la landing pour optimiser la conversion email.

## 2. Objectifs

- **Produire** un PDF de 20 pages de qualité premium, à la marque MKR, livrable instantanément après opt-in.
- **Capturer** les emails dans Supabase comme nouvelle source de leads qualifiés (segment "découverte / pas encore prêt à candidater").
- **Enrichir** la landing pour pousser le taux d'opt-in (preuve, sneak peek, micro-personas, FAQ rapide).
- **Garder** la cohérence avec les règles SITEMAP (1-3 semaines, 2 destinations Daghestan/Tchétchénie, 2 repas/jour, vol Istanbul-Makhachkala inclus, horaires Lutte 10h30/17h30, MMA 11h00/18h00, WhatsApp +33 6 66 17 76 91, etc.).

Non-objectifs (sortis du périmètre V1) :

- Email transactionnel Resend (nécessite vérification domaine `mkrcamp.com` SPF/DKIM/DMARC — backlog V2).
- Version anglaise / russe du guide (FR uniquement V1).
- Personnalisation du PDF par destination (Daghestan uniquement, le combo Tchétchénie sera évoqué en encart).
- A/B testing de la landing (ship d'abord, mesure ensuite).

## 3. Architecture technique

### 3.1 PDF — Génération HTML + WeasyPrint

**Stack** :
- Template HTML + CSS print (A4 portrait, 210 × 297 mm)
- Génération via `/opt/homebrew/bin/weasyprint` (binaire, pas le module Python — voir feedback memory)
- Sortie : `public/guide-dagestan.pdf` (servi statiquement par Next.js)
- Source HTML versionné dans `docs/guide-dagestan/` (template + contenu + assets)

**Pourquoi WeasyPrint et pas Gamma / Canva** :
- Contrôle 100 % de la brand MKR (typo, palette, photos, layout)
- Scriptable (regen après update contenu en `weasyprint guide.html guide.pdf`)
- Reproductible pour de futurs guides MKR (Tchétchénie, etc.)
- Gamma : layout générique, brand pauvre — rejeté
- Canva : non scriptable, lent à maintenir — rejeté

**Charte print MKR appliquée** :
- Titres : Roboto Condensed Black 900, uppercase, letter-spacing serré
- Body : Inter ou Crimson Text (à confirmer en revue du template, lecture papier)
- Palette : primary rouge `#E11D2A` (CTA / accents), vert MKR `#1A4D3A` (cards data), fonds crème `#F8F5F0` pour la lisibilité print, sections dark `#0E0E0E` pour chapter openers
- Photos pleine page sur les chapter openers (p1, 4-5, 6-7, 13-14, 17, 20)
- Numérotation discrète footer + mention `mkrcamp.com` en watermark

### 3.2 Architecture 20 pages

| Page | Section | Type | Notes |
|---|---|---|---|
| 1 | Couverture | Hero | Photo montagne Daghestan + titre + ligne Ruslan |
| 2 | Édito Ruslan | Narrative | Pourquoi ce guide, signature Ruslan |
| 3 | Sommaire | Index | 6 sections principales + numéros pages |
| 4-5 | Le Daghestan en chiffres | Infographie | Carte + 6 stats (50 300 km², 3.1 M hab., 1000 m altitude, 30+ olympiques, 3 UFC, langue avar) |
| 6-7 | Pourquoi le Daghestan domine | Story | Héritage Khabib, Islam Makhachev, école Hassavyourt. Pas Khamzat (tchétchène) |
| 8-9 | Visa Russie pas-à-pas | Actionable | Documents par pays FR/CH/BE/CA, délais 5-10 j ouvrés, frais, checklist, lettre invitation MKR |
| 10-11 | Vols | Actionable | Itinéraire Istanbul → Makhachkala, comparatif Turkish Airlines / Pegasus, fenêtres prix, réserver 90 j avant |
| 12 | Budget complet | Tableau | Package 1 290-2 790 €, vol intl, visa, assurance, équipement, perso = total |
| 13-14 | Prép physique 6 semaines | Programme | Semaine par semaine (cardio base 1-2, force 3-4, endurance spé 5, affûtage 6) |
| 15 | Prép mentale | Conseil | Isolement, choc culturel, immersion totale |
| 16 | Équipement complet | Checklist | 2 cols : Vêtements/Protection 7 items + Hygiène/Admin 5 items (cf SITEMAP, pas de Kimono/Trousse/Adaptateur) |
| 17 | Sur place : journée type | Planning | 7h30 → 22h00, 2 repas/jour, horaires Lutte 10h30/17h30 + MMA 11h00/18h00 |
| 18 | Culture & immersion | Culture | Mots avar clés (Salam, Rahmat), religion, gastronomie (khinkali, chudu, urbech) |
| 19 | Témoignages anciens | Preuve | Antoine + LAMP + 3e (à recruter sinon générique) |
| 20 | Prochaines étapes | CTA | 4 sessions 2026/2027, WhatsApp +33 6 66 17 76 91, lien postuler |

### 3.3 Landing `/guide-dagestan` enrichie

**Sections existantes conservées** : PageHero, CinematicReveal "TERRE DE CHAMPIONS", layout 2 cols (cards + form).

**Sections ajoutées** :

1. **Mockup PDF "open book"** dans le hero ou juste après CinematicReveal — visuel central qui montre 2 pages ouvertes (couverture + sommaire). Image Nanobanana.
2. **"Pour qui ce guide"** — 3 micro-personas (Solo aventurier / Famille avec enfants / Club organisé). Cards horizontales.
3. **Sneak peek** — Grid 3-4 thumbnails de pages internes (visa, budget, prep 6 sem).
4. **2 témoignages courts** sur l'utilité du guide ("Ce guide m'a évité 3 erreurs visa", "Le calendrier prep m'a remis en forme avant le camp").
5. **FAQ rapide** — 4 Q/R : "C'est vraiment gratuit ?", "Je le reçois quand ?", "Format ?", "Disponible en anglais ?".
6. **Trust signals** sous le form : "Pas de spam · 1 email max · Désinscription en 1 clic".
7. **Form sticky bas de page** (CinematicReveal cassé + re-rappel CTA).

**Métadonnées** :
- Title gardé "Guide gratuit : partir s'entraîner au Daghestan | MKR"
- Description enrichie pour mentionner "20 pages, téléchargement instantané"
- JSON-LD ajouté : `Schema.Book` ou `Schema.DigitalDocument` pour signaler le livrable
- Canonical inchangé

### 3.4 Backend capture + livraison

**Migration Supabase** (projet `bgwvrzgnoqlqqrvflwav`, eu-central-1) :

```sql
create table guide_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  locale text default 'fr',
  source text,                -- guide-dagestan, future: guide-tchetchenie
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

**API route** `src/app/api/guide-dagestan/route.ts` :

- Validation email (regex + maxlength)
- Upsert sur `(email, source)` (idempotent)
- Insert dans `guide_leads` via `supabase-admin` (service_role)
- Slack notif fire-and-forget (nouvelle entrée lead → Slack webhook si présent)
- Réponse JSON `{ ok: true, downloadUrl: '/guide-dagestan.pdf' }`
- Erreurs explicites (400 invalid email, 500 db error)

**Form `<GuideForm />` refondu** :

- État local `isSubmitting`, `error`, `downloadUrl`
- Submit async fetch POST
- Sur succès : remplacer le form par un panneau "Ton guide est prêt !" + bouton "Télécharger maintenant" qui pointe sur `downloadUrl`
- Sur erreur : message inline
- Champ caché honeypot (anti-bot)
- Track UTM params depuis `useSearchParams`

**Livraison** :
- PDF statique servi par Next.js depuis `public/guide-dagestan.pdf`
- Pas d'email V1 (Resend hors scope, backlog V2)
- Download direct = UX la plus simple, instant gratification

### 3.5 Visuels — pipeline Nanobanana

**Images à générer** (system prompt = `clients Claude/MKR caucasian camp/image-generation/metaprompt.md`) :

| Asset | Usage | Format |
|---|---|---|
| `guide-cover-pdf.webp` | Couverture PDF (p1) + mockup landing | Portrait 2:3 |
| `guide-mockup-openbook.webp` | Hero landing | Paysage 4:3 |
| `guide-page-visa.webp` | Sneak peek landing | Portrait 2:3 |
| `guide-page-budget.webp` | Sneak peek landing | Portrait 2:3 |
| `guide-page-prep.webp` | Sneak peek landing | Portrait 2:3 |
| `pdf-chapter-dagestan.webp` | PDF p4-5 | Paysage |
| `pdf-chapter-heritage.webp` | PDF p6-7 (héritage lutte) | Paysage |
| `pdf-chapter-flight.webp` | PDF p10-11 | Paysage |
| `pdf-chapter-prep.webp` | PDF p13-14 | Paysage |
| `pdf-chapter-arrival.webp` | PDF p17 | Paysage |
| `pdf-chapter-culture.webp` | PDF p18 | Paysage |

Toutes compressées via `baoyu-compress-image` avant intégration. Toutes vérifiées sur les règles globales (pas de second écran, écran face utilisateur, photos sans ampersand, etc. — ne s'applique pas ici, ce sont des photos paysages/sport).

## 4. Découpage en lots livrables

| Lot | Contenu | Bloque le suivant ? |
|---|---|---|
| **L1 — Backend** | Migration Supabase + API route + refonte `GuideForm.tsx` + tests manuels | Non |
| **L2 — Visuels** | 11 images Nanobanana + compression | Non |
| **L3 — PDF** | Template HTML/CSS + contenu rédigé + génération WeasyPrint | Oui pour démo end-to-end |
| **L4 — Landing enrichie** | Sections ajoutées + intégration visuels + form connecté | Oui pour ship |
| **L5 — QA** | Test parcours opt-in → download, audit Lighthouse, vérif règles globales | Oui pour shipping prod |

Ordre d'exécution recommandé : L1 + L2 en parallèle, puis L3 et L4 séquentiel, puis L5.

## 5. Risques et mitigations

| Risque | Impact | Mitigation |
|---|---|---|
| Template WeasyPrint long à régler (typo, marges, sauts page) | +0.5-1 j | Démarrer par template minimal valable, itérer |
| Photos Nanobanana qui ne respectent pas la brand MKR | Visuels génériques | Utiliser `metaprompt.md` MKR systématiquement, valider 1 image avant batch |
| Lead Supabase double envoi (user clique 2x) | UX dégradée | Upsert sur `(email, source)` + bouton disabled pendant submit |
| Domain `mkrcamp.com` jamais vérifié pour Resend | Pas d'email V1 | Acté : V1 sans Resend, download direct |
| Contenu PDF qui copie/colle des sections du site | Texte AI-tell, doublon SEO | Passer le texte au skill `humanizer` + reformuler systématiquement |
| Témoignage "3e" anonyme non sourcé | Fake review | Demander à David / Ruslan des quotes réelles, sinon n'en mettre que 2 (Antoine + LAMP) |

## 6. Conventions et règles à respecter

Issues du SITEMAP MKR + memories globales :

- Pas d'em dash dans le contenu
- Pas d'emoji nulle part (SVG inline ou Icon component)
- Toujours accents FR
- Pas de signe & (toujours "et")
- Pas de fond noir/charcoal en bloc (sauf chapter openers volontaires PDF)
- Compresser toutes les images avant intégration
- Pas de second écran dans les visuels (règle absolue)
- Téléphone : `+33 6 66 17 76 91` (jamais XXX, jamais +41)
- 3 disciplines : Lutte adultes, Lutte enfants, MMA — pas Boxe ni Sambo en discipline proposée
- 2 repas / jour (jamais 3)
- 4 sessions 2026/2027 (Été, Toussaint, Hiver, Pâques)
- Tarifs à partir de 1 490 € / adulte (palier Solo/Duo 1 sem)
- Modèle paiement post-visio (pas Stripe, pas acompte)
- Vol Istanbul → Makhachkala inclus
- Transfert 1h30 aéroport → camp
- Horaires Lutte 10h30/17h30, MMA 11h00/18h00

## 7. Critères de réussite (Definition of Done)

- [ ] PDF de 20 pages produit, servi sur `/guide-dagestan.pdf`, ouvre sans erreur sur Preview macOS et Chrome
- [ ] Form `/guide-dagestan` capture les leads dans Supabase `guide_leads`
- [ ] Bouton download apparaît instantanément après opt-in
- [ ] Page landing enrichie passe Lighthouse mobile ≥ 90 Performance et 100 A11y
- [ ] `next build` passe sans erreur, sitemap à jour si une route a bougé
- [ ] 11 images générées, compressées et intégrées
- [ ] Tous les greps SITEMAP (`grep "tchetch|grozny|3 repas|—"` etc.) passent à 0 sur le PDF html et la landing
- [ ] Memory `project_mkr_guide_dagestan.md` créée avec stack utilisée
- [ ] CLAUDE.md MKR (SITEMAP) mis à jour avec nouvelle entrée "/guide-dagestan" enrichie + nouvelle table Supabase

## 8. Open questions (à valider en review)

1. **Témoignage #3 pour la p19** : on garde 2 témoignages (Antoine + LAMP) ou tu peux fournir un quote d'un autre ancien participant ? Sinon je n'en mets que 2.
2. **Signature édito p2** : "Ruslan, fondateur MKR" ou "Ruslan Magomedov" (nom complet) ? Tendance à mettre prénom seul pour l'intimité.
3. **Couleur sections** : tu valides palette `#E11D2A` rouge primaire + `#1A4D3A` vert MKR + crème `#F8F5F0` ? Sinon dis-moi quelle palette MKR officielle on prend (je sourcerai depuis `brand-identity/`).
4. **Future-proofing Tchétchénie** : on prévoit un encart "Bientôt : guide Tchétchénie pour le MMA" en p20, ou on n'en parle pas du tout V1 ?
