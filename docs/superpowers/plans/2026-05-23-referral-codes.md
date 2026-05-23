# Codes de recommandation V1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un champ optionnel "Code de recommandation" au tunnel d'inscription MKR, valider contre une liste hardcodée (STRIKE, ZEZE74, RAKHIM86), stocker en colonnes dédiées Supabase, et tracker le bonus 50 € du partenaire jusqu'au paiement via l'admin.

**Architecture:** Data file TypeScript pour la liste de codes (re-deploy pour ajouter un partenaire). Form `InscriptionLayout.tsx` reçoit un champ texte en Step Identité avec validation live non bloquante. API `/api/inscription` enrichit la candidature avec 7 nouvelles colonnes (code, valid, partner_name snapshot, partner_type, bonus_eur snapshot, payout_status, paid_at, method). API admin PATCH déclenche automatiquement `pending → due` quand le status passe à `soldee`, et `due/pending → cancelled` quand la candidature est annulée. UI admin affiche un badge par candidature et un panel "Recommandation" en fiche détail avec bouton "Marquer payé".

**Tech Stack:** Next.js 16.2.2 App Router, TypeScript, Supabase (project `bgwvrzgnoqlqqrvflwav` eu-central-1, accès via MCP `mcp__supabase__apply_migration`), CSS vanilla dans `globals.css`. Pas de test runner installé sur le projet : vérification via build TS + checklist manuelle browser.

**Référence spec :** `docs/superpowers/specs/2026-05-23-referral-codes-design.md`

---

## File Structure

**Files to create :**
- `src/data/referral-codes.ts` — type `ReferralCode`, tableau `REFERRAL_CODES`, helper `findReferralCode(input)`.
- `src/components/admin/ReferralPanel.tsx` — panel "Recommandation" affiché dans la fiche détail admin avec bouton "Marquer payé" et modal date+méthode.

**Files to modify :**
- `src/components/InscriptionLayout.tsx` — ajout champ `codeRecommandation` à `FormData`, rendu input en Step Identité (step=1), feedback live via `useMemo`, payload `code_recommandation`.
- `src/app/api/inscription/route.ts` — lecture/validation du code, insertion des 7 colonnes referral, Slack notif enrichie.
- `src/app/api/admin/candidature/[id]/route.ts` — accepte `referral_payout_status` / `referral_payout_paid_at` / `referral_payout_method` dans le body, trigger auto `pending → due` quand status → `soldee`, trigger `→ cancelled` quand status → `annulee`/`refusee`.
- `src/components/admin/InscriptionsList.tsx` — badges par candidature (code valide / invalide / bonus dû), nouveau filtre dropdown "Code partenaire".
- `src/app/admin/inscriptions/[id]/page.tsx` — import et affichage de `<ReferralPanel />`.
- `src/app/globals.css` — classes `.cand-input--success`, `.cand-input--warning`, `.cand-referral-feedback`, `.admin-referral-panel`, `.admin-referral-modal`.

**Migration Supabase (via MCP) :**
- `add_referral_code_columns_to_candidatures` (DDL inline dans Task 1).

---

## Task 1 : Migration Supabase

**Files:**
- Apply via MCP : `mcp__supabase__apply_migration` sur projet `bgwvrzgnoqlqqrvflwav`.

- [ ] **Step 1 : Lister les tables existantes pour confirmer le schema actuel**

Call `mcp__supabase__list_tables` avec `project_id: "bgwvrzgnoqlqqrvflwav"`, `schemas: ["public"]`.

Expected : la table `candidatures` apparaît avec ses colonnes actuelles incluant `status`, `package_paid_at`, `payment_method`, `payment_date`. Vérifier qu'aucune colonne `referral_*` n'existe déjà.

- [ ] **Step 2 : Appliquer la migration**

Call `mcp__supabase__apply_migration` avec :
- `project_id: "bgwvrzgnoqlqqrvflwav"`
- `name: "add_referral_code_columns_to_candidatures"`
- `query:` (SQL ci-dessous)

```sql
ALTER TABLE candidatures
  ADD COLUMN referral_code text,
  ADD COLUMN referral_code_valid boolean,
  ADD COLUMN referral_partner_name text,
  ADD COLUMN referral_partner_type text
    CHECK (referral_partner_type IN ('gym','influencer','coach','other') OR referral_partner_type IS NULL),
  ADD COLUMN referral_bonus_eur integer,
  ADD COLUMN referral_payout_status text
    CHECK (referral_payout_status IN ('not_applicable','pending','due','paid','cancelled') OR referral_payout_status IS NULL),
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
COMMENT ON COLUMN candidatures.referral_payout_status IS
  'not_applicable = pas de code ou invalide. pending = candidature en cours. due = soldée, bonus à payer. paid = bonus payé. cancelled = candidature annulée, bonus annulé.';
```

Expected : `{"success": true}` ou équivalent. Pas d'erreur sur les CHECK constraints.

- [ ] **Step 3 : Vérifier que les colonnes ont bien été ajoutées**

Call `mcp__supabase__execute_sql` avec :
- `project_id: "bgwvrzgnoqlqqrvflwav"`
- `query: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'candidatures' AND column_name LIKE 'referral_%' ORDER BY ordinal_position;"`

Expected : 8 lignes retournées (referral_code, referral_code_valid, referral_partner_name, referral_partner_type, referral_bonus_eur, referral_payout_status, referral_payout_paid_at, referral_payout_method).

- [ ] **Step 4 : Vérifier que les index ont été créés**

Call `mcp__supabase__execute_sql` avec :
- `project_id: "bgwvrzgnoqlqqrvflwav"`
- `query: "SELECT indexname FROM pg_indexes WHERE tablename = 'candidatures' AND indexname LIKE '%referral%';"`

Expected : 2 lignes (`idx_candidatures_referral_payout`, `idx_candidatures_referral_code`).

- [ ] **Step 5 : Confirmer à l'utilisateur que la migration est appliquée**

Pas de commit Git (migration appliquée directement en DB, pas de fichier local). Notifier l'utilisateur "Migration Supabase appliquée. 8 colonnes + 2 index créés."

---

## Task 2 : Data file `src/data/referral-codes.ts`

**Files:**
- Create : `src/data/referral-codes.ts`

- [ ] **Step 1 : Créer le fichier avec le type, les 3 codes initiaux et le helper**

```ts
// src/data/referral-codes.ts
//
// Codes de recommandation MKR — partenariats salles / influenceurs / coachs.
// Ajout d'un partenaire : éditer ce fichier + commit + push + Vercel redeploy.
// Pour désactiver sans perdre l'historique : passer active à false.

export type ReferralPartnerType = 'gym' | 'influencer' | 'coach' | 'other'

export type ReferralCode = {
  /** Code en uppercase. Matché après trim().toUpperCase() côté API et form. */
  code: string
  /** Nom complet du partenaire affiché en admin (snapshot stocké à l'inscription). */
  partnerName: string
  /** Contact interne (email, URL Insta, tel). Jamais affiché côté public. */
  partnerContact?: string
  type: ReferralPartnerType
  /** Bonus en euros versé au partenaire quand la candidature passe en status `soldee`. */
  bonusEur: number
  /** Si false, le code n'est plus accepté en nouvelle inscription mais reste traçable pour l'historique. */
  active: boolean
  /** Notes internes (contexte partenariat, date de signature, etc.). */
  notes?: string
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

/**
 * Cherche un code actif dans REFERRAL_CODES.
 * Normalise l'input via trim().toUpperCase() avant comparaison.
 * Retourne null si vide ou non reconnu.
 */
export function findReferralCode(input: string): ReferralCode | null {
  const normalized = input.trim().toUpperCase()
  if (!normalized) return null
  return REFERRAL_CODES.find((c) => c.code === normalized && c.active) ?? null
}

/**
 * Liste des codes actifs (utilisée pour le filtre dropdown admin).
 */
export function getActiveCodes(): ReferralCode[] {
  return REFERRAL_CODES.filter((c) => c.active)
}
```

