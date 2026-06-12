# Liens d'affiliation + commission en pourcentage — Design

Date : 2026-06-12
Statut : validé (approche A)
Périmètre : site MKR (`nextjs/`), système de parrainage influenceurs/partenaires

## Contexte

MKR dispose déjà d'un système de parrainage (`data/referral-codes.ts` + `/admin/referrals`) :

- Partenaires définis dans un fichier data committé en git (5 actifs : Strike, Zelimkhan, Rakhim, Tengiz, MMA Spirit).
- Code capté via le menu « Comment as-tu connu le camp ? » du formulaire ou tapé à la main.
- Commission = **forfait fixe** (`bonusEur`, 50 € pour tous), figé à l'inscription.
- Workflow de paiement : `pending` → `due` (au passage de la candidature en `soldee`) → `paid` (Ruslan coche manuellement). État `cancelled` possible.
- Colonnes Supabase sur `candidatures` : `referral_code`, `referral_code_valid`, `referral_partner_name`, `referral_partner_type`, `referral_bonus_eur`, `referral_payout_status`, `referral_payout_paid_at`, `referral_payout_method`.
- Le CA réel par réservation existe : `package_amount_cents` (saisi manuellement par Ruslan post-visio).
- Le dashboard `/admin/referrals` agrège `referral_bonus_eur` par partenaire (somme TS, pas SQL).

## Objectif

Trois évolutions par-dessus l'existant, sans réécriture :

1. **Lien d'affiliation partageable** : un influenceur partage un lien (ex. `mkrcamp.com/?ref=paoloz`) au lieu de faire taper un code.
2. **Commission en % du CA** (PaoloZ = 10 %), à faire **coexister** avec le forfait fixe.
3. **Configurable par partenaire** : chaque partenaire a son propre modèle (forfait ou %, taux variable).

Premier partenaire % : **PaoloZ**.

## Décisions validées

| Décision | Choix |
|---|---|
| Base de calcul du % | **Montant total encaissé** (`package_amount_cents` complet, tout inclus) |
| Format du lien | **`mkrcamp.com/?ref=<code>`** (query param + cookie) |
| Modèle forfait/% | **Coexistent, configurables par partenaire** |
| Déclenchement / attribution | **À la soldée, last-touch, cookie 60 jours** |
| Approche | **A** — étendre le data-file existant (pas de table DB, pas de CRUD admin) |

Note business : 10 % d'une réservation « tout inclus » (visa + vol intérieur compris) peut représenter une part importante de la marge réelle. David a tranché pour le montant total encaissé par simplicité et transparence vis-à-vis de l'influenceur.

## Architecture

### 1. Moteur de commission (data + calcul)

Extension du type dans `data/referral-codes.ts` :

```ts
export type CommissionType = 'flat' | 'percent'

export type ReferralCode = {
  code: string
  partnerName: string
  partnerContact?: string
  type: ReferralPartnerType
  commissionType: CommissionType   // nouveau
  bonusEur?: number                // requis si commissionType === 'flat'
  commissionPct?: number           // requis si commissionType === 'percent' (ex: 10)
  active: boolean
  notes?: string
  sourceDecouverteLabel?: string
  sourceDecouverteValue?: string
}
```

- Les 5 partenaires existants reçoivent `commissionType: 'flat'` (leur `bonusEur: 50` est conservé).
- PaoloZ : `commissionType: 'percent'`, `commissionPct: 10`.
- Helper de validation interne (ou commentaire) garantissant la cohérence type/champs.

Helper de calcul centralisé (nouveau, dans `referral-codes.ts` ou `lib/`) :

```ts
// Retourne le montant de commission en euros (arrondi) ou null si indéterminable.
function computeCommissionEur(
  partner: { commissionType: CommissionType; bonusEur?: number; commissionPct?: number },
  packageAmountCents: number | null
): number | null
```

- `flat` → `bonusEur`.
- `percent` → `packageAmountCents` connu : `round(packageAmountCents * pct / 100 / 100)` ; inconnu : `null`.

### 2. Snapshot à l'inscription (`api/inscription/route.ts`)

On ajoute au snapshot existant :
- `referral_commission_type` (`'flat' | 'percent'`)
- `referral_commission_pct` (number | null)

