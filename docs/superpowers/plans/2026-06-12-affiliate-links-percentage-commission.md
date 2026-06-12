# Liens d'affiliation + commission en pourcentage — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre à un influenceur (PaoloZ d'abord) de partager un lien d'affiliation `mkrcamp.com/?ref=<code>` qui attribue une commission de X % du CA encaissé par réservation, en réutilisant le système de parrainage existant et en faisant coexister forfait fixe et pourcentage.

**Architecture:** Extension du fichier data committé `src/data/referral-codes.ts` (approche A, pas de table DB). Le `?ref` est capté par `proxy.ts` → cookie `mkr_ref` 60 j → le formulaire pré-remplit le code. Le modèle de commission (`flat`/`percent`) est snapshotté à l'inscription ; pour les `percent`, le montant en euros est calculé à la transition `soldee` depuis `package_amount_cents` et recalculé si Ruslan édite le CA. Le montant payable canonique reste `referral_bonus_eur`, donc le dashboard d'agrégation existant continue de fonctionner.

**Tech Stack:** Next.js 16 (App Router, `proxy.ts`), React 19, next-intl 4.12 (FR + EN), Supabase (table `candidatures`), TypeScript strict.

**Note sur les tests :** Ce repo n'a pas de runner unitaire (vitest/jest) — seulement `@playwright/test` pour la QA i18n (`tests/i18n/`). On suit ce pattern : la vérification de chaque tâche = `npm run build` (typecheck strict, attrape les incohérences de signature) + un test Playwright e2e pour le flux visiteur `?ref` + vérification manuelle admin avec des nombres concrets pour la logique monétaire. On n'introduit pas de nouveau framework de test.

**Spec :** `docs/superpowers/specs/2026-06-12-affiliate-links-percentage-commission-design.md`

**Commits :** branche `main` (workflow David). Commit après chaque tâche. **Ne pas `git push`** sans validation explicite de David (un push sur `main` déclenche le déploiement Vercel).

---

## File Structure

- `src/data/referral-codes.ts` — **Modify** : type `ReferralCode` étendu (`commissionType`, `commissionPct`), helper `computeCommissionEur`, helper `affiliateLink`, 5 partenaires passés `flat`, PaoloZ ajouté `percent`.
- `src/proxy.ts` — **Modify** : capture `?ref` valide → pose cookie `mkr_ref`.
- `src/app/api/inscription/route.ts` — **Modify** : snapshot `referral_commission_type`/`referral_commission_pct`, `referral_bonus_eur = null` pour les `percent`.
- `src/app/api/admin/candidature/[id]/route.ts` — **Modify** : ajout des colonnes commission au `select` ; calcul du montant `percent` à la transition `soldee` ; recalcul sur édition de `package_amount_cents`.
- `src/components/InscriptionLayout.tsx` — **Modify** : lecture cookie `mkr_ref` au montage → pré-remplit `codeRecommandation` + synchronise `sourceDecouverte`.
- `src/components/ReferralBanner.tsx` — **Create** : bandeau de confiance site-wide « Tu viens de la part de X », dismissable.
- `src/components/admin/ReferralPanel.tsx` — **Modify** : affiche le modèle (forfait/%) + détail `10 % × CA = X €` + garde-fou « CA à saisir ».
- `src/app/admin/referrals/page.tsx` — **Modify** : colonne Modèle, calcul `percent`, garde-fou ligne orange, bloc « liens partenaires à copier ».
- `src/components/admin/ReferralLinks.tsx` — **Create** : liste des liens d'affiliation avec bouton « Copier » (client component).
- `messages/fr/common.json` + `messages/en/common.json` — **Modify** : clés du bandeau de confiance.
- `messages/fr/politique-de-confidentialite.json` (+ en) — **Modify** : mention du cookie `mkr_ref` (ou page MDX correspondante — voir Task 11).
- Migration Supabase — 2 colonnes sur `candidatures`.
- `tests/affiliate/ref-capture.spec.ts` — **Create** : test e2e Playwright du flux `?ref` → cookie → pré-remplissage.

---

## Task 1: Migration Supabase — colonnes commission

**Files:**
- Migration appliquée via MCP Supabase (projet MKR) ou SQL editor.

- [ ] **Step 1: Inspecter la table avant modification**

Utiliser le MCP Supabase : `list_tables` (schema `public`) puis vérifier que `candidatures` possède déjà `referral_code`, `referral_bonus_eur`, `referral_payout_status`, `package_amount_cents`. Confirmer que `referral_commission_type` et `referral_commission_pct` n'existent **pas** encore.

- [ ] **Step 2: Appliquer la migration (additive, idempotente)**

Via MCP `apply_migration` (name: `add_referral_commission_model`) :

```sql
alter table public.candidatures
  add column if not exists referral_commission_type text
    check (referral_commission_type in ('flat', 'percent')),
  add column if not exists referral_commission_pct numeric;

comment on column public.candidatures.referral_commission_type is
  'Modèle de commission snapshotté à l''inscription : flat (forfait bonusEur) ou percent (% du CA). null = legacy (traité comme flat figé).';
comment on column public.candidatures.referral_commission_pct is
  'Taux en pourcentage (ex: 10) si referral_commission_type = percent. null sinon.';
```

- [ ] **Step 3: Vérifier**

Via MCP `list_tables` ou `execute_sql` :

```sql
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'candidatures'
  and column_name in ('referral_commission_type', 'referral_commission_pct');
```

Expected : 2 lignes, toutes deux `is_nullable = YES`.

- [ ] **Step 4: Vérifier les advisors**

Via MCP `get_advisors` (type `security`) — s'assurer qu'aucune nouvelle alerte RLS n'apparaît (les colonnes héritent de la policy existante de `candidatures`). Aucune action si la table était déjà couverte.

- [ ] **Step 5: Commit**

Pas de fichier local pour la migration MCP. Noter dans le commit suivant la migration appliquée. (Si le repo a un dossier `supabase/migrations/`, y déposer le SQL ; vérifier avec `ls supabase/migrations` — sinon ignorer.)