- [ ] **Step 2 : Vérifier que le fichier compile (typecheck)**

Run depuis la racine du projet :
```bash
npx tsc --noEmit
```

Expected : pas d'erreur TS sur `src/data/referral-codes.ts`. Si erreur ailleurs (non liée à ce fichier), c'est un état pré-existant à ignorer pour cette task.

- [ ] **Step 3 : Smoke test manuel via REPL Node**

Run :
```bash
npx tsx -e "import { findReferralCode } from './src/data/referral-codes'; console.log(JSON.stringify({ uppercase: findReferralCode('STRIKE')?.code, lowercase: findReferralCode('strike')?.code, padded: findReferralCode('  Strike  ')?.code, invalid: findReferralCode('XYZ999'), empty: findReferralCode(''), zeze: findReferralCode('zeze74')?.partnerName, rakhim: findReferralCode('RAKHIM86')?.partnerName }, null, 2))"
```

Expected output :
```json
{
  "uppercase": "STRIKE",
  "lowercase": "STRIKE",
  "padded": "STRIKE",
  "invalid": null,
  "empty": null,
  "zeze": "Zelimkhan (@zelimkhan_74)",
  "rakhim": "Rakhim (@rakhim.mgd)"
}
```

Si `tsx` n'est pas installé : `npx -p tsx tsx -e "..."` ou alternative `node --experimental-strip-types -e "..."` (Node 22+).

- [ ] **Step 4 : Commit**

```bash
git add src/data/referral-codes.ts
git commit -m "feat(referral): add referral-codes data file with STRIKE, ZEZE74, RAKHIM86"
```

---

## Task 3 : Backend `/api/inscription` — lecture/insertion du code

