# Codes de recommandation — Design V1

**Date** : 2026-05-23
**Projet** : MKR Caucasian Camp (mkrcamp.com)
**Auteur** : David Khazaei + Claude
**Statut** : Approuvé, prêt pour implémentation

## Contexte

David lance des partenariats avec des salles de sport et des influenceurs lutte/MMA pour générer des candidatures qualifiées au camp MKR. Chaque partenariat est payé 50 € interne quand le candidat recommandé paie effectivement son package (status `soldee`).

Le tunnel d'inscription doit donc collecter un code de recommandation optionnel, le valider contre une liste de codes connus, et déclencher automatiquement le tracking du bonus 50 € quand la candidature aboutit.

Codes initiaux au lancement V1 :

| Code | Partenaire | Type | Note |
|---|---|---|---|
| `STRIKE` | Strike Academy (Progress Gym SA) | gym | Kevin Leone, partenariat 2026 |
| `ZEZE74` | Zelimkhan (@zelimkhan_74) | influencer | Lutteur champion, Tchélyabinsk (oblast 74) |
| `RAKHIM86` | Rakhim (@rakhim.mgd) | influencer | Lutteur champion, Khanty-Mansi (oblast 86) |

## Périmètre V1

**Inclus :**
- Champ optionnel `Code de recommandation` en Step Identité du tunnel `/inscription` (visible dans les 4 tunnels : session, custom, famille, groupe).
- Liste de codes hardcodée dans `src/data/referral-codes.ts` (re-deploy pour ajouter un code, OK pour 2-10 partenaires au démarrage).
- Validation live au form avec feedback non bloquant (3 états : neutre, reconnu, non reconnu).
- Stockage en colonnes dédiées dans `candidatures` (pas en `form_data` jsonb, pour faciliter filtres/agrégations admin).
- Trigger automatique `pending → due` quand le status candidature passe à `soldee`.
- UI admin : badges dans la liste, panel dédié dans la fiche, bouton "Marquer payé" avec modal date + méthode.

**Exclu (backlog ultérieur) :**
- Page `/admin/referrals` agrégée par partenaire (V2 quand >5 partenaires actifs).
- Tracking lien `mkrcamp.com/?ref=strike` avec cookie 30 jours (V2).
- Email automatique au partenaire à la conversion (V2, dépend de Resend transactional).
- Dashboard partenaire avec login (V3).
- Bénéfice candidat (réduction, cadeau) — explicitement écarté pour V1.

## Architecture data

### Fichier `src/data/referral-codes.ts`

```ts
export type ReferralCode = {
  code: string              // 'STRIKE' — stocké uppercase, matché uppercase
  partnerName: string       // 'Strike Academy (Progress Gym SA)'
  partnerContact?: string   // email, URL Insta, tel interne (jamais affiché public)
  type: 'gym' | 'influencer' | 'coach' | 'other'
  bonusEur: number          // 50 par défaut, peut varier par partenaire
  active: boolean           // false = code valide en historique mais plus accepté en nouvelle inscription
  notes?: string            // contexte interne
}

export const REFERRAL_CODES: ReferralCode[] = [
  {
    code: 'STRIKE',
    partnerName: 'Strike Academy (Progress Gym SA)',
    type: 'gym',
    bonusEur: 50,
    active: true,
    notes: 'Kevin Leone — partenariat 2026',
  },
  {
    code: 'ZEZE74',
    partnerName: 'Zelimkhan (@zelimkhan_74)',
    partnerContact: 'https://instagram.com/zelimkhan_74',
    type: 'influencer',
    bonusEur: 50,
    active: true,
    notes: 'Lutteur champion — Tchélyabinsk (oblast 74)',
  },
  {
    code: 'RAKHIM86',
    partnerName: 'Rakhim (@rakhim.mgd)',
    partnerContact: 'https://instagram.com/rakhim.mgd',
    type: 'influencer',
    bonusEur: 50,
    active: true,
    notes: 'Lutteur champion — Khanty-Mansi (oblast 86)',
  },
]

export function findReferralCode(input: string): ReferralCode | null {
  const normalized = input.trim().toUpperCase()
  if (!normalized) return null
  return REFERRAL_CODES.find(c => c.code === normalized && c.active) ?? null
}
```