---

## Task 2: Étendre le modèle de données `referral-codes.ts`

**Files:**
- Modify: `src/data/referral-codes.ts`

- [ ] **Step 1: Étendre le type `ReferralCode` et marquer les 5 partenaires existants `flat`**

Remplacer le type et la constante. Le champ `commissionType` devient requis ; `bonusEur` devient optionnel (requis seulement si `flat`) ; ajout de `commissionPct` (requis si `percent`).

```ts
export type ReferralPartnerType = 'gym' | 'influencer' | 'coach' | 'other'

export type CommissionType = 'flat' | 'percent'

export type ReferralCode = {
  /** Code en uppercase. Matché après trim().toUpperCase() côté API et form. */
  code: string
  /** Nom complet du partenaire affiché en admin (snapshot stocké à l'inscription). */
  partnerName: string
  /** Contact interne (email, URL Insta, tel). Jamais affiché côté public. */
  partnerContact?: string
  type: ReferralPartnerType
  /** Modèle de commission : 'flat' (forfait fixe bonusEur) ou 'percent' (% du CA encaissé). */
  commissionType: CommissionType
  /** Forfait en euros versé quand la candidature passe en `soldee`. Requis si commissionType==='flat'. */
  bonusEur?: number
  /** Taux en % du CA (ex: 10). Requis si commissionType==='percent'. */
  commissionPct?: number
  /** Si false, le code n'est plus accepté en nouvelle inscription mais reste traçable. */
  active: boolean
  notes?: string
  sourceDecouverteLabel?: string
  sourceDecouverteValue?: string
}
```

Mettre `commissionType: 'flat'` sur **chacun** des 5 partenaires existants (STRIKE, ZEZE74, RAKHIM86, TENGIZ, MMASPIRIT), en conservant leur `bonusEur: 50`. Exemple pour le premier :

```ts
  {
    code: 'STRIKE',
    partnerName: 'Strike Academy (Progress Gym SA)',
    type: 'gym',
    commissionType: 'flat',
    bonusEur: 50,
    active: true,
    notes: 'Kevin Leone - partenariat 2026',
    sourceDecouverteLabel: 'Salle Strike Academy',
    sourceDecouverteValue: 'strike-academy',
  },
```

(Faire de même pour ZEZE74, RAKHIM86, TENGIZ, MMASPIRIT : ajouter la ligne `commissionType: 'flat',` juste avant `bonusEur: 50,`.)

- [ ] **Step 2: Ajouter PaoloZ**

Ajouter cette entrée à la fin du tableau `REFERRAL_CODES` :

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
  },
```

- [ ] **Step 3: Ajouter les helpers `computeCommissionEur` et `affiliateLink`**

Ajouter en bas du fichier (après les helpers existants) :

```ts
/**
 * Calcule le montant de commission en euros (arrondi à l'entier) pour un partenaire.
 * - flat    : retourne bonusEur (indépendant du CA).
 * - percent : retourne round(packageAmountCents * pct / 100 / 100) si le CA est connu,
 *             sinon null (le montant sera calculable une fois le CA saisi).
 * Retourne null si le modèle est incohérent (sécurité).
 */
export function computeCommissionEur(
  partner: Pick<ReferralCode, 'commissionType' | 'bonusEur' | 'commissionPct'>,
  packageAmountCents: number | null,
): number | null {
  if (partner.commissionType === 'flat') {
    return typeof partner.bonusEur === 'number' ? partner.bonusEur : null
  }
  if (partner.commissionType === 'percent') {
    if (typeof partner.commissionPct !== 'number') return null
    if (packageAmountCents === null || packageAmountCents <= 0) return null
    return Math.round((packageAmountCents * partner.commissionPct) / 100 / 100)
  }
  return null
}

/** Base URL publique du site (sans slash final). */
export const SITE_BASE_URL = 'https://mkrcamp.com'

/** Construit le lien d'affiliation partageable d'un partenaire : https://mkrcamp.com/?ref=paoloz */
export function affiliateLink(code: string, baseUrl: string = SITE_BASE_URL): string {
  return `${baseUrl}/?ref=${encodeURIComponent(code.toLowerCase())}`
}
```

- [ ] **Step 4: Vérifier le typecheck**

Run: `npm run build`
Expected: build PASS. Si erreur TS du type « `bonusEur` is possibly undefined » dans un consommateur existant (ex: `api/inscription/route.ts` ligne `matchedReferral?.bonusEur`), c'est attendu — corrigé en Task 4. Pour cette tâche, vérifier au minimum que `referral-codes.ts` lui-même ne produit pas d'erreur (les erreurs doivent venir uniquement des fichiers consommateurs traités dans les tâches suivantes). Si le build bloque trop tôt pour voir, faire `npx tsc --noEmit` et lire les erreurs : elles ne doivent concerner que `route.ts`/`page.tsx` consommateurs, pas `referral-codes.ts`.

- [ ] **Step 5: Commit**

```bash
git add src/data/referral-codes.ts
git commit -m "feat(referral): modèle de commission flat/percent + PaoloZ + helpers"
```

---

## Task 3: Capture `?ref` dans `proxy.ts`

**Files:**
- Modify: `src/proxy.ts`

- [ ] **Step 1: Importer le validateur et ajouter la pose de cookie**

En haut de `src/proxy.ts`, ajouter l'import :

```ts
import { findReferralCode } from './data/referral-codes';
```

Ajouter une constante près de `COOKIE_NAME` :

```ts
const REF_COOKIE_NAME = 'mkr_ref';
const REF_COOKIE_MAX_AGE = 60 * 60 * 24 * 60; // 60 jours en secondes
```

- [ ] **Step 2: Helper de pose de cookie sur une réponse**

Ajouter cette fonction au-dessus de `export function proxy` :

```ts
// Si l'URL contient ?ref=<code> et que le code est valide + actif, pose le cookie
// d'attribution mkr_ref (60j, lisible JS, SameSite=Lax) sur la réponse fournie.
// Un ?ref inconnu/inactif est ignoré silencieusement (pas de fausse attribution).
function applyReferralCapture(request: NextRequest, response: NextResponse): NextResponse {
  const ref = request.nextUrl.searchParams.get('ref');
  if (!ref) return response;
  const matched = findReferralCode(ref);
  if (!matched) return response;
  response.cookies.set(REF_COOKIE_NAME, matched.code, {
    maxAge: REF_COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    httpOnly: false, // lu par le formulaire client pour pré-remplir le code
  });
  return response;
}
```

- [ ] **Step 3: Brancher la capture sur le flux pages publiques**

Dans `export function proxy`, le `?ref` ne concerne que les pages publiques (pas l'admin, pas les API). Modifier la fin de la fonction :

```ts
export function proxy(request: NextRequest) {
  const adminResponse = handleAdminGuard(request);
  if (adminResponse) return adminResponse;

  // API routes publiques non localisees
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // i18n routing pour toutes les pages publiques + capture éventuelle du ?ref d'affiliation.
  const intlResponse = intlMiddleware(request);
  return applyReferralCapture(request, intlResponse);
}
```

Note : `intlMiddleware(request)` retourne un `NextResponse` (rewrite/redirect/next selon next-intl). `response.cookies.set` fonctionne sur tous ces types. La capture marche donc identiquement sur `/?ref=` et `/en?ref=`.

- [ ] **Step 4: Vérifier le build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Vérification manuelle rapide (dev)**

Run: `npm run dev` puis dans un navigateur ouvrir `http://localhost:3000/?ref=paoloz`. Dans les DevTools → Application → Cookies, vérifier la présence de `mkr_ref = PAOLOZ`. Ouvrir ensuite `http://localhost:3000/?ref=inconnu123` dans un onglet privé : **aucun** cookie `mkr_ref` ne doit être posé. Arrêter le dev server.

