# Visio de sélection en fin de candidature — Design

Date : 2026-06-17
Projet : MKR Caucasian Camp (Next.js 16, App Router, i18n FR/EN)
Statut : validé (brainstorming), prêt pour plan d'implémentation

## Objectif

À la fin du tunnel d'inscription (`/inscription`), le candidat doit pouvoir
réserver sa **visio de sélection** avec Ruslan directement depuis l'écran de
confirmation, via un calendrier Cal.com inline (créneau `15min`). La réservation
déclenche nativement l'envoi de l'invitation calendrier (iCal / .ics) au candidat
et à Ruslan. En parallèle, le candidat reçoit un email de confirmation contenant
le récap de sa candidature et le lien de réservation, présenté comme l'étape pour
valider son dossier.

Lien Cal.com : `https://cal.com/ruslan-mukhtarov-mkr/15min`
(calLink : `ruslan-mukhtarov-mkr/15min`)

## Décisions validées

1. **Affichage du booking** : calendrier Cal.com **inline** dans l'écran de succès
   (pas une modale).
2. **Hiérarchie** : le bloc de réservation est l'**action principale** de l'écran
   de succès ; la StoryCard à télécharger passe en action secondaire en dessous.
3. **Email candidat** : oui, via Resend (déjà câblé, expéditeur `mkr@dkdp.ch`),
   en plus de la notification existante à Ruslan.
4. **Tracking en base (webhook Cal.com)** : **hors périmètre v1**. Les RDV sont
   visibles dans le compte Cal.com. Pourra être ajouté en phase 2.

## Architecture

### Composants impactés

| Élément | Fichier | Nature |
|--------|---------|--------|
| Dépendance Cal | `package.json` | Ajout `@calcom/embed-react` |
| Config Cal | `.env.local` + `.env.example` | `NEXT_PUBLIC_CAL_LINK` (défaut `ruslan-mukhtarov-mkr/15min`) |
| Composant booking | `src/components/VisioBooking.tsx` | Nouveau |
| Écran de succès | `src/components/InscriptionLayout.tsx` (~750-783) | Réordonné |
| Email candidat | `src/app/api/inscription/route.ts` | Nouvelle fonction `notifyCandidate()` |
| Helpers email | `src/lib/email.ts` | Réutilisés (sendMail, wrapEmail, row, escapeHtml) |
| i18n | messages next-intl FR + EN | Nouvelles clés |

### 1. Dépendance et configuration

- Ajouter `@calcom/embed-react` aux dependencies (composant React officiel, évite
  d'injecter le `<script>` brut — plus sûr en React 19 / Next 16). Pattern déjà
  utilisé chez DKDP.
- `NEXT_PUBLIC_CAL_LINK=ruslan-mukhtarov-mkr/15min` exposé côté client. Valeur de
  repli codée en dur dans le composant si la variable est absente.

### 2. `VisioBooking.tsx` (nouveau, 'use client')

Props :
- `prenom: string`
- `nom: string`
- `email: string`
- `locale: 'fr' | 'en'`

Comportement :
- Rend le calendrier Cal.com **inline** via `<Cal>` de `@calcom/embed-react`,
  `calLink` issu de `NEXT_PUBLIC_CAL_LINK`.
- `config` : `{ layout: 'month_view', name: "<prenom> <nom>", email }`
  pour **pré-remplir** le formulaire Cal (le lead ne retape pas ses coordonnées).
- Langue de l'embed alignée sur `locale`.
- Titre/sous-titre localisés : « Dernière étape — réservez votre visio de sélection
  pour valider votre dossier ».
- Respecte la charte MKR (couleurs, typographie) et `prefers-reduced-motion`.

### 3. Écran de succès réordonné (`InscriptionLayout.tsx`)

État `submitted === true`, nouvel ordre :
1. Icône + label « Candidature reçue » + titre (existant).
2. **`<VisioBooking prenom nom email locale />`** — action principale.
3. `<StoryCard />` — action secondaire, sous un séparateur/intitulé « Partage ».
4. CTAs « Accueil » / « Sessions » (existants, inchangés).

Les valeurs `prenom`, `nom`, `email` proviennent de `form`. La `locale` provient
du contexte next-intl déjà disponible dans le composant.

### 4. Email de confirmation candidat (`route.ts`)

Nouvelle fonction `notifyCandidate(payload)` :
- **Fire-and-forget** comme `notifySlack` / `notifyEmail`, déclenchée après l'insert
  réussi de la candidature, ne bloque jamais la réponse à l'utilisateur.
- Destinataire : email du candidat (`payload.email`).
- Expéditeur : `MKR_EMAIL_FROM` (`mkr@dkdp.ch`).
- Sujet localisé, ex FR : « Votre candidature MKR — réservez votre visio de sélection ».
- Corps (via `wrapEmail` + `row`), localisé selon `submission_language` :
  - Message de remerciement / prochaine étape.
  - Récap : camp/discipline, durée (si applicable).
  - **Bouton CTA** « Réserver ma visio » → `https://cal.com/ruslan-mukhtarov-mkr/15min`.
  - Mention que le RDV vaut validation du dossier.
- `tag: 'inscription-candidate'`.
- La notification à Ruslan (`notifyEmail`) reste inchangée.

### 5. i18n

Ajouter aux fichiers de messages FR et EN les clés pour :
- Le bloc `VisioBooking` (titre, sous-titre, éventuel fallback de chargement).
- Le séparateur StoryCard (« Partager votre participation »).
- Le contenu de l'email candidat (sujet + corps), si géré côté serveur via un petit
  dictionnaire local dans `route.ts` (le serveur n'a pas le contexte next-intl du
  client) — clés FR/EN dans un objet constant.

## Flux

```
Soumission formulaire valide
  → POST /api/inscription
      → upsert candidate + insert candidature (existant)
      → notifySlack (existant, fire-and-forget)
      → notifyEmail  → Ruslan (existant, fire-and-forget)
      → notifyCandidate → Candidat avec lien Cal (NOUVEAU, fire-and-forget)
      → réponse { ok, candidatureId }
  → InscriptionLayout passe submitted = true
      → VisioBooking (calendrier inline, pré-rempli)  [action principale]
      → StoryCard (téléchargement)                    [action secondaire]
  → Le lead réserve un créneau dans le calendrier
      → Cal.com envoie l'iCal au lead ET à Ruslan (natif)
```

## Gestion des erreurs

- `notifyCandidate` enveloppé en try/catch (comme les autres notifs) : un échec
  d'email n'impacte ni la soumission ni l'affichage du booking.
- Si `NEXT_PUBLIC_CAL_LINK` absent → fallback codé en dur, l'embed fonctionne quand
  même.
- Si l'embed Cal échoue à charger (réseau) → afficher un lien texte de repli vers
  `https://cal.com/ruslan-mukhtarov-mkr/15min`.

## Tests / vérification

- QA manuelle (Playwright dispo) : parcours complet d'une candidature jusqu'à
  l'écran de succès, vérifier que le calendrier inline s'affiche et est pré-rempli.
- Vérifier l'email candidat reçu (FR et EN) avec le bon lien.
- Vérifier responsive (mobile) : le calendrier inline ne doit pas casser la mise
  en page ni provoquer d'overflow horizontal.

## Hors périmètre v1

- Webhook Cal.com → Supabase (colonne `visio_booked_at`, badge admin « visio
  réservée »). Réservé à une phase 2.
```