**Normalisation** : `trim().toUpperCase()` à toutes les comparaisons. Le candidat peut taper `strike`, ` Strike `, `STRIKE` — tous matchent. Le code stocké en Supabase est toujours en uppercase pour cohérence admin.

## Form `InscriptionLayout.tsx`

### Nouveau champ FormData

```ts
codeRecommandation: string  // '' par défaut, optionnel
```

Ajouté à `INITIAL_FORM_DATA` et au reset/init.

### Position UX

Step 1 « Identité », dernier champ après le téléphone, dans son propre `cand-row` ou wrapper visuel discret. Pas inclus dans `validate()` du step (jamais bloquant).

### Composant champ

```tsx
<Field
  label="Code de recommandation"
  hint="Si un coach, un club partenaire ou un influenceur t'a recommandé MKR, note son code ici"
>
  <input
    className={`cand-input ${referralFeedback.tone}`}
    type="text"
    placeholder="Ex : STRIKE (optionnel)"
    value={form.codeRecommandation}
    onChange={e => set('codeRecommandation', e.target.value)}
    autoComplete="off"
    aria-describedby="referral-feedback"
  />
  {referralFeedback.message && (
    <span id="referral-feedback" className={`cand-referral-feedback cand-referral-feedback--${referralFeedback.tone}`}>
      {referralFeedback.message}
    </span>
  )}
</Field>
```

### Logique de feedback live

Computed via `useMemo` (pas debounce nécessaire pour 3 codes hardcodés, le match est synchrone et instantané) :

```ts
const referralFeedback = useMemo(() => {
  const raw = form.codeRecommandation.trim()
  if (!raw) return { tone: 'neutral' as const, message: null }
  const match = findReferralCode(raw)
  if (match) {
    return {
      tone: 'success' as const,
      message: `✓ Recommandé par ${match.partnerName}`,
    }
  }
  return {
    tone: 'warning' as const,
    message: 'Code non reconnu — on va vérifier de notre côté',
  }
}, [form.codeRecommandation])
```

### CSS (`globals.css`)

Nouvelles classes :
- `.cand-input.success` / `.cand-input.warning` : bordure verte/orange selon état
- `.cand-referral-feedback` : petit texte sous le champ
- `.cand-referral-feedback--success` : couleur verte (`var(--success)` si défini, sinon `#15803d`)
- `.cand-referral-feedback--warning` : couleur orange (`var(--warning)` ou `#c2410c`)

Pas de couleur rouge — un code non reconnu n'est PAS une erreur.

### Submit