- [ ] **Step 6: Commit**

```bash
git add src/proxy.ts
git commit -m "feat(referral): capture ?ref d'affiliation en cookie mkr_ref (60j)"
```

---

## Task 4: Snapshot du modèle de commission à l'inscription

**Files:**
- Modify: `src/app/api/inscription/route.ts`

- [ ] **Step 1: Étendre le type de `referralFields` et le snapshot**

Dans `src/app/api/inscription/route.ts`, remplacer le bloc `referralFields` (actuellement lignes ~225-248) par :

```ts
  const referralFields: {
    referral_code: string | null
    referral_code_valid: boolean | null
    referral_partner_name: string | null
    referral_partner_type: ReferralPartnerType | null
    referral_commission_type: 'flat' | 'percent' | null
    referral_commission_pct: number | null
    referral_bonus_eur: number | null
    referral_payout_status: 'not_applicable' | 'pending'
  } = rawReferral
    ? {
        referral_code: normalizedReferral,
        referral_code_valid: matchedReferral !== null,
        referral_partner_name: matchedReferral?.partnerName ?? null,
        referral_partner_type: matchedReferral?.type ?? null,
        referral_commission_type: matchedReferral?.commissionType ?? null,
        referral_commission_pct: matchedReferral?.commissionPct ?? null,
        // flat : bonus connu dès l'inscription. percent : montant inconnu (CA pas encore saisi) -> null.
        referral_bonus_eur:
          matchedReferral?.commissionType === 'flat'
            ? (matchedReferral.bonusEur ?? null)
            : null,
        referral_payout_status: matchedReferral ? 'pending' : 'not_applicable',
      }
    : {
        referral_code: null,
        referral_code_valid: null,
        referral_partner_name: null,
        referral_partner_type: null,
        referral_commission_type: null,
        referral_commission_pct: null,
        referral_bonus_eur: null,
        referral_payout_status: 'not_applicable',
      }
```

Le `...referralFields` dans `candidatureRow` (ligne ~263) propage automatiquement les 2 nouvelles colonnes — aucune autre modification de l'insert nécessaire.

- [ ] **Step 2: Vérifier le build**

Run: `npm run build`
Expected: PASS. L'erreur potentielle de Task 2 (`bonusEur` possibly undefined) est maintenant résolue ici puisqu'on lit `bonusEur` seulement quand `commissionType === 'flat'`.

- [ ] **Step 3: Vérification manuelle (dev)**

`npm run dev`, soumettre une candidature de test via `http://localhost:3000/?ref=paoloz` → `/inscription` (le code sera pré-rempli après Task 6 ; pour cette tâche, taper `PAOLOZ` dans le champ code manuellement). Vérifier en base (MCP Supabase `execute_sql`) que la dernière candidature a `referral_commission_type = 'percent'`, `referral_commission_pct = 10`, `referral_bonus_eur = null`, `referral_payout_status = 'pending'`. Supprimer la ligne de test ensuite.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/inscription/route.ts
git commit -m "feat(referral): snapshot commission_type/pct à l'inscription, bonus null pour percent"
```

---

## Task 5: Calcul et recalcul du montant `percent` côté admin

**Files:**
- Modify: `src/app/api/admin/candidature/[id]/route.ts`

- [ ] **Step 1: Ajouter les colonnes commission au `select` de `current`**

Ligne ~96, ajouter `referral_commission_type, referral_commission_pct` à la chaîne de `.select(...)` :

```ts
    .select('id, status, package_paid_at, package_amount_cents, payment_method, payment_date, notes_admin, notes_visio, referral_code, referral_code_valid, referral_partner_name, referral_commission_type, referral_commission_pct, referral_bonus_eur, referral_payout_status, referral_payout_paid_at, referral_payout_method')