Comportement de `referral_bonus_eur` à l'inscription :
- `flat` → snapshot immédiat (`bonusEur`), comme aujourd'hui.
- `percent` → **`null`** (le CA n'est pas encore connu).

`referral_payout_status` initial : `pending` si code valide, sinon `not_applicable` (inchangé).

### 3. Calcul du % au bon moment (`api/admin/candidature/[id]/route.ts`)

Deux points d'accroche, en réutilisant la logique existante :

a. **Transition vers `soldee`** (bloc auto-trigger existant `pending → due`) :
   - Si `referral_commission_type === 'percent'` et `package_amount_cents` présent → calculer et écrire `referral_bonus_eur`.
   - Si `package_amount_cents` absent → passer quand même `due` mais laisser `referral_bonus_eur = null` (sera flaggé en UI). Le montant se calculera à la saisie du CA.

b. **Édition de `package_amount_cents`** (bloc existant) :
   - Si partenaire `percent` et `referral_payout_status ∈ {pending, due}` → **recalculer** `referral_bonus_eur`.
   - Émettre un événement d'historique (`referral_bonus_recomputed`) pour la traçabilité.

`referral_bonus_eur` reste **le montant payable canonique** → le dashboard qui le somme fonctionne sans modification de sa logique d'agrégation.

### 4. Migration Supabase

Ajouter deux colonnes nullables sur `candidatures` :
- `referral_commission_type text` (check : `flat`/`percent`/null)
- `referral_commission_pct numeric` (nullable)

Rétro-compat : les candidatures existantes ont ces colonnes à `null` → traitées comme `flat` (legacy) puisque leur `referral_bonus_eur` est déjà figé.

### 5. Capture du lien (`proxy.ts`)

`src/proxy.ts` (déjà présent, gère l'i18n — Next 16, doit rester dans `src/`) :
- Lire `searchParams.get('ref')`.
- Normaliser (`trim().toUpperCase()`) et **valider** via `findReferralCode` (actif uniquement).
- Si valide → poser cookie `mkr_ref` : valeur = code normalisé, `Max-Age` 60 j, `Path=/`, `SameSite=Lax`, **non-httpOnly** (lisible par le formulaire client).
- Si invalide/inactif → ne rien faire (pas de cookie, pas de fausse attribution).
- Ne pas casser le routing i18n existant : ajouter la pose de cookie sur la réponse, ne pas modifier la logique de redirection locale.

### 6. UX visiteur — bandeau de confiance

- Quand `mkr_ref` est présent et valide, afficher un bandeau subtil, dismissable, en haut de page : « Tu viens de la part de **{partnerName}** ».
- `aria-live="polite"`, bouton fermer accessible (44 px tactile), mémorise la fermeture (cookie/localStorage `mkr_ref_banner_dismissed`), ne réapparaît pas dans la session.
- Pas de bandeau si pas de ref valide.

### 7. UX formulaire d'inscription

- Si cookie `mkr_ref` présent : pré-remplir `code_recommandation` et **remplacer le champ brut** par un encart de confirmation vert : « Recommandé par **{partnerName}** ✓ » + lien discret « Ce n'est pas le cas ? Retirer » (efface le code + le cookie côté client).
- Synchroniser le menu « Comment as-tu connu le camp ? » sur le partenaire correspondant (via `findCodeBySourceValue` / `sourceDecouverteValue`) pour éviter une double saisie incohérente.
- Back-compat : saisie manuelle d'un code toujours possible. Choix manuel explicite du candidat prime sur le pré-remplissage.
- États : cookie valide (encart vert), code tapé inconnu (message neutre non bloquant), aucun code (flux normal).
- Accessibilité : `aria-live` sur l'encart, focus géré au retrait.

### 8. UX admin — dashboard `/admin/referrals`

- Nouvelle colonne **Modèle** : badge `Forfait 50 €` ou `10 % du CA`.
- Colonne montant pour les % : afficher la base et le calcul (`10 % × 2 590 € = 259 €`).
- **Garde-fou** : candidature `soldee` + partenaire `percent` + `package_amount_cents` absent → ligne en orange « CA à saisir pour calculer la commission ».
- Totaux « à payer / payé / annulé » inchangés (somme de `referral_bonus_eur`, les `null` comptent 0).
- **Helper de partage** : en tête de page, pour chaque partenaire actif, son lien prêt à copier (`https://mkrcamp.com/?ref=<code lowercased>`) avec bouton « Copier ».

### 9. UX admin — fiche candidature `/admin/inscriptions/[id]`

- Bloc commission affichant le détail selon le modèle :
  - `flat` : « Forfait partenaire : 50 € ».
  - `percent` : « Commission {partnerName} : {pct} % × {CA} € = {montant} € », ou « CA à saisir » si montant inconnu.
- Recalcul reflété en direct après modification de `package_amount_cents`.

## Données PaoloZ (à ajouter dans `referral-codes.ts`)

```ts
{
  code: 'PAOLOZ',
  partnerName: 'PaoloZ (@paolo_irl)',
  partnerContact: 'https://instagram.com/paolo_irl · WhatsApp +33 6 38 49 17 22',
  type: 'influencer',
  commissionType: 'percent',
  commissionPct: 10,
  active: true,
  notes: 'Influenceur - partenariat 2026, commission 10% du CA encaissé',
  sourceDecouverteLabel: '@paolo_irl (PaoloZ)',
  sourceDecouverteValue: 'paolo-irl',
}
```

## Cas limites

- `?ref` inconnu ou partenaire inactif → ignoré, aucun cookie, aucun bandeau.
- Cookie expiré (>60 j) → flux normal, pas d'attribution.
- Plusieurs liens cliqués → last-touch (le dernier `?ref` valide écrase le cookie).
- Conflit cookie vs choix manuel du candidat → ce qui est soumis fait foi.
- Arrondi : calcul en cents, arrondi à l'euro pour l'affichage et le stockage `referral_bonus_eur`.
- Annulation : `due → cancelled` géré comme aujourd'hui ; le montant reste tracé pour info.
- Candidatures legacy (colonnes commission `null`) : traitées comme `flat` figé.

## RGPD

Cookie `mkr_ref` = cookie fonctionnel d'attribution, sans PII ni tracking tiers. Ajouter une ligne dans la page politique de confidentialité / cookies. Pas de bandeau de consentement bloquant requis pour ce seul usage.

## i18n (FR + EN)

Le site est bilingue (next-intl, 34 namespaces). Les textes nouveaux côté visiteur doivent être traduits FR + EN :
- Bandeau de confiance (« Tu viens de la part de X » / « You were referred by X »).
- Encart formulaire (« Recommandé par X ✓ » + « Ce n'est pas le cas ? Retirer »).
- Message « code non reconnu » neutre.

La capture `?ref` dans `proxy.ts` est indépendante de la locale (fonctionne sur `/` et `/en`). Le cookie est partagé entre locales. L'admin reste FR uniquement (interne).

## Hors-scope v1 (YAGNI)

- Tracking des clics par influenceur (vanity metric ; la conversion suffit au paiement).
- Portail influenceur (login + dashboard perso) — approche C écartée.
- Payouts automatiques (les paiements MKR restent manuels cash/virement).
- Migration des partenaires vers une table Supabase + CRUD admin — approche B, repoussée tant que le volume reste faible.

## Fichiers touchés (synthèse)

- `src/data/referral-codes.ts` — type étendu + helper de calcul + PaoloZ + flag les 5 existants `flat`.
- `src/proxy.ts` — capture `?ref` + cookie `mkr_ref`.
- `src/app/api/inscription/route.ts` — snapshot `commission_type`/`commission_pct`, `bonus_eur=null` pour %.
- `src/app/api/admin/candidature/[id]/route.ts` — calcul % à la soldée + recalcul sur édition du CA.
- Composant formulaire d'inscription — encart « Recommandé par X » + synchro dropdown + lecture cookie.
- Composant bandeau de confiance (nouveau).
- `src/app/admin/referrals/page.tsx` — colonne Modèle, calcul %, garde-fou CA, helper liens.
- `src/app/admin/inscriptions/[id]/page.tsx` — bloc commission détaillé.
- Migration Supabase — 2 colonnes sur `candidatures`.
- Page politique de confidentialité — mention cookie `mkr_ref`.