Le champ est envoyé via le payload comme `code_recommandation` (snake_case côté API). Si vide, envoyé en string vide (l'API le traite).

## Backend `/api/inscription/route.ts`

### Lecture et validation du code

```ts
import { findReferralCode } from '@/data/referral-codes'

// Dans le POST handler, après parsing payload :
const rawCode = (payload.code_recommandation ?? '').trim()
const matchedReferral = rawCode ? findReferralCode(rawCode) : null

const referralFields = rawCode
  ? {
      referral_code: rawCode.toUpperCase(),
      referral_code_valid: matchedReferral !== null,
      referral_partner_name: matchedReferral?.partnerName ?? null,
      referral_partner_type: matchedReferral?.type ?? null,
      referral_bonus_eur: matchedReferral?.bonusEur ?? null,
      referral_payout_status: matchedReferral ? 'pending' : 'not_applicable',
    }
  : {
      referral_code: null,
      referral_code_valid: null,
      referral_partner_name: null,
      referral_partner_type: null,
      referral_bonus_eur: null,
      referral_payout_status: 'not_applicable',
    }

// Insert candidatures avec ...referralFields
```

### Slack notif

Ligne ajoutée selon le cas :
- Code valide → `🤝 Recommandé par : Strike Academy (code STRIKE — bonus 50 € pending)`
- Code invalide → `⚠ Code recommandation tapé mais non reconnu : "Strke"`
- Pas de code → ligne absente

### Audit log

Entrée à l'insert si code valide :
```
action: 'referral_attached'
meta: { code: 'STRIKE', partner: 'Strike Academy', bonus_eur: 50 }
```

## Migration Supabase

Migration : `add_referral_code_columns_to_candidatures`

```sql
ALTER TABLE candidatures
  ADD COLUMN referral_code text,
  ADD COLUMN referral_code_valid boolean,
  ADD COLUMN referral_partner_name text,
  ADD COLUMN referral_partner_type text
    CHECK (referral_partner_type IN ('gym','influencer','coach','other')),
  ADD COLUMN referral_bonus_eur integer,
  ADD COLUMN referral_payout_status text
    CHECK (referral_payout_status IN ('not_applicable','pending','due','paid','cancelled')),
  ADD COLUMN referral_payout_paid_at timestamptz,
  ADD COLUMN referral_payout_method text
    CHECK (referral_payout_method IN ('virement','cash','autre') OR referral_payout_method IS NULL);

CREATE INDEX idx_candidatures_referral_payout
  ON candidatures(referral_payout_status)
  WHERE referral_payout_status IN ('due','paid');

CREATE INDEX idx_candidatures_referral_code
  ON candidatures(referral_code)
  WHERE referral_code IS NOT NULL;

COMMENT ON COLUMN candidatures.referral_partner_name IS
  'Snapshot du nom du partenaire au moment de l''inscription. Conservé même si le code est désactivé/renommé après.';
COMMENT ON COLUMN candidatures.referral_bonus_eur IS
  'Snapshot du montant du bonus au moment de l''inscription, en euros.';
```

**États du status payout :**
- `not_applicable` : pas de code ou code invalide → rien à payer.
- `pending` : code valide, candidature pas encore validée/soldée.
- `due` : candidature passée à `soldee` → 50 € à payer au partenaire.
- `paid` : payé (date + méthode renseignées).
- `cancelled` : candidature annulée/refundée après → bonus annulé (revert manuel possible).

## Trigger automatique `pending → due`

Dans le PATCH handler `src/app/api/admin/candidature/[id]/route.ts`, lors d'un changement de status :

```ts
const updates: Record<string, unknown> = { status: newStatus, ... }

if (
  newStatus === 'soldee'
  && current.referral_code_valid === true
  && current.referral_payout_status === 'pending'
) {
  updates.referral_payout_status = 'due'
  auditEntries.push({
    action: 'referral_due',
    meta: {
      partner: current.referral_partner_name,
      bonus_eur: current.referral_bonus_eur,
    },
  })
  // Slack notif optionnelle (fire-and-forget) :
  // `💸 Bonus ${bonus}€ dû à ${partner} (candidature #${id})`
}

// Inverse : si on annule une candidature soldée
if (newStatus === 'annulee' && current.referral_payout_status === 'due') {
  updates.referral_payout_status = 'cancelled'
  auditEntries.push({ action: 'referral_cancelled', meta: { reason: 'candidature_cancelled' } })
}
```

Note : si la candidature est `paid` (bonus déjà payé) et qu'on l'annule après, on **ne** revient pas en `cancelled` automatiquement — c'est une décision business à faire manuellement.

## UI admin

### Liste `/admin/inscriptions` (`InscriptionsList.tsx`)

**Nouveaux badges à côté du nom du candidat :**

| Cas | Badge | Couleur |
|---|---|---|
| Code valide gym | `🤝 STRIKE` | bleu |
| Code valide influencer | `🤝 ZEZE74` | violet |
| Code valide coach | `🤝 XXX` | vert |
| Code invalide saisi | `⚠ STRKE` | orange |
| Bonus dû | `💸 50 € dû` (en plus) | jaune accent |

**Nouveau filtre en tête de liste :**

Dropdown `Code partenaire` : `Tous` / `STRIKE` / `ZEZE74` / `RAKHIM86` / `Sans code` / `Code invalide`.

La query Supabase filtre `referral_code = X` ou `referral_code_valid = false` selon le cas.

### Détail `/admin/inscriptions/[id]`

Nouveau panel "Recommandation" affiché si `referral_code IS NOT NULL` :

```
RECOMMANDATION
─────────────────
Code saisi      STRIKE  ✓ (ou ⚠ si invalide)
Partenaire      Strike Academy (Progress Gym SA)
Type            Salle de sport
Bonus           50 €
Status payout   [badge couleur : pending / due / paid / cancelled]

[Si due] Bouton "Marquer payé" → modal
[Si paid] Ligne "Payé le 15/06/2026 par virement" + bouton "Annuler le paiement"
```

**Modal "Marquer payé" :**
- Date paiement (date input, défaut aujourd'hui)
- Méthode (select : virement / cash / autre)
- Bouton Confirmer → PATCH `referral_payout_status = 'paid'`, `referral_payout_paid_at = date`, `referral_payout_method = method`
- Audit log : `referral_paid` avec meta `{ date, method, amount, partner }`

**Bouton "Annuler le paiement" (depuis status `paid`) :**
- Confirme modal simple "Sûr ?"
- Reset à `due` + clear `paid_at` + clear `method`
- Audit log : `referral_payout_reverted`

### API admin PATCH

Endpoint existant `/api/admin/candidature/[id]/route.ts` étendu pour accepter :
- `referral_payout_status` (transitions `due → paid`, `paid → due`, `due → cancelled`)
- `referral_payout_paid_at`
- `referral_payout_method`

Validation : ne pas permettre `paid` sans `paid_at` et `method`.

## Tests / vérification manuelle V1

Pas de tests unitaires automatisés V1 (le projet n'en a pas en place). Checklist manuelle à exécuter :

1. **Form sans code** → submit OK, Supabase montre `referral_code = NULL`, `referral_payout_status = 'not_applicable'`.
2. **Form avec `strike`** (lowercase) → feedback vert "✓ Recommandé par Strike Academy", submit, Supabase montre `referral_code = 'STRIKE'`, `referral_code_valid = true`, `referral_payout_status = 'pending'`.
3. **Form avec `XYZ123`** (invalide) → feedback orange non bloquant, submit OK, Supabase montre `referral_code = 'XYZ123'`, `referral_code_valid = false`, `referral_payout_status = 'not_applicable'`.
4. **Admin change status candidature avec code STRIKE à `soldee`** → status `pending → due` auto, badge `💸 50 € dû` apparaît dans la liste.
5. **Admin click "Marquer payé" + virement + 2026-06-01** → status `due → paid`, badge devient "Payé le 1er juin 2026 par virement".
6. **Liste admin filtrée sur `STRIKE`** → ne montre que les candidatures avec ce code.
7. **Slack notif sur inscription avec code valide** → ligne `🤝 Recommandé par : Strike Academy` présente.
8. **Récup historique** : les anciennes candidatures (insérées avant la migration) ont toutes leurs nouveaux champs à NULL → pas de bug dans la liste ni dans la fiche.

## Risques et notes

- **Évolution du data file** : ajouter un partenaire = éditer `referral-codes.ts` + commit + push + Vercel deploy. Pas de modif live sans deploy. Acceptable jusqu'à ~10 partenaires.
- **Renommage d'un code** : si on rebadge `STRIKE → STRIKE2026`, les vieilles candidatures gardent `STRIKE` (snapshot). Pas de migration nécessaire.
- **Suppression d'un partenaire** : passer `active: false` pour interdire de nouvelles inscriptions avec ce code (les nouvelles deviendront "invalides"), mais conserver l'entry pour que les vieilles candidatures restent traçables.
- **Cas edge** : si un candidat se ré-inscrit (dedup par email) avec un code différent, le comportement actuel est de garder la 1re inscription (dedup `(candidate_id, tunnel_type, camp_discipline)`). Le 2e code est ignoré. Acceptable V1 — à reconsidérer si ça pose problème en pratique.
- **Pas de bénéfice candidat** : décidé explicitement. Si on ajoute une réduction plus tard, ça toucherait `pricing.ts` + form recap + `package_amount_cents` calculé côté serveur. Hors scope.

## Glossaire

- **Code valide** : la chaîne saisie matche un `REFERRAL_CODES[].code` actif (après normalisation `trim().toUpperCase()`).
- **Code invalide** : chaîne saisie non vide qui ne matche aucun code actif. Le candidat n'est PAS bloqué.
- **Bonus pending** : le 50 € existe en virtuel mais n'est pas encore dû tant que le candidat n'a pas payé.
- **Bonus due** : le 50 € est dû au partenaire, à payer par David hors ligne (virement/cash).
- **Bonus paid** : payé, date + méthode renseignées dans l'admin.