```

- [ ] **Step 2: Importer le helper de calcul**

En haut du fichier, ajouter à l'import existant de `referral-codes` (ou créer l'import si absent) :

```ts
import { computeCommissionEur } from '@/data/referral-codes'
```

- [ ] **Step 3: Calculer le montant `percent` à la transition `soldee`**

Dans le bloc « 2 bis. Auto-trigger du bonus referral » (lignes ~133-176), augmenter la branche `soldee` pour calculer `referral_bonus_eur` quand le partenaire est `percent`. Remplacer la branche `if (newStatus === 'soldee' && ...)` par :

```ts
    if (
      newStatus === 'soldee'
      && current.referral_code_valid === true
      && currentPayout === 'pending'
    ) {
      updates.referral_payout_status = 'due'

      // Pour un partenaire 'percent', calculer le montant depuis le CA connu à cet instant.
      // CA absent -> on passe quand même 'due', montant restera null (flaggé en UI), calculé à la saisie du CA.
      if (current.referral_commission_type === 'percent') {
        const computed = computeCommissionEur(
          { commissionType: 'percent', commissionPct: current.referral_commission_pct ?? undefined },
          // si le CA est mis à jour dans le même PATCH, utiliser la nouvelle valeur
          typeof body.package_amount_cents === 'number'
            ? body.package_amount_cents
            : (current.package_amount_cents ?? null),
        )
        if (computed !== null) {
          updates.referral_bonus_eur = computed
        }
      }

      auditEntries.push({
        candidature_id: id,
        event: 'referral_due',
        from_value: { referral_payout_status: 'pending' },
        to_value: { referral_payout_status: 'due' },
        data: {
          partner: current.referral_partner_name,
          bonus_eur: updates.referral_bonus_eur ?? current.referral_bonus_eur,
        },
        actor_email: actor,
      })
    }
```

- [ ] **Step 4: Recalculer le montant `percent` quand le CA est édité**

Dans le bloc « 4. Montant package » (lignes ~191-202), après avoir mis `updates.package_amount_cents`, ajouter le recalcul. Remplacer ce bloc par :

```ts
  // 4. Montant package
  if (typeof body.package_amount_cents === 'number' && body.package_amount_cents >= 0) {
    if (body.package_amount_cents !== current.package_amount_cents) {
      updates.package_amount_cents = body.package_amount_cents
      auditEntries.push({
        candidature_id: id,
        event: 'package_amount_change',
        from_value: { package_amount_cents: current.package_amount_cents },
        to_value: { package_amount_cents: body.package_amount_cents },
        actor_email: actor,
      })

      // Recalcul du bonus pour les partenaires 'percent' tant que le payout n'est pas figé (paid/cancelled).
      const payoutNow = (updates.referral_payout_status ?? current.referral_payout_status) as ReferralPayoutStatus | null
      if (
        current.referral_commission_type === 'percent'
        && (payoutNow === 'pending' || payoutNow === 'due')
      ) {
        const recomputed = computeCommissionEur(
          { commissionType: 'percent', commissionPct: current.referral_commission_pct ?? undefined },
          body.package_amount_cents,
        )
        const prevBonus = current.referral_bonus_eur ?? null
        if (recomputed !== prevBonus) {
          updates.referral_bonus_eur = recomputed
          auditEntries.push({
            candidature_id: id,
            event: 'referral_bonus_recomputed',
            from_value: { referral_bonus_eur: prevBonus },
            to_value: { referral_bonus_eur: recomputed },
            data: { reason: 'package_amount_change', pct: current.referral_commission_pct },
            actor_email: actor,
          })
        }
      }
    }
  }
```

- [ ] **Step 5: Vérifier le build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 6: Vérification manuelle (dev) — la logique monétaire**

`npm run dev`, se connecter à `/admin`. Sur une candidature de test rattachée à `PAOLOZ` (créée comme en Task 4) :
1. Saisir un montant package de `259000` cents (2590 €) puis passer le statut en **soldée**. Vérifier dans `ReferralPanel` (après Task 7) ou en base que `referral_bonus_eur = 259` (10 % de 2590) et `referral_payout_status = 'due'`.
2. Éditer le CA à `300000` cents (3000 €). Vérifier que `referral_bonus_eur` est recalculé à `300`.
3. Test garde-fou : sur une 2e candidature PaoloZ **sans** CA saisi, passer en soldée. Vérifier `referral_payout_status = 'due'` et `referral_bonus_eur = null`. Saisir ensuite le CA → le montant se calcule.
4. Test forfait inchangé : une candidature `STRIKE` passée en soldée garde `referral_bonus_eur = 50`.

Vérifier via MCP `execute_sql` :
```sql
select referral_code, referral_commission_type, referral_commission_pct,
       package_amount_cents, referral_bonus_eur, referral_payout_status