**Files:**
- Modify : `src/app/api/inscription/route.ts` (ajouter import, parsing, fields à l'insert, ligne Slack)

- [ ] **Step 1 : Ajouter l'import du helper en haut du fichier**

Editer `src/app/api/inscription/route.ts`, ajouter après la ligne `import { rateLimit, clientIp as rlClientIp } from '@/lib/rate-limit'` :

```ts
import { findReferralCode, type ReferralPartnerType } from '@/data/referral-codes'
```

- [ ] **Step 2 : Étendre le type `InscriptionPayload` pour accepter `code_recommandation`**

Dans le type `InscriptionPayload`, ajouter :

```ts
type InscriptionPayload = {
  tunnel_type?: string
  candidate?: CandidatePayload
  session_id?: string | null
  duree_semaines?: number | null
  date_debut_souhaitee?: string | null
  camp_discipline?: string | null
  code_recommandation?: string | null  // <-- NOUVEAU
  form_data?: Record<string, unknown>
  _hp?: string
}
```

- [ ] **Step 3 : Ajouter la constante de longueur max après les autres MAX_***

Sous `const MAX_CITY = 80` :

```ts
const MAX_REFERRAL_CODE = 40
```

- [ ] **Step 4 : Lire et valider le code juste avant la construction de `candidatureRow`**

Insérer ce bloc entre le check de capacité (fin de l'`if (tunnel === 'session' && body.session_id ...)`) et la définition de `candidatureRow` :

```ts
  // 4 bis. Code de recommandation : optionnel, non bloquant.
  // Si saisi mais non reconnu, on stocke quand même pour traçabilité admin
  // (peut être une faute de frappe ; Ruslan voit le code brut + le flag is_valid=false).
  const rawReferral = (body.code_recommandation ?? '').trim()
  if (rawReferral.length > MAX_REFERRAL_CODE) {
    return badRequest('code_recommandation trop long')
  }
  const matchedReferral = rawReferral ? findReferralCode(rawReferral) : null
  const referralFields: {
    referral_code: string | null
    referral_code_valid: boolean | null
    referral_partner_name: string | null
    referral_partner_type: ReferralPartnerType | null
    referral_bonus_eur: number | null
    referral_payout_status: 'not_applicable' | 'pending'
  } = rawReferral
    ? {
        referral_code: rawReferral.toUpperCase(),
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
```

- [ ] **Step 5 : Spread les referralFields dans `candidatureRow`**

Modifier `candidatureRow` pour inclure le spread (le reste de l'objet reste tel quel) :

```ts
  const candidatureRow = {
    candidate_id: upsertedCandidate.id,
    tunnel_type: tunnel,
    session_id: body.session_id || null,
    duree_semaines: body.duree_semaines ?? null,
    date_debut_souhaitee: body.date_debut_souhaitee || null,
    camp_discipline: campDiscipline,
    ...referralFields,
    form_data: {
      ...formData,
      _meta: { ip: ip ?? null, ua: request.headers.get('user-agent') ?? null },
    },
    status: 'recue',
    status_changed_by_email: 'system',
  }
```

- [ ] **Step 6 : Étendre `notifyPayload` et `SlackPayload` interface**

Dans la construction du `notifyPayload` (après l'insert candidature, vers la ligne `const notifyPayload = {`), ajouter 2 champs :

```ts
  const notifyPayload = {
    tunnel,
    prenom,
    nom,
    email,
    pays: candidate.pays?.trim() || null,
    telephone: candidate.telephone?.trim() || null,
    duree_semaines: body.duree_semaines ?? null,
    camp_discipline: campDiscipline,
    candidature_id: candidature.id,
    // NOUVEAU :
    referral_code: referralFields.referral_code,
    referral_partner_name: referralFields.referral_partner_name,
    referral_bonus_eur: referralFields.referral_bonus_eur,
    referral_code_valid: referralFields.referral_code_valid,
  }
```

Étendre l'interface `SlackPayload` (vers la ligne 276) :

```ts
interface SlackPayload {
  tunnel: string
  prenom: string
  nom: string
  email: string
  pays: string | null
  telephone: string | null
  duree_semaines: number | null
  camp_discipline: CampDiscipline | null
  candidature_id: string
  // NOUVEAU :
  referral_code: string | null
  referral_partner_name: string | null
  referral_bonus_eur: number | null
  referral_code_valid: boolean | null
}
```

- [ ] **Step 7 : Enrichir `notifySlack` avec une ligne referral**

Dans `notifySlack`, modifier le tableau `text` pour ajouter une ligne conditionnelle après la ligne `camp_discipline` :

```ts
  const referralLine =
    p.referral_code_valid === true
      ? `*Recommandé par* : ${p.referral_partner_name} (code ${p.referral_code} — bonus ${p.referral_bonus_eur} EUR pending)`
      : p.referral_code_valid === false
        ? `*Code recommandation non reconnu* : "${p.referral_code}" (à vérifier)`
        : null

  const text = [
    `*Nouvelle candidature MKR* (${TUNNEL_LABELS[p.tunnel] ?? p.tunnel})`,
    `*${p.prenom} ${p.nom}* — ${p.email}${p.pays ? ` — ${p.pays}` : ''}${p.duree_semaines ? ` — ${p.duree_semaines} sem.` : ''}`,
    p.camp_discipline ? `*Camp* : ${DISCIPLINE_LABELS[p.camp_discipline]}` : null,
    referralLine,
    `<${adminBase}/admin/inscriptions/${p.candidature_id}|Voir le dossier>`,
  ].filter(Boolean).join('\n')
```

- [ ] **Step 8 : Enrichir `notifyEmail` avec une ligne referral**

Dans `notifyEmail`, ajouter une ligne `${row(...)}` après `${row('Camp', discipline)}` :

```ts
  const referralLabel = p.referral_code_valid === true
    ? `${p.referral_partner_name} (code ${escapeHtml(p.referral_code ?? '')}, bonus ${p.referral_bonus_eur} EUR pending)`
    : p.referral_code_valid === false
      ? `Code "${escapeHtml(p.referral_code ?? '')}" non reconnu — à vérifier`
      : null

  const bodyHtml = `
    <table style="width:100%;border-collapse:collapse;background:#0b1220;border:1px solid #1e293b;border-radius:6px">
      ${row('Tunnel', tunnelLabel)}
      ${row('Camp', discipline)}
      ${row('Recommandation', referralLabel)}
      ${row('Nom', `${p.prenom} ${p.nom}`)}
      ${row('Email', p.email)}
      ${row('Telephone', p.telephone)}
      ${row('Pays', p.pays)}
      ${row('Duree (semaines)', p.duree_semaines ? String(p.duree_semaines) : null)}
    </table>
    ... (reste inchangé)
  `
```

Note : `row()` doit déjà skip les lignes null/undefined. Si ce n'est pas le cas, conserver la ligne dans le tableau de toutes façons — le rendu d'une cellule vide est acceptable. Vérifier en lisant `src/lib/email.ts` au besoin.

- [ ] **Step 9 : Ajouter un audit_log à l'insert si referral valide**

Juste après `await supabase.from('audit_log').insert({ candidature_id: candidature.id, event: 'created', ... })`, ajouter un 2e insert conditionnel :

```ts
  if (referralFields.referral_code_valid === true) {
    await supabase.from('audit_log').insert({
      candidature_id: candidature.id,
      event: 'referral_attached',
      to_value: {
        code: referralFields.referral_code,
        partner: referralFields.referral_partner_name,
        bonus_eur: referralFields.referral_bonus_eur,
      },
      actor_email: 'system',
    })
  }
```

- [ ] **Step 10 : Vérifier typecheck OK**

Run :
```bash
npx tsc --noEmit
```

Expected : aucune erreur sur `src/app/api/inscription/route.ts`.

- [ ] **Step 11 : Test manuel via curl avec code valide**

Démarrer le dev server (`npm run dev`), puis :
```bash
curl -X POST http://localhost:3000/api/inscription \
  -H 'Content-Type: application/json' \
  -d '{
    "tunnel_type": "session",
    "camp_discipline": "lutte",
    "session_id": "aout-2026",
    "duree_semaines": 1,
    "code_recommandation": "strike",
    "candidate": {
      "prenom": "TestRef",
      "nom": "Strike",
      "email": "test-ref-strike-'"$(date +%s)"'@example.com",
      "pays": "France"
    },
    "form_data": {}
  }'
```

Expected : `{"ok":true,"candidatureId":"<uuid>","createdAt":"..."}`.

Puis vérifier la row via MCP :
```
mcp__supabase__execute_sql avec query "SELECT referral_code, referral_code_valid, referral_partner_name, referral_payout_status FROM candidatures ORDER BY created_at DESC LIMIT 1;"
```

Expected : `referral_code = 'STRIKE'`, `referral_code_valid = true`, `referral_partner_name = 'Strike Academy (Progress Gym SA)'`, `referral_payout_status = 'pending'`.

- [ ] **Step 12 : Test manuel avec code invalide**

```bash
curl -X POST http://localhost:3000/api/inscription \
  -H 'Content-Type: application/json' \
  -d '{
    "tunnel_type": "session",
    "camp_discipline": "lutte",
    "session_id": "aout-2026",
    "duree_semaines": 1,
    "code_recommandation": "STRKE-faute",
    "candidate": {
      "prenom": "TestRef2",
      "nom": "Invalide",
      "email": "test-ref-invalide-'"$(date +%s)"'@example.com",
      "pays": "France"
    },
    "form_data": {}
  }'
```

Expected : `{"ok":true,...}`. La row doit avoir `referral_code = 'STRKE-FAUTE'`, `referral_code_valid = false`, `referral_partner_name = null`, `referral_payout_status = 'not_applicable'`.

- [ ] **Step 13 : Test manuel sans code**

```bash
curl -X POST http://localhost:3000/api/inscription \
  -H 'Content-Type: application/json' \
  -d '{
    "tunnel_type": "session",
    "camp_discipline": "lutte",
    "session_id": "aout-2026",
    "duree_semaines": 1,
    "candidate": {
      "prenom": "TestRef3",
      "nom": "Sans Code",
      "email": "test-ref-sans-'"$(date +%s)"'@example.com",
      "pays": "France"
    },
    "form_data": {}
  }'
```

Expected : ok, row avec `referral_code = NULL`, `referral_payout_status = 'not_applicable'`.

- [ ] **Step 14 : Cleanup des 3 candidatures de test**

```
mcp__supabase__execute_sql avec query "DELETE FROM candidatures WHERE referral_code IN ('STRIKE','STRKE-FAUTE') AND prenom_via_candidate_id_to_check... -- simpler: DELETE FROM candidatures WHERE id IN (<les 3 IDs récupérés à l'étape 11/12/13>);"
```

Alternative : retrouver via `SELECT c.id FROM candidatures c JOIN candidates ca ON c.candidate_id = ca.id WHERE ca.email LIKE 'test-ref-%@example.com';` puis DELETE par ids.

- [ ] **Step 15 : Commit**

```bash
git add src/app/api/inscription/route.ts
git commit -m "feat(referral): wire code_recommandation into /api/inscription with validation and Slack notif"
```

---

## Task 4 : Form `InscriptionLayout.tsx` — champ + UX

**Files:**
- Modify : `src/components/InscriptionLayout.tsx`

- [ ] **Step 1 : Ajouter l'import du helper en tête de fichier**

Après la ligne `import { SESSIONS } from '@/data/sessions'` :

```ts
import { findReferralCode } from '@/data/referral-codes'
```

- [ ] **Step 2 : Ajouter le champ `codeRecommandation` au type `FormData`**

Dans le type `FormData`, ajouter avant la fermeture `}` :

```ts
type FormData = {
  // ... champs existants ...
  // Code de recommandation partenaire (optionnel, non bloquant).
  codeRecommandation: string
}
```

- [ ] **Step 3 : Ajouter la valeur initiale dans `INITIAL`**

Dans l'objet `INITIAL`, ajouter avant la fermeture `}` :

```ts
const INITIAL: FormData = {
  // ... champs existants ...
  codeRecommandation: '',
}
```

- [ ] **Step 4 : Localiser la fonction principale du composant pour ajouter useMemo**

Dans le corps de la fonction `InscriptionLayout` (vers la ligne où sont déclarés `useState` et autres hooks), localiser la fin des `useState` et `useEffect`. Ajouter l'import `useMemo` en haut du fichier dans le import React existant :

```ts
import { useState, useRef, useEffect, useMemo, FormEvent } from 'react'
```

Puis ajouter ce hook après les autres useState/useMemo du composant :

```ts
  // Feedback live pour le champ code de recommandation.
  // 3 états : neutral (vide), success (code reconnu), warning (code saisi non reconnu).
  // Le champ est non bloquant : un code invalide laisse passer le submit.
  const referralFeedback = useMemo(() => {
    const raw = form.codeRecommandation.trim()
    if (!raw) return { tone: 'neutral' as const, message: null as string | null }
    const match = findReferralCode(raw)
    if (match) {
      return { tone: 'success' as const, message: `Recommandé par ${match.partnerName}` }
    }
    return { tone: 'warning' as const, message: 'Code non reconnu, on va vérifier de notre côté' }
  }, [form.codeRecommandation])
```

- [ ] **Step 5 : Localiser le bloc Step Identité (step === 1) dans le JSX**

Le step Identité est rendu autour de `step === 1` (Step 0 = "Le camp"). Chercher la zone contenant `<Field label="Email"` et `<Field label="Téléphone"`. Le champ téléphone est suivi d'un `</div>` de fermeture du `cand-row`.

Ajouter un NOUVEAU `<Field>` juste APRÈS la fermeture du `cand-row` qui contient email + téléphone (et donc en dehors du row, en pleine largeur).

```tsx
            <Field
              label="Code de recommandation"
              hint="Si un coach, un club partenaire ou un influenceur t'a recommandé MKR, note son code ici."
            >
              <input
                className={`cand-input ${referralFeedback.tone !== 'neutral' ? `cand-input--${referralFeedback.tone}` : ''}`}
                type="text"
                autoComplete="off"
                placeholder="Ex : STRIKE (optionnel)"
                value={form.codeRecommandation}
                onChange={(e) => set('codeRecommandation', e.target.value)}
                aria-describedby={referralFeedback.message ? 'referral-feedback' : undefined}
                maxLength={40}
              />
              {referralFeedback.message && (
                <span
                  id="referral-feedback"
                  className={`cand-referral-feedback cand-referral-feedback--${referralFeedback.tone}`}
                >
                  {referralFeedback.tone === 'success' ? '✓ ' : 'ℹ '}
                  {referralFeedback.message}
                </span>
              )}
            </Field>
```

- [ ] **Step 6 : Ajouter `code_recommandation` au payload envoyé à l'API**

Localiser la fonction de soumission (`handleSubmit` ou similaire — la fonction async qui fait `fetch('/api/inscription', ...)`). Dans l'objet payload construit pour le POST, ajouter :

```ts
const payload = {
  tunnel_type: audience,
  candidate: { /* ... */ },
  session_id: /* ... */,
  duree_semaines: /* ... */,
  date_debut_souhaitee: /* ... */,
  camp_discipline: /* ... */,
  code_recommandation: form.codeRecommandation.trim() || null,  // <-- NOUVEAU
  form_data: { /* ... */ },
}
```

- [ ] **Step 7 : Vérifier que le champ n'est pas dans la validation bloquante**

Ouvrir la fonction `validate()` du composant. Confirmer qu'aucune validation step ne référence `codeRecommandation` — c'est volontaire, le champ est toujours optionnel et non bloquant.

Si par défaut on a une validation `if (!form.X.trim()) errors.push(...)` qui pourrait être copiée par erreur, ne rien ajouter.

- [ ] **Step 8 : Vérifier typecheck**

```bash
npx tsc --noEmit
```

Expected : aucune nouvelle erreur.

- [ ] **Step 9 : Commit**

```bash
git add src/components/InscriptionLayout.tsx
git commit -m "feat(referral): add code de recommandation field to inscription form Step Identité"
```

---

## Task 5 : CSS feedback states dans `globals.css`

**Files:**
- Modify : `src/app/globals.css`

- [ ] **Step 1 : Repérer la section CSS du form d'inscription**

Localiser dans `globals.css` les classes `.cand-input`, `.cand-field`, `.cand-hint` existantes (probablement vers les lignes 7400-7700 d'après le SITEMAP). Ces classes définissent le style du form.

- [ ] **Step 2 : Ajouter les nouvelles classes juste après les styles `.cand-input` existants**

Ajouter ce bloc CSS dans la section appropriée :

```css
/* ─── Référentiel code de recommandation (champ Step Identité) ─── */

.cand-input--success {
  border-color: #16a34a;
  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.15);
}

.cand-input--warning {
  border-color: #d97706;
  box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.15);
}

.cand-referral-feedback {
  display: block;
  margin-top: 6px;
  font-size: 0.85rem;
  font-weight: 500;
}

.cand-referral-feedback--success {
  color: #15803d;
}

.cand-referral-feedback--warning {
  color: #c2410c;
}

@media (prefers-color-scheme: dark) {
  .cand-referral-feedback--success {
    color: #4ade80;
  }
  .cand-referral-feedback--warning {
    color: #fb923c;
  }
}
```

- [ ] **Step 3 : Lancer le dev server et tester visuellement**

```bash
npm run dev
```

Naviguer sur `http://localhost:3000/inscription?type=session`, choisir une session + discipline + durée, passer en Step Identité, remplir prénom/nom/email/téléphone, puis tester le champ Code de recommandation :
- Vide → bordure normale, pas de feedback.
- Taper `strike` → bordure verte + texte "✓ Recommandé par Strike Academy (Progress Gym SA)".
- Taper `xyz` → bordure orange + texte "ℹ Code non reconnu, on va vérifier de notre côté".
- Taper `ZEZE74` → vert + "Recommandé par Zelimkhan (@zelimkhan_74)".
- Effacer → retour neutre.

Expected : feedback live instantané, jamais bloquant, bouton "Étape suivante" toujours actif.

- [ ] **Step 4 : Tester le bouton suivant avec code invalide**

Toujours en Step Identité, taper un code invalide `BLAH`, remplir les autres champs requis, cliquer "Étape suivante". Expected : passage à Step Expérience sans erreur.

- [ ] **Step 5 : Commit**

```bash
git add src/app/globals.css
git commit -m "feat(referral): add CSS feedback states for code de recommandation field"
```

---

## Task 6 : Admin PATCH route — trigger auto + payout fields

**Files:**
- Modify : `src/app/api/admin/candidature/[id]/route.ts`

- [ ] **Step 1 : Étendre les constantes en tête du fichier**

Après `const PAYMENT_METHODS = ['virement', 'cash', 'autre'] as const`, ajouter :

```ts
const REFERRAL_PAYOUT_STATUSES = ['not_applicable', 'pending', 'due', 'paid', 'cancelled'] as const
type ReferralPayoutStatus = (typeof REFERRAL_PAYOUT_STATUSES)[number]

const REFERRAL_PAYOUT_METHODS = ['virement', 'cash', 'autre'] as const
type ReferralPayoutMethod = (typeof REFERRAL_PAYOUT_METHODS)[number]
```

- [ ] **Step 2 : Étendre l'interface `PatchBody`**

```ts
interface PatchBody {
  status?: string
  package_paid?: boolean
  package_amount_cents?: number
  payment_method?: PaymentMethod | null
  payment_date?: string | null
  notes_admin?: string
  notes_visio?: string
  // NOUVEAU :
  referral_payout_status?: ReferralPayoutStatus | null
  referral_payout_paid_at?: string | null  // ISO date YYYY-MM-DD
  referral_payout_method?: ReferralPayoutMethod | null
}
```

- [ ] **Step 3 : Étendre le SELECT initial pour lire les champs referral courants**

Modifier la query de lecture (ligne ~75) pour inclure les nouvelles colonnes :

```ts
  const { data: current, error: readError } = await supabase
    .from('candidatures')
    .select('id, status, package_paid_at, package_amount_cents, payment_method, payment_date, notes_admin, notes_visio, referral_code, referral_code_valid, referral_partner_name, referral_bonus_eur, referral_payout_status')
    .eq('id', id)
    .maybeSingle()
```

- [ ] **Step 4 : Ajouter le trigger automatique après la section "2. Transition de status"**

Juste après le bloc `if (typeof body.status === 'string') { ... }` qui gère la transition de status, ajouter ce bloc :

```ts
  // 2 bis. Trigger automatique du bonus referral selon la transition de status.
  // - status → soldee + referral_code_valid=true + payout_status=pending → payout devient `due`.
  // - status → annulee/refusee + payout_status in (pending, due) → payout devient `cancelled`.
  // Si payout déjà `paid`, on ne touche pas (décision business manuelle au cas par cas).
  if (updates.status) {
    const newStatus = updates.status as Status
    const currentPayout = current.referral_payout_status as ReferralPayoutStatus | null

    if (
      newStatus === 'soldee'
      && current.referral_code_valid === true
      && currentPayout === 'pending'
    ) {
      updates.referral_payout_status = 'due'
      auditEntries.push({
        candidature_id: id,
        event: 'referral_due',
        from_value: { referral_payout_status: 'pending' },
        to_value: { referral_payout_status: 'due' },
        data: {
          partner: current.referral_partner_name,
          bonus_eur: current.referral_bonus_eur,
        },
        actor_email: actor,
      })
    }

    if (
      (newStatus === 'annulee' || newStatus === 'refusee')
      && (currentPayout === 'pending' || currentPayout === 'due')
    ) {
      updates.referral_payout_status = 'cancelled'
      auditEntries.push({
        candidature_id: id,
        event: 'referral_cancelled',
        from_value: { referral_payout_status: currentPayout },
        to_value: { referral_payout_status: 'cancelled' },
        data: { reason: `candidature_${newStatus}` },
        actor_email: actor,
      })
    }
  }
```

- [ ] **Step 5 : Ajouter le handler manuel "Marquer payé / dépayé" après la section "6. Date de paiement"**

Insérer ce bloc juste après le bloc `if ('payment_date' in body) { ... }` :

```ts
  // 7 bis. Mutation manuelle du payout referral (depuis l'UI admin).
  // Cas typique : Ruslan clique "Marquer payé" → on reçoit { referral_payout_status: 'paid', referral_payout_paid_at: '2026-06-15', referral_payout_method: 'virement' }.
  // Cas "Annuler le paiement" → { referral_payout_status: 'due', referral_payout_paid_at: null, referral_payout_method: null }.
  if ('referral_payout_status' in body) {
    const next = body.referral_payout_status
    if (next !== null && next !== undefined && !REFERRAL_PAYOUT_STATUSES.includes(next)) {
      return badRequest(`referral_payout_status inconnu: ${next}`)
    }
    // On garde une whitelist des transitions manuelles autorisées (les autres passent par le trigger auto).
    const allowedManual: Record<string, string[]> = {
      due: ['paid', 'cancelled'],
      paid: ['due'],          // revert "annuler le paiement"
      pending: ['cancelled'], // annulation explicite si la candidature reste active mais qu'on retire le partenariat
    }
    const fromState = current.referral_payout_status as string | null
    if (fromState && next && next !== fromState) {
      const allowed = allowedManual[fromState] ?? []
      if (!allowed.includes(next)) {
        return badRequest(`Transition payout interdite: ${fromState} -> ${next}`)
      }
      updates.referral_payout_status = next
      auditEntries.push({
        candidature_id: id,
        event: 'referral_payout_status_change',
        from_value: { referral_payout_status: fromState },
        to_value: { referral_payout_status: next },
        actor_email: actor,
      })
    }
  }

  if ('referral_payout_paid_at' in body) {
    const next = body.referral_payout_paid_at
    if (next !== null && next !== undefined && !DATE_RE.test(next)) {
      return badRequest('referral_payout_paid_at invalide (format attendu YYYY-MM-DD)')
    }
    // Stocker en timestamptz : "2026-06-15" devient "2026-06-15T00:00:00.000Z".
    const target = next ? new Date(next + 'T00:00:00.000Z').toISOString() : null
    updates.referral_payout_paid_at = target
    auditEntries.push({
      candidature_id: id,
      event: 'referral_payout_paid_at_change',
      to_value: { referral_payout_paid_at: target },
      actor_email: actor,
    })
  }

  if ('referral_payout_method' in body) {
    const next = body.referral_payout_method
    if (next !== null && next !== undefined && !REFERRAL_PAYOUT_METHODS.includes(next)) {
      return badRequest(`referral_payout_method inconnue: ${next}`)
    }
    updates.referral_payout_method = next ?? null
    auditEntries.push({
      candidature_id: id,
      event: 'referral_payout_method_change',
      to_value: { referral_payout_method: next ?? null },
      actor_email: actor,
    })
  }
```

- [ ] **Step 6 : Étendre le SELECT du retour final pour inclure les champs referral**

Modifier la query de l'update (ligne ~217) :

```ts
  const { data: updated, error: updateError } = await supabase
    .from('candidatures')
    .update(updates)
    .eq('id', id)
    .select('id, status, status_changed_at, package_paid_at, package_amount_cents, payment_method, payment_date, notes_admin, notes_visio, referral_code, referral_code_valid, referral_partner_name, referral_partner_type, referral_bonus_eur, referral_payout_status, referral_payout_paid_at, referral_payout_method')
    .single()
```

- [ ] **Step 7 : Typecheck**

```bash
npx tsc --noEmit
```

Expected : pas d'erreur.

- [ ] **Step 8 : Test manuel du trigger auto pending → due**

Créer une candidature avec code valide via curl :
```bash
CANDIDATURE_ID=$(curl -s -X POST http://localhost:3000/api/inscription \
  -H 'Content-Type: application/json' \
  -d '{
    "tunnel_type": "session",
    "camp_discipline": "lutte",
    "session_id": "aout-2026",
    "duree_semaines": 1,
    "code_recommandation": "STRIKE",
    "candidate": {
      "prenom": "TestTrigger",
      "nom": "Auto",
      "email": "test-trigger-'"$(date +%s)"'@example.com",
      "pays": "France"
    },
    "form_data": {}
  }' | jq -r '.candidatureId')

echo "Created: $CANDIDATURE_ID"
```

Via MCP Supabase, lire le row pour confirmer `referral_payout_status = 'pending'`.

Puis passer à validee :
```
mcp__supabase__execute_sql avec query "UPDATE candidatures SET status='validee', status_changed_at=now() WHERE id='<CANDIDATURE_ID>'; SELECT status, referral_payout_status FROM candidatures WHERE id='<CANDIDATURE_ID>';"
```

(Note : on passe direct via SQL ici car la PATCH route exige le cookie admin. Pour tester via PATCH, il faudrait simuler le cookie httpOnly `mkr_admin`. Le trigger auto fonctionne sur la base du body.status reçu, donc le SQL direct simule un état mais ne déclenche pas le trigger. Le test trigger se fera en Task 8 via l'UI admin.)

Cleanup : `DELETE FROM candidatures WHERE id='<CANDIDATURE_ID>';`

- [ ] **Step 9 : Commit**

```bash
git add src/app/api/admin/candidature/[id]/route.ts
git commit -m "feat(referral): add auto-trigger pending→due/cancelled + manual payout mutation in admin PATCH"
```

---

## Task 7 : Admin liste — badges + filtre

**Files:**
- Modify : `src/components/admin/InscriptionsList.tsx`

- [ ] **Step 1 : Lire le fichier pour comprendre la structure actuelle**

Lire `src/components/admin/InscriptionsList.tsx` en entier. Localiser :
- Le type/interface de chaque candidature affichée (probablement `Candidature` ou similaire).
- Le rendu d'une row (boucle map).
- Les filtres existants (tunnel, status, session).
- La query Supabase qui alimente le tableau.

- [ ] **Step 2 : Étendre le type de la candidature affichée**

Ajouter aux champs lus :
```ts
type Candidature = {
  // ... champs existants ...
  referral_code: string | null
  referral_code_valid: boolean | null
  referral_partner_name: string | null
  referral_partner_type: string | null
  referral_bonus_eur: number | null
  referral_payout_status: string | null
}
```

- [ ] **Step 3 : Étendre la query Supabase**

Localiser la query `.select('...')` qui peuple la liste. Ajouter les colonnes :
`referral_code, referral_code_valid, referral_partner_name, referral_partner_type, referral_bonus_eur, referral_payout_status`

- [ ] **Step 4 : Créer le composant badge inline (ou helper)**

Au-dessus du composant principal, ajouter une petite fonction de rendu badge :

```tsx
function ReferralBadge({ c }: { c: { referral_code: string | null; referral_code_valid: boolean | null; referral_partner_type: string | null; referral_payout_status: string | null; referral_bonus_eur: number | null } }) {
  if (!c.referral_code) return null

  if (c.referral_code_valid === false) {
    return (
      <span className="admin-badge admin-badge--warning" title="Code recommandation non reconnu">
        ⚠ {c.referral_code}
      </span>
    )
  }

  const typeColor = c.referral_partner_type === 'gym'
    ? 'admin-badge--info'
    : c.referral_partner_type === 'influencer'
      ? 'admin-badge--accent'
      : 'admin-badge--success'

  return (
    <>
      <span className={`admin-badge ${typeColor}`} title="Recommandation valide">
        🤝 {c.referral_code}
      </span>
      {c.referral_payout_status === 'due' && (
        <span className="admin-badge admin-badge--bonus" title={`Bonus ${c.referral_bonus_eur} EUR à payer`}>
          💸 {c.referral_bonus_eur} EUR dû
        </span>
      )}
      {c.referral_payout_status === 'paid' && (
        <span className="admin-badge admin-badge--muted" title={`Bonus ${c.referral_bonus_eur} EUR payé`}>
          ✓ {c.referral_bonus_eur} EUR payé
        </span>
      )}
    </>
  )
}
```

- [ ] **Step 5 : Insérer le badge dans le rendu d'une row**

Localiser où le nom du candidat est affiché dans la row (probablement `{c.prenom} {c.nom}` ou un span équivalent). Ajouter `<ReferralBadge c={c} />` à proximité (typiquement après le nom, dans le même cluster de badges que les badges tunnel/discipline existants).

- [ ] **Step 6 : Ajouter le filtre dropdown "Code partenaire"**

Localiser la zone des filtres en haut de la liste (où sont les selects tunnel/status/session existants). Ajouter un nouveau filtre :

```tsx
const [filterReferral, setFilterReferral] = useState<string>('all')

// ... dans le JSX, à côté des autres filtres :
<select
  value={filterReferral}
  onChange={(e) => setFilterReferral(e.target.value)}
  className="admin-filter-select"
>
  <option value="all">Tous les codes</option>
  <option value="STRIKE">STRIKE</option>
  <option value="ZEZE74">ZEZE74</option>
  <option value="RAKHIM86">RAKHIM86</option>
  <option value="invalid">Code invalide</option>
  <option value="none">Sans code</option>
  <option value="due">Bonus dû</option>
</select>
```

- [ ] **Step 7 : Appliquer le filtre à la liste affichée**

Localiser le `.filter(...)` qui agrège les filtres existants (probablement un `useMemo` ou inline). Ajouter une clause :

```ts
const filtered = candidatures.filter((c) => {
  // ... filtres existants ...
  if (filterReferral === 'invalid' && c.referral_code_valid !== false) return false
  if (filterReferral === 'none' && c.referral_code !== null) return false
  if (filterReferral === 'due' && c.referral_payout_status !== 'due') return false
  if (
    filterReferral !== 'all'
    && filterReferral !== 'invalid'
    && filterReferral !== 'none'
    && filterReferral !== 'due'
    && c.referral_code !== filterReferral
  ) {
    return false
  }
  return true
})
```

- [ ] **Step 8 : Ajouter le CSS des nouveaux badges dans `globals.css`**

Si les classes `admin-badge--info`, `admin-badge--accent`, `admin-badge--success`, `admin-badge--bonus`, `admin-badge--muted`, `admin-badge--warning`, `admin-filter-select` n'existent pas déjà, les ajouter à `globals.css` dans la section admin :

```css
/* ─── Badges referral (liste admin) ─── */
.admin-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 6px;
}
.admin-badge--info     { background: #dbeafe; color: #1e40af; }
.admin-badge--accent   { background: #ede9fe; color: #6d28d9; }
.admin-badge--success  { background: #dcfce7; color: #166534; }
.admin-badge--warning  { background: #fed7aa; color: #9a3412; }
.admin-badge--bonus    { background: #fef3c7; color: #92400e; }
.admin-badge--muted    { background: #e5e7eb; color: #4b5563; }
```

Ne pas réécrire `.admin-filter-select` si une classe équivalente existe déjà (réutiliser).

- [ ] **Step 9 : Tester en dev**

Démarrer le dev server, naviguer sur `/admin/inscriptions` (avec le token admin via cookie, voir `proxy.ts`). Vérifier :
- Les candidatures existantes sans code n'affichent pas de badge.
- Une candidature de test avec code STRIKE affiche le badge bleu `🤝 STRIKE`.
- Une candidature de test avec code invalide affiche le badge orange `⚠ XXX`.
- Le filtre "STRIKE" ne montre que les candidatures avec ce code.
- Le filtre "Sans code" ne montre que celles sans code.

(Créer 2 candidatures de test via curl si besoin pour valider visuellement.)

- [ ] **Step 10 : Commit**

```bash
git add src/components/admin/InscriptionsList.tsx src/app/globals.css
git commit -m "feat(referral): add badges and filter dropdown to admin inscriptions list"
```

---

## Task 8 : Admin détail — ReferralPanel + modal "Marquer payé"

**Files:**
- Create : `src/components/admin/ReferralPanel.tsx`
- Modify : `src/app/admin/inscriptions/[id]/page.tsx`
- Modify : `src/app/globals.css` (styles modal)

- [ ] **Step 1 : Créer `src/components/admin/ReferralPanel.tsx`**

```tsx
'use client'

import { useState } from 'react'

type ReferralPanelProps = {
  candidatureId: string
  referralCode: string | null
  referralCodeValid: boolean | null
  referralPartnerName: string | null
  referralPartnerType: string | null
  referralBonusEur: number | null
  referralPayoutStatus: string | null
  referralPayoutPaidAt: string | null
  referralPayoutMethod: string | null
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  not_applicable: { label: 'N/A', color: 'muted' },
  pending: { label: 'En attente', color: 'info' },
  due: { label: 'À payer', color: 'bonus' },
  paid: { label: 'Payé', color: 'success' },
  cancelled: { label: 'Annulé', color: 'muted' },
}

const METHOD_LABELS: Record<string, string> = {
  virement: 'Virement bancaire',
  cash: 'Espèces',
  autre: 'Autre',
}

export default function ReferralPanel(props: ReferralPanelProps) {
  const [showPayModal, setShowPayModal] = useState(false)
  const [showRevertConfirm, setShowRevertConfirm] = useState(false)
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10))
  const [payMethod, setPayMethod] = useState<'virement' | 'cash' | 'autre'>('virement')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pas de bloc si pas de code saisi
  if (!props.referralCode) return null

  const statusInfo = STATUS_LABELS[props.referralPayoutStatus ?? 'not_applicable'] ?? STATUS_LABELS.not_applicable

  async function markPaid() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/candidature/${props.candidatureId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referral_payout_status: 'paid',
          referral_payout_paid_at: payDate,
          referral_payout_method: payMethod,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      // Reload pour rafraîchir les valeurs depuis le serveur (panel server-rendered).
      window.location.reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
      setSubmitting(false)
    }
  }

  async function revertPaid() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/candidature/${props.candidatureId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referral_payout_status: 'due',
          referral_payout_paid_at: null,
          referral_payout_method: null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      window.location.reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
      setSubmitting(false)
    }
  }

  return (
    <section className="admin-referral-panel">
      <h3>Recommandation</h3>

      <dl className="admin-referral-dl">
        <dt>Code saisi</dt>
        <dd>
          {props.referralCode}{' '}
          {props.referralCodeValid === true && <span aria-label="valide">✓</span>}
          {props.referralCodeValid === false && <span aria-label="non reconnu">⚠ non reconnu</span>}
        </dd>

        {props.referralPartnerName && (
          <>
            <dt>Partenaire</dt>
            <dd>{props.referralPartnerName}</dd>
          </>
        )}

        {props.referralPartnerType && (
          <>
            <dt>Type</dt>
            <dd>{props.referralPartnerType}</dd>
          </>
        )}

        {props.referralBonusEur !== null && (
          <>
            <dt>Bonus</dt>
            <dd>{props.referralBonusEur} EUR</dd>
          </>
        )}

        <dt>Statut paiement</dt>
        <dd>
          <span className={`admin-badge admin-badge--${statusInfo.color}`}>{statusInfo.label}</span>
        </dd>

        {props.referralPayoutStatus === 'paid' && (
          <>
            <dt>Payé le</dt>
            <dd>
              {props.referralPayoutPaidAt
                ? new Date(props.referralPayoutPaidAt).toLocaleDateString('fr-FR')
                : '—'}
              {props.referralPayoutMethod && ` (${METHOD_LABELS[props.referralPayoutMethod] ?? props.referralPayoutMethod})`}
            </dd>
          </>
        )}
      </dl>

      {props.referralPayoutStatus === 'due' && (
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={() => setShowPayModal(true)}
        >
          Marquer payé
        </button>
      )}

      {props.referralPayoutStatus === 'paid' && (
        <button
          type="button"
          className="admin-btn admin-btn--ghost"
          onClick={() => setShowRevertConfirm(true)}
        >
          Annuler le paiement
        </button>
      )}

      {showPayModal && (
        <div className="admin-modal-overlay" onClick={() => !submitting && setShowPayModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h4>Marquer le bonus comme payé</h4>
            <label>
              Date du paiement
              <input
                type="date"
                value={payDate}
                onChange={(e) => setPayDate(e.target.value)}
                disabled={submitting}
              />
            </label>
            <label>
              Méthode
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value as 'virement' | 'cash' | 'autre')}
                disabled={submitting}
              >
                <option value="virement">Virement bancaire</option>
                <option value="cash">Espèces</option>
                <option value="autre">Autre</option>
              </select>
            </label>
            {error && <p className="admin-modal-error">{error}</p>}
            <div className="admin-modal-actions">
              <button type="button" onClick={() => setShowPayModal(false)} disabled={submitting}>
                Annuler
              </button>
              <button type="button" className="admin-btn--primary" onClick={markPaid} disabled={submitting}>
                {submitting ? 'En cours...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRevertConfirm && (
        <div className="admin-modal-overlay" onClick={() => !submitting && setShowRevertConfirm(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h4>Annuler le paiement ?</h4>
            <p>Le bonus repassera en statut "à payer". Date et méthode seront effacées.</p>
            {error && <p className="admin-modal-error">{error}</p>}
            <div className="admin-modal-actions">
              <button type="button" onClick={() => setShowRevertConfirm(false)} disabled={submitting}>
                Non, garder
              </button>
              <button type="button" className="admin-btn--primary" onClick={revertPaid} disabled={submitting}>
                {submitting ? 'En cours...' : 'Oui, annuler'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 2 : Importer et utiliser `<ReferralPanel />` dans `src/app/admin/inscriptions/[id]/page.tsx`**

Ouvrir le fichier `src/app/admin/inscriptions/[id]/page.tsx`. Localiser la query Supabase qui lit la candidature détaillée. Ajouter aux colonnes lues :
`referral_code, referral_code_valid, referral_partner_name, referral_partner_type, referral_bonus_eur, referral_payout_status, referral_payout_paid_at, referral_payout_method`

Ajouter en haut du fichier l'import :
```ts
import ReferralPanel from '@/components/admin/ReferralPanel'
```

Dans le rendu de la page, ajouter `<ReferralPanel ... />` à un endroit naturel (par exemple entre le panel "Paiement" et "Notes admin", ou en bas avant l'audit log). Passer les props depuis la candidature lue :

```tsx
<ReferralPanel
  candidatureId={candidature.id}
  referralCode={candidature.referral_code}
  referralCodeValid={candidature.referral_code_valid}
  referralPartnerName={candidature.referral_partner_name}
  referralPartnerType={candidature.referral_partner_type}
  referralBonusEur={candidature.referral_bonus_eur}
  referralPayoutStatus={candidature.referral_payout_status}
  referralPayoutPaidAt={candidature.referral_payout_paid_at}
  referralPayoutMethod={candidature.referral_payout_method}
/>
```

Le composant gère lui-même l'absence de code (`if (!props.referralCode) return null`), donc on peut toujours le rendre.

- [ ] **Step 3 : Ajouter les styles CSS pour le panel et le modal dans `globals.css`**

```css
/* ─── Admin Referral Panel ─── */
.admin-referral-panel {
  margin-top: 24px;
  padding: 20px;
  background: var(--surface-lowest, #f8fafc);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
.admin-referral-panel h3 {
  margin: 0 0 12px;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.admin-referral-dl {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 8px 16px;
  margin: 0 0 16px;
  font-size: 0.875rem;
}
.admin-referral-dl dt {
  font-weight: 600;
  color: #475569;
}
.admin-referral-dl dd {
  margin: 0;
}

/* Modal réutilisable */
.admin-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}
.admin-modal {
  background: #fff;
  border-radius: 12px;
  padding: 28px;
  max-width: 440px;
  width: 100%;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.25);
}
.admin-modal h4 {
  margin: 0 0 16px;
  font-size: 1.15rem;
}
.admin-modal label {
  display: block;
  margin: 0 0 14px;
  font-weight: 600;
  font-size: 0.875rem;
}
.admin-modal label input,
.admin-modal label select {
  display: block;
  margin-top: 6px;
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95rem;
}
.admin-modal-error {
  color: #b91c1c;
  background: #fee2e2;
  padding: 8px 12px;
  border-radius: 6px;
  margin: 0 0 14px;
  font-size: 0.85rem;
}
.admin-modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 8px;
}
.admin-modal-actions button {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: #fff;
  cursor: pointer;
  font-weight: 600;
}
.admin-modal-actions .admin-btn--primary {
  background: var(--primary, #C0392B);
  color: #fff;
  border-color: transparent;
}
.admin-modal-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.admin-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
}
.admin-btn--primary {
  background: var(--primary, #C0392B);
  color: #fff;
}
.admin-btn--ghost {
  background: transparent;
  color: var(--primary, #C0392B);
  border-color: var(--primary, #C0392B);
}
```

(Si `.admin-btn` et variantes existent déjà dans `globals.css`, ne pas dupliquer — supprimer du bloc ci-dessus les classes redondantes.)

- [ ] **Step 4 : Typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 5 : Test manuel end-to-end**

1. Démarrer le dev server.
2. Créer via curl une candidature avec code STRIKE valide (cf. Task 3 step 11).
3. Accéder à `/admin/inscriptions/<id>` avec le cookie admin → vérifier que le panel "Recommandation" apparaît avec statut "En attente".
4. Via Supabase MCP, passer le status de la candidature à `validee` puis `soldee` :
   ```
   mcp__supabase__execute_sql avec query "UPDATE candidatures SET status='validee' WHERE id='<id>';"
   ```
   Puis utiliser la PATCH route via curl avec cookie admin pour passer à `soldee` (ou directement modifier en SQL : `UPDATE candidatures SET status='soldee', referral_payout_status='due' WHERE id='<id>';`).
5. Recharger la fiche admin → le panel doit afficher statut "À payer" + bouton "Marquer payé".
6. Cliquer "Marquer payé" → modal apparaît, choisir date du jour + virement → Confirmer.
7. Vérifier que le panel passe à "Payé" + affiche la date et "Virement bancaire" + bouton "Annuler le paiement".
8. Cliquer "Annuler le paiement" → modal confirmation → Oui → le panel repasse à "À payer".
9. Cleanup : supprimer la candidature de test.

- [ ] **Step 6 : Commit**

```bash
git add src/components/admin/ReferralPanel.tsx src/app/admin/inscriptions/[id]/page.tsx src/app/globals.css
git commit -m "feat(referral): add ReferralPanel with mark-paid modal in admin candidature detail"
```

---

## Task 9 : Build de prod + checklist de vérification finale

**Files:** aucun — vérifications uniquement.

- [ ] **Step 1 : Build prod complet**

```bash
rm -rf .next && npx next build
```

Expected : build réussit, 35+ routes statiques. Pas de warning TypeScript sur les fichiers modifiés.

- [ ] **Step 2 : Checklist fonctionnelle complète**

Cocher chaque item après vérification manuelle dans le browser :

- [ ] `/inscription?type=session` : champ "Code de recommandation" présent en Step Identité, placeholder visible.
- [ ] Saisie `strike` → badge vert "Recommandé par Strike Academy".
- [ ] Saisie `ZEZE74` → badge vert "Recommandé par Zelimkhan (@zelimkhan_74)".
- [ ] Saisie `XYZ` → badge orange "Code non reconnu".
- [ ] Saisie code invalide + submit → candidature créée, pas d'erreur.
- [ ] `/admin/inscriptions` : badge `🤝 STRIKE` (bleu pour gym) sur les candidatures avec code.
- [ ] `/admin/inscriptions` : badge `🤝 ZEZE74` (violet pour influencer).
- [ ] `/admin/inscriptions` : badge `⚠ XYZ` (orange pour code invalide).
- [ ] Filtre dropdown "STRIKE" → seules les candidatures avec ce code apparaissent.
- [ ] Filtre "Sans code" → seules les candidatures sans code apparaissent.
- [ ] Filtre "Code invalide" → seules les candidatures avec code non reconnu.
- [ ] `/admin/inscriptions/<id>` : panel "Recommandation" affiché si code saisi, masqué sinon.
- [ ] Trigger auto : passer une candidature `recue → validee → soldee` via l'UI admin → `referral_payout_status` passe de `pending` à `due`, badge `💸 50 EUR dû` apparaît dans la liste.
- [ ] Bouton "Marquer payé" → modal → date + virement → Confirmer → status `paid`, panel affiche "Payé le ... par virement".
- [ ] Bouton "Annuler le paiement" depuis `paid` → repasse à `due`.
- [ ] Annulation d'une candidature `validee` (passer à `annulee`) → `referral_payout_status` passe à `cancelled` automatiquement.
- [ ] Audit log entries : créer une candidature avec STRIKE, vérifier dans Supabase que `audit_log` contient `referral_attached` puis `referral_due` puis `referral_payout_status_change`.

- [ ] **Step 3 : Cleanup des candidatures de test**

```
mcp__supabase__execute_sql avec query "SELECT c.id, c.referral_code, ca.email FROM candidatures c JOIN candidates ca ON c.candidate_id = ca.id WHERE ca.email LIKE 'test-%@example.com' OR ca.email LIKE '%@example.com' ORDER BY c.created_at DESC;"
```

Lister les candidatures de test, puis DELETE par ids.

- [ ] **Step 4 : Mettre à jour `SITEMAP.md` avec la nouvelle propagation**

Ajouter une nouvelle section dans `SITEMAP.md` (juste après "Tarifs publics" dans §6bis Propagation Map) :

```markdown
### Codes de recommandation (ajouté 2026-05-23)

**Source unique** : `src/data/referral-codes.ts` (REFERRAL_CODES + findReferralCode helper)

| Fichier | Forme |
|---|---|
| `data/referral-codes.ts` | source of truth — 3 codes V1 : STRIKE, ZEZE74, RAKHIM86 |
| `components/InscriptionLayout.tsx` | champ Step Identité + feedback live + payload code_recommandation |
| `app/api/inscription/route.ts` | parsing/validation + 7 colonnes Supabase + Slack ligne referral |
| `app/api/admin/candidature/[id]/route.ts` | trigger auto pending→due/cancelled + mutation manuelle payout |
| `components/admin/InscriptionsList.tsx` | badges 🤝/⚠/💸 + filtre dropdown Code partenaire |
| `components/admin/ReferralPanel.tsx` | panel détail + modal Marquer payé |
| `app/admin/inscriptions/[id]/page.tsx` | import ReferralPanel + SELECT colonnes referral |
| `app/globals.css` | classes .cand-input--success/warning, .cand-referral-feedback, .admin-referral-*, .admin-modal-* |
| Supabase `candidatures` (8 colonnes) | referral_code, referral_code_valid, referral_partner_name, referral_partner_type, referral_bonus_eur, referral_payout_status, referral_payout_paid_at, referral_payout_method |

**Ajouter un partenaire** : éditer `data/referral-codes.ts` + commit + push + Vercel redeploy.
**Désactiver un code** : passer `active: false` (l'historique reste traçable, les nouvelles inscriptions deviendront "invalides").
**Bonus 50 EUR par défaut**, modifiable par partenaire via `bonusEur`.
```

- [ ] **Step 5 : Commit final + push**

```bash
git add docs/superpowers/specs/2026-05-23-referral-codes-design.md docs/superpowers/plans/2026-05-23-referral-codes.md SITEMAP.md
git commit -m "docs(referral): add spec, plan, and SITEMAP propagation entry for referral codes"
git push origin main
```

---

## Notes

- **Pas de tests automatisés** : le projet n'a pas de framework de test installé (Vitest/Jest). La vérification se fait via le typecheck (`npx tsc --noEmit`), le build prod (`npx next build`), et la checklist manuelle Task 9.
- **Trigger auto** : le passage `pending → due` se fait dans la PATCH route admin uniquement quand un admin pousse explicitement un changement de status à `soldee` via l'UI. Une mise à jour SQL directe (par exemple via le SQL editor Supabase) ne déclenche pas le trigger TypeScript. Pour automatiser au niveau DB, il faudrait un trigger PostgreSQL — hors scope V1.
- **Sécurité** : le champ `code_recommandation` est limité à 40 caractères (constante `MAX_REFERRAL_CODE`). La validation rejette les payloads abusifs.
- **Snapshot du partenaire** : `referral_partner_name`, `referral_partner_type`, `referral_bonus_eur` sont snappés au moment de l'inscription dans les colonnes Supabase. Si le code est désactivé ou le bonus modifié plus tard, les anciennes candidatures gardent les valeurs d'origine.
- **Audit log** : 3 nouveaux events sont émis (`referral_attached` à l'inscription, `referral_due`/`referral_cancelled` au trigger auto, `referral_payout_status_change`/`referral_payout_paid_at_change`/`referral_payout_method_change` lors des mutations manuelles).