from candidatures where referral_code in ('PAOLOZ','STRIKE')
order by created_at desc limit 5;
```
Supprimer les lignes de test ensuite.

- [ ] **Step 7: Commit**

```bash
git add "src/app/api/admin/candidature/[id]/route.ts"
git commit -m "feat(referral): calcul % du CA à la soldée + recalcul sur édition du montant"
```

---

## Task 6: Pré-remplissage du code depuis le cookie (formulaire public)

**Files:**
- Modify: `src/components/InscriptionLayout.tsx`

- [ ] **Step 1: Ajouter un effet de lecture du cookie au montage**

Dans `InscriptionLayout.tsx`, repérer les imports React (`useMemo`, `useEffect` sont déjà utilisés). Ajouter, à l'intérieur du composant, après l'initialisation de `form`/`set` (après le bloc `sourceCodeConflict` useMemo, vers la ligne ~285) :

```ts
  // Lecture du cookie d'attribution mkr_ref (posé par proxy.ts depuis ?ref=<code>).
  // Pré-remplit le code de recommandation et synchronise le menu "Comment as-tu connu le camp ?".
  // Ne s'exécute qu'au montage et seulement si le candidat n'a encore rien saisi.
  useEffect(() => {
    if (form.codeRecommandation.trim()) return
    const match = document.cookie.match(/(?:^|;\s*)mkr_ref=([^;]+)/)
    if (!match) return
    const code = decodeURIComponent(match[1])
    const partner = findReferralCode(code)
    if (!partner) return
    setForm(prev => ({
      ...prev,
      codeRecommandation: partner.code,
      // ne pas écraser un choix déjà fait par le candidat
      sourceDecouverte: prev.sourceDecouverte || partner.sourceDecouverteValue || prev.sourceDecouverte,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
```

Notes :
- `findReferralCode` est déjà importé en haut de `InscriptionLayout.tsx` (vérifié : ligne 30 importe `findReferralCode, findCodeBySourceValue, getPartnersWithSourceOption`).
- `setForm` est le setter d'état existant (utilisé par `set`). Utiliser `setForm` directement ici pour mettre à jour 2 champs en une fois.
- Le pré-remplissage déclenche automatiquement le `referralFeedback` existant → l'encart vert « Recommandé par {partner} » s'affiche sans code supplémentaire.

- [ ] **Step 2: Vérifier le build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Vérification manuelle (dev)**

`npm run dev`. Ouvrir `http://localhost:3000/?ref=paoloz` (pose le cookie), puis naviguer vers la page d'inscription (tunnel session). Le champ « Code de recommandation » doit afficher `PAOLOZ` et l'encart vert « Recommandé par PaoloZ (@paolo_irl) » doit apparaître. Le menu « Comment as-tu connu le camp ? » doit être positionné sur l'option PaoloZ. Tester aussi `/en?ref=paoloz` → encart « Recommended by … ».

- [ ] **Step 4: Commit**

```bash
git add src/components/InscriptionLayout.tsx
git commit -m "feat(referral): pré-remplissage du code depuis le cookie mkr_ref"
```

---

## Task 7: Affichage du modèle de commission dans `ReferralPanel`

**Files:**
- Modify: `src/components/admin/ReferralPanel.tsx`
- Modify: `src/app/admin/inscriptions/[id]/page.tsx` (passer les nouvelles props)

- [ ] **Step 1: Ajouter les props commission + le bloc de détail**

Dans `ReferralPanel.tsx`, étendre l'interface `Props` :

```ts
interface Props {
  candidatureId: string
  referralCode: string | null
  referralCodeValid: boolean | null
  referralPartnerName: string | null
  referralPartnerType: string | null
  referralCommissionType: string | null   // nouveau
  referralCommissionPct: number | null     // nouveau
  referralBonusEur: number | null
  referralPayoutStatus: string | null
  referralPayoutPaidAt: string | null
  referralPayoutMethod: string | null
  packageAmountCents: number | null        // nouveau (pour afficher la base CA)
}
```

Remplacer le bloc d'affichage du bonus (le `{props.referralBonusEur !== null && (...)}` dans le `<dl>`) par un bloc « Modèle + montant » :

```tsx
        <div className="adm-def">
          <dt className="adm-def-key">Modèle</dt>
          <dd className="adm-def-val">
            {props.referralCommissionType === 'percent'
              ? `${props.referralCommissionPct ?? '?'} % du CA encaissé`
              : props.referralCommissionType === 'flat'
                ? 'Forfait fixe'
                : '—'}
          </dd>
        </div>

        <div className="adm-def">
          <dt className="adm-def-key">Commission</dt>
          <dd className="adm-def-val">
            {props.referralBonusEur !== null ? (
              <strong>{props.referralBonusEur} €</strong>
            ) : props.referralCommissionType === 'percent' ? (
              <span style={{ color: 'var(--adm-status-reportee)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <Icon name="alert-triangle" size={13} strokeWidth={2.4} />
                CA à saisir pour calculer la commission
              </span>
            ) : (
              <span className="adm-def-val--muted">—</span>
            )}
            {props.referralCommissionType === 'percent'
              && props.referralBonusEur !== null
              && props.packageAmountCents
              && props.packageAmountCents > 0 && (
              <span style={{ color: 'var(--adm-text-muted)', marginLeft: '0.4rem', fontSize: '0.82rem' }}>
                ({props.referralCommissionPct} % × {Math.round(props.packageAmountCents / 100)} €)
              </span>
            )}
          </dd>
        </div>
```

- [ ] **Step 2: Mettre à jour le texte de la modale « Marquer payé »**

Dans la modale, le message utilise `props.referralBonusEur`. Garder tel quel — il reflète déjà le montant calculé.

- [ ] **Step 3: Passer les nouvelles props depuis la page de détail**

Dans `src/app/admin/inscriptions/[id]/page.tsx`, le `<ReferralPanel ... />` (vers ligne ~635). D'abord, s'assurer que le `select` qui charge `candidature` (chercher `package_amount_cents, payment_method` vers ligne ~280) inclut `referral_commission_type, referral_commission_pct` — les ajouter à la chaîne `.select(...)`. Puis ajouter les props :

```tsx
            <ReferralPanel
              candidatureId={candidature.id}
              referralCode={candidature.referral_code}
              referralCodeValid={candidature.referral_code_valid}
              referralPartnerName={candidature.referral_partner_name}
              referralPartnerType={candidature.referral_partner_type}
              referralCommissionType={candidature.referral_commission_type}
              referralCommissionPct={candidature.referral_commission_pct}
              referralBonusEur={candidature.referral_bonus_eur}
              referralPayoutStatus={candidature.referral_payout_status}
              referralPayoutPaidAt={candidature.referral_payout_paid_at}
              referralPayoutMethod={candidature.referral_payout_method}
              packageAmountCents={candidature.package_amount_cents}
            />
```

Vérifier aussi l'interface TypeScript locale de `candidature` dans ce fichier (le type `Row`/`Candidature` en haut) et y ajouter `referral_commission_type: string | null` et `referral_commission_pct: number | null` si le fichier type explicitement les colonnes.

- [ ] **Step 4: Vérifier le build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Vérification manuelle**

`npm run dev`, ouvrir une fiche candidature PaoloZ soldée : le panneau « Recommandation » montre « Modèle : 10 % du CA encaissé » et « Commission : 259 € (10 % × 2590 €) ». Une candidature PaoloZ soldée sans CA montre « CA à saisir ». Une candidature STRIKE montre « Modèle : Forfait fixe » et « Commission : 50 € ».

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/ReferralPanel.tsx "src/app/admin/inscriptions/[id]/page.tsx"
git commit -m "feat(referral): affichage modèle + détail commission % dans ReferralPanel"
```

---

## Task 8: Dashboard `/admin/referrals` — modèle, calcul %, garde-fou

**Files:**
- Modify: `src/app/admin/referrals/page.tsx`

- [ ] **Step 1: Charger les colonnes commission + le CA**

Dans le `.select(...)` (vers ligne ~150), ajouter les colonnes nécessaires :

```ts
    .select('id, status, package_amount_cents, referral_code, referral_code_valid, referral_partner_name, referral_partner_type, referral_commission_type, referral_commission_pct, referral_bonus_eur, referral_payout_status, referral_payout_paid_at, referral_payout_method')
```

Étendre l'interface `Row` du fichier avec :

```ts
  package_amount_cents: number | null
  referral_commission_type: string | null
  referral_commission_pct: number | null
```

- [ ] **Step 2: Étendre `PartnerSummary` et l'agrégation pour distinguer le modèle + compter les CA manquants**

Ajouter à `PartnerSummary` :

```ts
  commissionType: string | null
  commissionPct: number | null
  missingAmount: number   // candidatures soldées 'percent' sans CA saisi (donc commission non calculée)
```

Dans le seed depuis `REFERRAL_CODES` (boucle `for (const c of REFERRAL_CODES)`), ajouter :

```ts
      commissionType: c.commissionType,
      commissionPct: c.commissionPct ?? null,
      missingAmount: 0,
```

Dans le seed du code orphelin, ajouter `commissionType: r.referral_commission_type, commissionPct: r.referral_commission_pct, missingAmount: 0,`.

Dans la boucle `for (const r of rows)`, après le `switch (r.referral_payout_status)`, ajouter le comptage des CA manquants :

```ts
    // 'percent' due/pending mais bonus non encore calculé (CA absent) -> à signaler à Ruslan.
    if (
      r.referral_commission_type === 'percent'
      && (r.referral_payout_status === 'due' || r.referral_payout_status === 'pending')
      && (r.referral_bonus_eur === null && (r.package_amount_cents === null || r.package_amount_cents <= 0))
    ) {
      summary.missingAmount += 1
    }
```

- [ ] **Step 3: Afficher la colonne « Modèle » + le garde-fou**

Dans le `<thead>`, ajouter une colonne après « Type » :

```tsx
                  <th style={{ padding: '0.75rem 0.5rem' }}>Modèle</th>
```

Dans le `<tbody>`, après la cellule Type, ajouter :

```tsx
                    <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.8rem' }}>
                      {s.commissionType === 'percent'
                        ? `${s.commissionPct ?? '?'} % du CA`
                        : s.commissionType === 'flat'
                          ? `Forfait ${s.bonusEurDefault} €`
                          : '—'}
                      {s.missingAmount > 0 && (
                        <span
                          title={`${s.missingAmount} candidature(s) soldée(s) sans CA saisi : commission non calculée`}
                          style={{ display: 'block', marginTop: 2, color: 'var(--adm-status-reportee, #f59e0b)', fontSize: '0.72rem', fontWeight: 600 }}
                        >
                          ⚠ {s.missingAmount} CA à saisir
                        </span>
                      )}
                    </td>
```

Ajuster le `colSpan` du `<tfoot>` (la cellule « Total » passe de `colSpan={3}` à `colSpan={4}`).

- [ ] **Step 4: Vérifier le build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Vérification manuelle**

`npm run dev`, ouvrir `/admin/referrals`. Vérifier : ligne PaoloZ → « 10 % du CA » ; lignes salles → « Forfait 50 € » ; si une candidature PaoloZ soldée n'a pas de CA, le badge orange « ⚠ 1 CA à saisir » apparaît. Les totaux « à payer / payé » restent corrects.

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/referrals/page.tsx
git commit -m "feat(referral): dashboard - colonne Modèle, calcul %, garde-fou CA manquant"
```

---

## Task 9: Helper de copie des liens d'affiliation (admin)

**Files:**
- Create: `src/components/admin/ReferralLinks.tsx`
- Modify: `src/app/admin/referrals/page.tsx`

- [ ] **Step 1: Créer le composant client `ReferralLinks`**

```tsx
'use client'

import { useState } from 'react'
import Icon from './ui/Icon'

export interface ReferralLinkItem {
  code: string
  partnerName: string
  url: string
}

export default function ReferralLinks({ items }: { items: ReferralLinkItem[] }) {
  const [copied, setCopied] = useState<string | null>(null)

  async function copy(code: string, url: string) {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(code)
      setTimeout(() => setCopied((c) => (c === code ? null : c)), 2000)
    } catch {
      // clipboard indisponible (http non sécurisé) : sélectionner le texte en fallback silencieux
    }
  }

  if (items.length === 0) return null

  return (
    <section className="adm-card" style={{ marginBottom: '1.5rem' }}>
      <h2 className="adm-card-title">
        <Icon name="link" size={14} />
        Liens d'affiliation à partager
      </h2>
      <p style={{ fontSize: '0.8rem', color: 'var(--adm-text-muted)', margin: '0 0 0.9rem' }}>
        Chaque partenaire actif partage son lien. Le code est attribué automatiquement (cookie 60 jours).
      </p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.5rem' }}>
        {items.map((it) => (
          <li
            key={it.code}
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', padding: '0.5rem 0', borderBottom: '1px solid var(--adm-border-soft, rgba(255,255,255,0.05))' }}
          >
            <span style={{ fontWeight: 600, minWidth: 160 }}>{it.partnerName}</span>
            <code style={{ flex: 1, minWidth: 220, fontSize: '0.8rem', color: 'var(--adm-text-secondary)', wordBreak: 'break-all' }}>
              {it.url}
            </code>
            <button
              type="button"
              className="adm-btn adm-btn--ghost"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              onClick={() => copy(it.code, it.url)}
            >
              {copied === it.code ? 'Copié ✓' : 'Copier'}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
```

Note : vérifier que l'icône `link` existe dans le wrapper `Icon` (`src/components/admin/ui/Icon.tsx`). Si absente, utiliser une icône déjà présente (ex: `sparkles` ou `external-link`) — `grep -n "link" src/components/admin/ui/Icon.tsx`.

- [ ] **Step 2: Brancher dans la page dashboard (server component)**

Dans `src/app/admin/referrals/page.tsx`, importer en haut :

```ts
import ReferralLinks, { type ReferralLinkItem } from '@/components/admin/ReferralLinks'
import { REFERRAL_CODES, affiliateLink } from '@/data/referral-codes'
```

(`REFERRAL_CODES` est déjà importé ; ajouter `affiliateLink`.)

Construire la liste des liens (partenaires actifs) avant le `return`, après le calcul des `summaries` :

```ts
  const linkItems: ReferralLinkItem[] = REFERRAL_CODES
    .filter((c) => c.active)
    .map((c) => ({ code: c.code, partnerName: c.partnerName, url: affiliateLink(c.code) }))
```

Insérer le composant juste sous le `<h1>`/stats globales, avant le tableau :

```tsx
        <ReferralLinks items={linkItems} />
```

- [ ] **Step 3: Vérifier le build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Vérification manuelle**

`npm run dev`, ouvrir `/admin/referrals`. Le bloc « Liens d'affiliation à partager » liste tous les partenaires actifs avec leur URL `https://mkrcamp.com/?ref=<code>`. Cliquer « Copier » sur PaoloZ → le presse-papier contient `https://mkrcamp.com/?ref=paoloz`, le bouton affiche « Copié ✓ » 2 s.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/ReferralLinks.tsx src/app/admin/referrals/page.tsx
git commit -m "feat(referral): helper admin de copie des liens d'affiliation"
```

---

## Task 10: Bandeau de confiance site-wide

**Files:**
- Create: `src/components/ReferralBanner.tsx`
- Modify: `messages/fr/common.json`, `messages/en/common.json`
- Modify: le layout localisé qui englobe les pages publiques (`src/app/[locale]/layout.tsx`)

- [ ] **Step 1: Ajouter les clés i18n**

Dans `messages/fr/common.json`, ajouter une section (au niveau racine de l'objet) :

```json
  "referral_banner": {
    "text": "Tu viens de la part de {partner}",
    "dismiss": "Fermer"
  }
```

Dans `messages/en/common.json` :

```json
  "referral_banner": {
    "text": "You were referred by {partner}",
    "dismiss": "Close"
  }
```

(Vérifier qu'il n'y a pas déjà une clé `referral_banner` ; placer la virgule JSON correctement.)

- [ ] **Step 2: Créer le composant client**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { findReferralCode } from '@/data/referral-codes'

const DISMISS_KEY = 'mkr_ref_banner_dismissed'

export default function ReferralBanner() {
  const t = useTranslations('common.referral_banner')
  const [partnerName, setPartnerName] = useState<string | null>(null)

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY) === '1') return
    const match = document.cookie.match(/(?:^|;\s*)mkr_ref=([^;]+)/)
    if (!match) return
    const partner = findReferralCode(decodeURIComponent(match[1]))
    if (partner) setPartnerName(partner.partnerName)
  }, [])

  if (!partnerName) return null

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        padding: '0.5rem 1rem',
        background: 'var(--mkr-mountain-glow, #c8a04a)',
        color: '#1a1a1a',
        fontSize: '0.9rem',
        fontWeight: 600,
        textAlign: 'center',
      }}
    >
      <span>{t('text', { partner: partnerName })}</span>
      <button
        type="button"
        aria-label={t('dismiss')}
        onClick={() => {
          sessionStorage.setItem(DISMISS_KEY, '1')
          setPartnerName(null)
        }}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.1rem',
          lineHeight: 1,
          color: 'inherit',
          minWidth: 44,
          minHeight: 44,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ×
      </button>
    </div>
  )
}
```

Note : remplacer `var(--mkr-mountain-glow, #c8a04a)` par le token réel de la charte MKR si différent (vérifier `grep -ri "mountain-glow\|--mkr-" src/app/globals.css src/styles 2>/dev/null | head`). Couleur jaune signature MKR souhaitée.

- [ ] **Step 3: Monter le bandeau dans le layout localisé**

Repérer le layout public localisé (`src/app/[locale]/layout.tsx`). Importer et placer `<ReferralBanner />` tout en haut du `<body>`/wrapper, au-dessus du Header. Exemple :

```tsx
import ReferralBanner from '@/components/ReferralBanner'
// ... dans le JSX, juste à l'intérieur du provider next-intl, avant <Header /> :
        <ReferralBanner />
```

Vérifier que ce layout est bien un descendant de `NextIntlClientProvider` (sinon `useTranslations` échoue). Si le provider est dans ce layout, placer `<ReferralBanner />` à l'intérieur.

- [ ] **Step 4: Vérifier le build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Vérification manuelle**

`npm run dev`. Ouvrir `/?ref=paoloz` → bandeau jaune « Tu viens de la part de PaoloZ (@paolo_irl) » en haut. Cliquer × → disparaît et ne revient pas en rechargeant (sessionStorage). Ouvrir `/en?ref=paoloz` → « You were referred by … ». Ouvrir `/` sans ref → pas de bandeau.

- [ ] **Step 6: Commit**

```bash
git add src/components/ReferralBanner.tsx messages/fr/common.json messages/en/common.json "src/app/[locale]/layout.tsx"
git commit -m "feat(referral): bandeau de confiance site-wide (FR+EN, dismissable)"
```

---

## Task 11: Mention RGPD du cookie `mkr_ref`

**Files:**
- Modify: page politique de confidentialité (MDX ou JSON i18n)

- [ ] **Step 1: Localiser la page**

Run: `grep -rln "cookie" "src/app/[locale]" messages/fr/politique-de-confidentialite.json messages/en/politique-de-confidentialite.json 2>/dev/null`
Identifier si le contenu est dans le JSON i18n (`messages/*/politique-de-confidentialite.json`) ou en dur dans une page. Lire la section cookies existante.

- [ ] **Step 2: Ajouter une ligne sur le cookie d'attribution**

Ajouter (FR) une entrée dans la section cookies, par ex :

> **mkr_ref** — Cookie fonctionnel d'attribution de recommandation. Conserve le code du partenaire qui vous a recommandé MKR (durée : 60 jours). Aucune donnée personnelle, aucun traçage publicitaire tiers.

Et l'équivalent EN :

> **mkr_ref** — Functional referral attribution cookie. Stores the code of the partner who referred you to MKR (duration: 60 days). No personal data, no third-party advertising tracking.

Respecter la structure exacte du fichier (clés JSON ou MDX). Pas d'em dash dans le texte (préférence David) : utiliser des parenthèses ou deux-points.

- [ ] **Step 3: Vérifier le build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "docs(referral): mention du cookie mkr_ref dans la politique de confidentialité"
```

---

## Task 12: Test e2e Playwright du flux d'attribution

**Files:**
- Create: `tests/affiliate/ref-capture.spec.ts`

- [ ] **Step 1: Écrire le test (modèle calqué sur `tests/i18n/layout-qa.spec.ts`)**

```ts
import { test, expect } from '@playwright/test'

// Vérifie le flux d'attribution : ?ref valide -> cookie mkr_ref -> bandeau + pré-remplissage.
// Pré-requis : un serveur dev/preview tourne (cf playwright.config.ts baseURL).

test.describe('Affiliation ?ref', () => {
  test('ref valide pose le cookie et affiche le bandeau', async ({ page, context }) => {
    await page.goto('/?ref=paoloz')
    const cookies = await context.cookies()
    const ref = cookies.find((c) => c.name === 'mkr_ref')
    expect(ref?.value).toBe('PAOLOZ')
    await expect(page.getByRole('status')).toContainText('PaoloZ')
  })

  test('ref inconnu ne pose pas de cookie', async ({ page, context }) => {
    await page.goto('/?ref=codebidon123')
    const cookies = await context.cookies()
    expect(cookies.find((c) => c.name === 'mkr_ref')).toBeUndefined()
  })

  test('le code est pré-rempli sur le formulaire après capture', async ({ page }) => {
    await page.goto('/?ref=paoloz')
    // adapter l'URL du tunnel session selon le routing réel (cf SITEMAP.md)
    await page.goto('/inscription')
    // l'encart de succès du champ referral affiche "Recommandé par"
    await expect(page.getByText(/Recommandé par/i)).toBeVisible()
  })
})
```

Note : vérifier l'URL réelle du formulaire d'inscription dans `SITEMAP.md` / le routing next-intl (peut être `/inscription`, `/inscription?type=session`, ou un slug traduit). Adapter le `page.goto('/inscription')`.

- [ ] **Step 2: Lancer le test**

Run: `npm run dev` dans un terminal, puis `npm run test:i18n -- tests/affiliate/ref-capture.spec.ts` dans un autre (ou configurer `webServer` dans `playwright.config.ts` s'il existe déjà).
Expected: 3 tests PASS.

Si l'URL du formulaire diffère, corriger le `goto` et relancer.

- [ ] **Step 3: Commit**

```bash
git add tests/affiliate/ref-capture.spec.ts
git commit -m "test(referral): e2e capture ?ref -> cookie -> bandeau + pré-remplissage"
```

---

## Task 13: Vérification finale + build de production

- [ ] **Step 1: Build complet**

Run: `npm run build`
Expected: PASS, zéro erreur TS.

- [ ] **Step 2: Revue de cohérence des nombres**

Refaire le scénario monétaire complet en dev (Task 5 Step 6) de bout en bout via un lien d'affiliation réel :
1. `/?ref=paoloz` → bandeau visible.
2. Remplir + soumettre une candidature → code `PAOLOZ` pré-rempli, `referral_commission_type='percent'`, `pct=10`, `bonus=null`.
3. Admin : saisir CA 2590 €, passer soldée → commission 259 €, statut « À payer ».
4. Dashboard `/admin/referrals` : PaoloZ « 10 % du CA », montant dû 259 €.
5. Marquer payé → statut « Payé ».
6. Supprimer les données de test.

- [ ] **Step 3: Mettre à jour la doc projet**

Mettre à jour `data/referral-codes.ts` reste la source de vérité pour ajouter un influenceur. Ajouter une note dans le `CLAUDE.md` du projet MKR (section partenaires/referral) : « Ajouter un influenceur % : éditer `data/referral-codes.ts` (commissionType: 'percent', commissionPct), commit, push, Vercel redeploy. Le lien est `mkrcamp.com/?ref=<code>`. »

- [ ] **Step 4: Commit final + mémo push**

```bash
git add -A
git commit -m "docs(referral): note d'exploitation ajout influenceur dans CLAUDE.md"
```

Ne pas `git push` : demander à David. Le push sur `main` déclenche le déploiement Vercel + il faudra purger le cache (cf memory `feedback_purge_cache_on_push`).

---

## Récapitulatif des vérifications de couverture (spec → tâches)

- Modèle commission flat/% configurable → Task 2
- Calcul % à la soldée + recalcul édition CA → Task 5
- Snapshot à l'inscription, bonus null pour % → Task 4
- Migration Supabase 2 colonnes → Task 1
- Capture ?ref + cookie 60j → Task 3
- Pré-remplissage formulaire → Task 6
- Bandeau de confiance FR+EN → Task 10
- Dashboard modèle + garde-fou CA → Task 8
- Helper copie de liens → Task 9
- Fiche candidature détail commission → Task 7
- RGPD cookie → Task 11
- i18n FR+EN → Tasks 6 (existant), 10 (banner)
- Test e2e → Task 12
- PaoloZ ajouté → Task 2
