# SPEC — Gestion des candidatures et inscriptions MKR

> **Date initiale** : 2026-05-01
> **Dernière révision** : 2026-05-04 (suppression du paiement Stripe / 100 €)
> **Auteur** : Claude pour DKDP / MKR Caucasian Camp (David Khazaei)
> **Statut** : 🟢 V1.5 déployée + révision business 2026-05-04 appliquée
> **Effort restant** : minime (paiement 100 % manuel par virement / espèces, plus de Stripe à brancher)

---

## ⚠️ BREAKING CHANGE — 2026-05-04 : suppression du paiement upfront

Décision Ruslan + David : **on abandonne le paiement Stripe de 100 € à l'inscription**. Le nouveau flow :

1. Candidat soumet le form `/inscription` → enregistré direct (pas de paiement)
2. Ruslan valide manuellement la candidature et planifie une visio
3. Si validée à l'issue de la visio : Ruslan envoie le RIB au candidat
4. Le candidat règle le package en **une seule fois** par virement bancaire ou espèces
5. Ruslan coche « Soldé » dans le dashboard et renseigne méthode + date de paiement

**Conséquences** :
- DB : colonnes `registration_fee_*`, `stripe_payment_intent_id`, `stripe_checkout_session_id` supprimées (migration `drop_stripe_columns_add_manual_payment_fields` du 2026-05-04). Ajout de `payment_method` (virement / cash / autre) et `payment_date` (date).
- Code : retrait des toggles « Frais 100 € payés » dans le dashboard admin, ajout d'un bloc « Méthode + date de paiement ».
- Pages publiques : suppression de toutes les mentions « acompte 30 % », « Stripe », « PayPal », « 100 € à l'inscription ».
- Sections de cette spec qui parlent de Stripe / 100 € / refunds Stripe / crédits 100 € → considérées **OBSOLÈTES**, conservées pour archive uniquement.

Les sections impactées (§1.1, §1.3, §1.7, §3.2 colonnes Stripe, §4.2 side-effects, §7.1 Stripe, §7.4 emails relatifs aux frais) sont en partie réécrites ci-dessous, en partie laissées en l'état pour préserver l'historique.

---

## 0 — Résumé exécutif (révisé 2026-05-04)

Mise en place d'un système de gestion du pipeline de candidatures pour MKR Caucasian Camp, avec :

- **Aucun paiement à l'inscription** (le form pousse en DB et notifie Ruslan)
- Compteur 15 places live et atomique sur la session officielle (déclenché dès status RECUE)
- Pipeline statuts (Reçue → Validée → Soldée → Camp fait) + branches (Refusée, Annulée, Reportée)
- Dashboard admin custom `/admin` en français pour Ruslan (kanban + alertes + saisie manuelle paiement)
- Notif Slack optionnelle à chaque nouvelle candidature (V1.5) — emails Resend en V2
- Paiement intégral post-visio par virement bancaire ou espèces (RIB envoyé manuellement par Ruslan)
- Tarifs en EUR (conversion 1:1 depuis CHF, déjà appliqué)

**Aucune intégration Bexio, aucune intégration Stripe.** Ruslan gère sa facturation côté business.

---

## 1 — Décisions business arbitrées (David, 2026-05-01)

### 1.1 Frais d'inscription — **SUPPRIMÉS (révision 2026-05-04)**

Plus aucun paiement n'est demandé au moment du form. Le candidat s'inscrit gratuitement, Ruslan valide manuellement, paie en une fois post-visio. Voir §1.3 ci-dessous.

> Section originale (frais 100 € via Stripe) archivée — voir l'historique git si besoin de référence.

### 1.2 Tarifs camp (EUR, conversion 1:1 depuis CHF)
| Durée | Adulte (18+) | Enfant/Ado (8-17, parent obligatoire) |
|---|---|---|
| 1 semaine | 1 500 € | 1 000 € |
| 2 semaines | 2 200 € | 1 400 € |
| 3 semaines | 2 900 € | 1 900 € |

### 1.3 Paiement du package (révisé 2026-05-04)
- **Aucun paiement à l'inscription**.
- **Un seul règlement post-visio** pour le package complet (montant total selon durée + nombre de personnes).
- **Méthodes acceptées** : virement bancaire (recommandé) ou espèces.
- **RIB envoyé manuellement** par Ruslan au candidat à l'issue de la visio de validation. Pas de génération PDF auto pour le moment.
- Pas d'étape acompte 30 %, pas d'étape 100 €. Tout est payé en une fois.

### 1.4 Capacité 15 places
- S'applique uniquement à la session officielle (`tunnel_type=session`)
- Décompte dès le statut `RECUE` (candidature soumise)
- Les statuts `RECUE`, `VALIDEE`, `SOLDEE` consomment 1 place
- Les statuts `REFUSEE`, `ANNULEE`, `REPORTEE`, `CAMP_FAIT` libèrent la place

### 1.5 Comportement à 15/15
- Page `/session-complete` avec 2 CTA : "Rejoindre la liste d'attente" OU "Organiser mon camp sur mesure"
- Form `/inscription?type=session` bloque l'accès et redirige

### 1.6 Délai visio
- Pas de timeout automatique
- Alerte rouge dans le dashboard après 7 jours sans visio
- Email rappel quotidien à Ruslan tant que le dossier reste en `RECUE` après 7j

### 1.7 Tunnel groupe/club (révisé 2026-05-04)
- Inscription sur dates custom uniquement (pas sur session officielle 17 août)
- 2 à 20 membres
- Aucun paiement à l'inscription (cf. §1.1). Paiement intégral du groupe post-visio par virement, au nom du responsable du club.

### 1.8 Multi-sessions
- 1 seule session active à la fois pour le moment
- Le modèle DB gère le multi-session (table `session_capacity`)
- L'UI multi-session activée plus tard quand le besoin émerge

---

## 2 — Stack technique

| Composant | Choix | Raison |
|---|---|---|
| Frontend | Next.js 16.2.2 (existant) | Site déjà en production, on capitalise |
| Database | Supabase Postgres | Auth + Realtime + Storage + RLS dans un seul tier gratuit |
| Auth admin | Supabase Auth (email/password) | 30 lignes de boilerplate vs 1 jour pour NextAuth |
| Paiement | Stripe Checkout (mode `payment` EUR) | Hosted page, conformité PCI gérée par Stripe |
| Emails | Resend + @react-email/components | Tier gratuit 3000 emails/mois, templates JSX |
| PDF | @react-pdf/renderer | 100 % Node, pas de Chrome headless sur Vercel |
| Cron | Vercel Cron | Built-in, pas de service externe |
| Realtime compteur | Supabase Realtime subscription | Push DB → site sans refresh |
| Host | Vercel (existant) | Statu quo, free tier suffit |

**Coûts mensuels estimés** : 0 € en démarrage. Si Supabase Pro pour backups : 25 USD/mois.
**Pas de Vercel Pro requis** pour ce projet.

---

## 3 — Modèle de données (6 tables)

### 3.1 `candidates`
La personne physique. Email unique pour retrouver l'historique d'un candidat sur plusieurs candidatures (reports, refus puis re-application…).

```sql
CREATE TABLE candidates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prenom          text NOT NULL,
  nom             text NOT NULL,
  email           text NOT NULL UNIQUE,
  telephone       text,
  date_naissance  date,
  pays            text,
  ville_depart    text,
  notes_admin     text,
  created_at      timestamptz NOT NULL DEFAULT NOW(),
  updated_at      timestamptz NOT NULL DEFAULT NOW()
);
```

### 3.2 `candidatures`

> ⚠️ **Schema réel post 2026-05-04** : les colonnes `registration_fee_cents`, `registration_fee_currency`, `registration_fee_paid_at`, `stripe_payment_intent_id`, `stripe_checkout_session_id` ont été supprimées. Deux nouvelles colonnes ont été ajoutées : `payment_method text CHECK (... IN ('virement','cash','autre'))` et `payment_date date`. Le bloc SQL ci-dessous reflète l'intention V1 originale et n'est plus aligné avec la prod — voir Supabase pour le schéma effectif.

Le dossier d'inscription. Une `candidate` peut avoir plusieurs `candidatures` dans le temps (reports, etc.). Les données du form sont en `jsonb` pour flexibilité.

```sql
CREATE TYPE tunnel_type_enum AS ENUM ('session', 'custom', 'groupe');
CREATE TYPE candidature_status_enum AS ENUM (
  'draft', 'recue', 'validee', 'refusee',
  'soldee', 'camp_fait', 'annulee', 'reportee', 'expired'
);

CREATE TABLE candidatures (
  id                            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id                  uuid NOT NULL REFERENCES candidates(id),
  tunnel_type                   tunnel_type_enum NOT NULL,
  session_id                    text,           -- ex 'aout-2026', null si tunnel != 'session'
  duree_semaines                int CHECK (duree_semaines IN (1,2,3)),
  date_debut_souhaitee          date,           -- pour custom et groupe
  status                        candidature_status_enum NOT NULL DEFAULT 'draft',
  status_changed_at             timestamptz NOT NULL DEFAULT NOW(),
  status_changed_by_email       text,           -- 'system' ou email Ruslan/David
  registration_fee_cents        int NOT NULL DEFAULT 10000, -- 10000 cents = 100 €
  registration_fee_currency     text NOT NULL DEFAULT 'EUR',
  registration_fee_paid_at      timestamptz,
  registration_fee_refunded_at  timestamptz,
  registration_fee_refunded_cents int,
  stripe_payment_intent_id      text UNIQUE,
  stripe_checkout_session_id    text UNIQUE,
  package_amount_cents          int,             -- en cents (ex 290000 = 2900 €)
  package_paid_at               timestamptz,
  facture_pdf_url               text,           -- Supabase Storage signed URL
  notes_visio                   text,
  notes_admin                   text,
  credit_used_id                uuid REFERENCES credits(id),
  form_data                     jsonb NOT NULL DEFAULT '{}',
  group_members                 jsonb,          -- pour tunnel_type='groupe'
  created_at                    timestamptz NOT NULL DEFAULT NOW(),
  updated_at                    timestamptz NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_candidatures_status ON candidatures(status);
CREATE INDEX idx_candidatures_session ON candidatures(session_id) WHERE tunnel_type = 'session';
CREATE INDEX idx_candidatures_candidate ON candidatures(candidate_id);
```

### 3.3 `credits`
Crédits de 100 € créés à un report, valables 12 mois.

```sql
CREATE TYPE credit_status_enum AS ENUM ('active', 'used', 'expired');

CREATE TABLE credits (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id                uuid NOT NULL REFERENCES candidates(id),
  amount_cents                int NOT NULL DEFAULT 10000, -- 10000 cents = 100 €
  currency                    text NOT NULL DEFAULT 'EUR',
  source_candidature_id       uuid NOT NULL REFERENCES candidatures(id),
  used_for_candidature_id     uuid REFERENCES candidatures(id),
  used_at                     timestamptz,
  status                      credit_status_enum NOT NULL DEFAULT 'active',
  issued_at                   timestamptz NOT NULL DEFAULT NOW(),
  expires_at                  timestamptz NOT NULL DEFAULT (NOW() + INTERVAL '12 months')
);
CREATE INDEX idx_credits_candidate ON credits(candidate_id, status);
```

### 3.4 `session_capacity`
Configuration par session. La capacité est paramétrable (15 par défaut, modifiable depuis `/admin/sessions`).

```sql
CREATE TYPE session_status_enum AS ENUM ('open', 'closed', 'completed');

CREATE TABLE session_capacity (
  session_id      text PRIMARY KEY,
  session_label   text NOT NULL,
  date_debut      date NOT NULL,
  date_fin        date NOT NULL,
  max_capacity    int NOT NULL DEFAULT 15,
  status          session_status_enum NOT NULL DEFAULT 'open',
  created_at      timestamptz NOT NULL DEFAULT NOW(),
  updated_at      timestamptz NOT NULL DEFAULT NOW()
);

INSERT INTO session_capacity VALUES
  ('aout-2026', 'Session août 2026', '2026-08-17', '2026-09-05', 15, 'open');
```

### 3.5 `waitlist`
Liste d'attente quand 15/15.

```sql
CREATE TABLE waitlist (
  id                            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id                    text NOT NULL REFERENCES session_capacity(session_id),
  email                         text NOT NULL,
  prenom                        text NOT NULL,
  nom                           text NOT NULL,
  telephone                     text,
  discipline_souhaitee          text,
  position                      int NOT NULL,
  invitation_token              text UNIQUE,
  invitation_sent_at            timestamptz,
  invitation_expires_at         timestamptz,
  converted_to_candidature_id   uuid REFERENCES candidatures(id),
  created_at                    timestamptz NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_waitlist_session ON waitlist(session_id, position);
```

### 3.6 `audit_log`
Log immuable des actions sur les candidatures.

```sql
CREATE TABLE audit_log (
  id                  bigserial PRIMARY KEY,
  candidature_id      uuid NOT NULL REFERENCES candidatures(id),
  event               text NOT NULL, -- 'status_change', 'note_added', 'refund', 'pdf_generated', etc.
  from_value          jsonb,
  to_value            jsonb,
  actor_email         text NOT NULL DEFAULT 'system',
  data                jsonb DEFAULT '{}',
  at                  timestamptz NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_candidature ON audit_log(candidature_id, at DESC);
```

### 3.7 Vue `v_session_places`
Compteur live des places. Lue par le site public (anonyme) et le dashboard.

```sql
CREATE VIEW v_session_places AS
SELECT
  sc.session_id,
  sc.session_label,
  sc.max_capacity,
  COUNT(c.id) FILTER (
    WHERE c.status IN ('recue', 'validee', 'soldee')
  )::int AS places_prises,
  (sc.max_capacity - COUNT(c.id) FILTER (
    WHERE c.status IN ('recue', 'validee', 'soldee')
  ))::int AS places_restantes,
  sc.status
FROM session_capacity sc
LEFT JOIN candidatures c
  ON c.session_id = sc.session_id
  AND c.tunnel_type = 'session'
GROUP BY sc.session_id, sc.session_label, sc.max_capacity, sc.status;
```

### 3.8 Row Level Security

- Tables `candidatures`, `candidates`, `credits`, `audit_log`, `waitlist`, `session_capacity` : **deny all** par défaut, accès uniquement via service_role (côté serveur API) ou via session Supabase Auth (admin).
- Vue `v_session_places` : **public read**.
- API `/api/inscription/*` utilise la `service_role` key (env Vercel).
- API `/admin/*` utilise la session JWT Supabase Auth de l'utilisateur connecté.

---

## 4 — Machine à états des statuts

### 4.1 Diagramme

```
[Submit form + Stripe 100€ webhook OK]
                │
                ▼
        ┌─────────────┐
        │ DRAFT       │ ← row créée avant Stripe (cleanup auto +1h si pas payé)
        └──────┬──────┘
               │ webhook checkout.session.completed
               ▼
        ┌─────────────┐  ← place décomptée (-1)
        │ RECUE       │
        └──────┬──────┘
               │
   ┌───────────┼───────────┐──────────────┐
   │           │           │              │
[Visio OK] [Visio refus] [Annule]   [Reporte]
   │           │           │              │
   ▼           ▼           ▼              ▼
┌────────┐ ┌──────────┐ ┌─────────┐  ┌──────────┐
│VALIDEE │ │REFUSEE   │ │ANNULEE  │  │REPORTEE  │
│facture │ │+ refund  │ │frais    │  │+ crédit  │
│envoyée │ │100€ auto │ │perdus   │  │12 mois   │
└───┬────┘ └──────────┘ └─────────┘  └──────────┘
    │      place +1     place +1     place +1
    │
[Virement reçu]
    │
    ▼
┌────────┐
│SOLDEE  │ ← inchangé
└───┬────┘
    │
[Camp fini]
    │
    ▼
┌─────────────┐
│ CAMP_FAIT   │ ← place libérée (mais session terminée)
└─────────────┘
```

### 4.2 Side-effects par transition (révisé 2026-05-04)

| Transition | Effets automatiques (V1.5 actuelle) | Effets V2 (quand emails Resend branchés) |
|---|---|---|
| Form → `recue` | Insert candidature + audit_log + notif Slack optionnelle, decrement compteur 15 places | + Email candidat #1, + Email Ruslan #2 |
| `recue` → `validee` (admin) | Audit log + rappel manuel à Ruslan d'envoyer le RIB | + Email candidat #3 avec RIB |
| `recue` → `refusee` (admin) | Audit log, libère place. Aucun remboursement (rien n'a été pris à l'inscription) | + Email candidat #4 |
| `validee` → `soldee` (admin) | Audit log (Ruslan saisit méthode + date paiement + montant) | + Email candidat de confirmation paiement |
| `*` → `annulee` (admin) | Audit log, libère place. Si paiement déjà reçu : appliquer manuellement la grille refund (100 / 50 / 0 selon délai) | + Email candidat #5 |
| `*` → `reportee` (admin) | Audit log, libère place, recaler manuellement le candidat | + Email candidat #6 |

> Section originale (Stripe webhook, refund Stripe, crédits 100 €, génération PDF) archivée. Voir l'historique git si besoin.
| `validee` → `soldee` (admin) | Email candidat #7, audit log |
| `soldee` → `camp_fait` (admin manuel post-camp) | Email candidat optionnel, audit log |

### 4.3 Garde-fous techniques

1. **Transitions interdites** validées côté serveur dans `/api/admin/candidature/[id]/transition`
2. **Atomicité du compteur** : `SELECT FOR UPDATE` sur `session_capacity` à chaque transition impactant le compteur
3. **Idempotence Stripe webhook** : table `stripe_events` avec `event_id` unique, rejet des doublons
4. **Refund partiel impossible** : 100 % ou rien
5. **Crédit usage unique** : verrou SQL sur `used_at IS NULL`, deux candidatures ne peuvent pas réclamer le même crédit
6. **Audit log immuable** : insert-only, pas d'UPDATE ni DELETE

---

## 5 — Dashboard `/admin` (Ruslan, FR)

### 5.1 Architecture pages

```
/admin/login                    → Email + password (Supabase Auth)
/admin                          → Home : kanban + sticky alertes
  ├── onglet Session 17 août    (avec compteur 15)
  ├── onglet Camps custom       (sans compteur)
  ├── onglet Crédits
  └── onglet Liste d'attente
/admin/candidatures/[id]        → Panel détail (modal ou route)
/admin/sessions                 → Gestion sessions (capacité, ajout future)
/admin/settings                 → RIB Ruslan, infos facturation
```

### 5.2 Vue Kanban (4 colonnes)

```
Reçues (frais ✓)  →  Validées (facture envoyée)  →  Soldées (tout payé)  →  Sorties (refusées/annulées/reportées)
```

Sticky alertes au-dessus :
- 🔴 Visios en retard (>7j sans traitement)
- 🟡 Nouvelles depuis 24h
- 🟡 Virements à vérifier (validées >3j sans solde)

### 5.3 Card candidature

Photo placeholder (initiales dans cercle coloré), drapeau pays, nom, discipline + durée, ancienneté du dossier, points statut. Clic → panel détail.

### 5.4 Panel détail (4 onglets)

- **Identité** : prénom, nom, email, téléphone, naissance, pays, ville
- **Dossier** : tout le `form_data` (discipline, niveau, années, club, palmares, lien vidéo, santé)
- **Paiement** : frais 100 € statut, Stripe ID, package amount, PDF facture (download), bouton "Marquer virement reçu"
- **Historique** : audit log chronologique

Boutons d'action en bas : `Valider`, `Refuser et rembourser`, `Reporter`, `Annuler`, `Marquer soldée`. Drag-and-drop bonus desktop.

### 5.5 Mobile

Responsive — kanban en desktop, vue liste compacte en mobile. Ruslan peut consulter post-visio depuis son téléphone.

### 5.6 Realtime

Supabase Realtime subscription sur `candidatures` table. Toute modif est poussée en <500ms sur tous les clients connectés.

---

## 6 — Site public (modifications)

### 6.1 Form `/inscription`

Le `InscriptionLayout.tsx` existant (944 lignes) reçoit une **step finale paiement** :

1. Steps existants (Identité → Expérience → Santé → Logistique → Confirmation)
2. **Nouvelle step** : récap + bouton "Payer 100 € via Stripe"
3. Stripe Checkout s'ouvre (modal ou redirect)
4. Webhook crée la `candidature` en statut `RECUE` (avant cette étape, statut `DRAFT` puis cleanup +1h si pas payé)
5. Redirection sur `/merci?candidature=xyz`

### 6.2 Composant `<PlacesRestantes>`

Affiché sur :
- `/sessions` (card session officielle)
- Homepage Hero carousel (sub-text "Plus que X places")
- Footer hover

Subscribe Supabase Realtime. Fallback : poll 60s. Fallback ultime : ISR 5 min.

### 6.3 Page `/session-complete`

Affichée quand 15/15. Le bouton "S'inscrire" du tunnel session est remplacé par un lien vers cette page. Form `/inscription?type=session` redirige aussi.

2 CTA : "Liste d'attente" → `/attente` ou "Camp sur mesure" → `/inscription?type=custom`.

### 6.4 Form `/attente`

Form light : prénom, nom, email, téléphone optionnel, discipline souhaitée. INSERT dans `waitlist`. Email "Tu es inscrit en liste d'attente, position #N".

Si Ruslan invite un candidat de la liste (via dashboard), génération `invitation_token` valable 48h, email avec lien `/inscription?type=session&waitlist_token=xyz` qui court-circuite la vérification "session pleine".

### 6.5 Tunnel groupe/club

Variante du tunnel custom avec étape "Liste des membres" (table dynamique). Frais 100 € × N en une seule transaction Stripe au nom du responsable.

### 6.6 Currency CHF→EUR partout

Fichiers à toucher :

| Fichier | Action |
|---|---|
| `src/data/sessions.ts` | `priceCurrency: 'EUR'`, `price: 2900` reste en valeur |
| `src/components/Sessions.tsx`, `Hero.tsx`, `CTAFinal.tsx`, `Contact.tsx` | Remplacer `15 places` hardcodé par `<PlacesRestantes>` |
| `src/app/(site)/sessions/page.tsx` | SESSIONS local : currency EUR + bouton conditionnel |
| `src/app/(site)/cgv/page.tsx` | Article 3 (Prix) en EUR + nouvel Article frais d'inscription |
| `src/app/(site)/comment-ca-marche/page.tsx` | 6 étapes mises à jour (mention frais) |
| `src/data/faq.ts` | Q/R sur frais d'inscription, devise EUR |
| `src/data/pricing.ts` | À CRÉER, source of truth des tarifs |
| `src/app/layout.tsx` | JSON-LD priceCurrency EUR |
| `src/components/InscriptionLayout.tsx` | Step paiement, états DRAFT/PAID, gestion `?waitlist_token=` |

---

## 7 — Intégrations externes

### 7.1 Stripe — **SUPPRIMÉ (révision 2026-05-04)**

Plus d'intégration Stripe. Tous les paiements passent par virement bancaire ou espèces hors-app. Ruslan envoie le RIB manuellement post-visio. Voir §1.3.

> Section originale (mode payment EUR, webhooks, refund automatique) archivée.

### 7.2 Resend
- Domaine `noreply@mkrcamp.com` (DNS SPF + DKIM + DMARC à configurer)
- Templates @react-email/components
- 8 emails au total (voir 7.4)

### 7.3 PDF facture
- Stack : `@react-pdf/renderer`
- Stockage : Supabase Storage, signed URL valable 30j
- Template 1 page A4 avec logo MKR, infos candidat, montant, RIB Ruslan, référence dossier
- RIB stocké dans `/admin/settings`, pas en dur

### 7.4 Liste des 8 emails

| # | Trigger | Destinataire | Sujet |
|---|---|---|---|
| 1 | RECUE (webhook Stripe) | Candidat | "Ta candidature MKR est reçue" |
| 2 | RECUE | Ruslan | "Nouvelle candidature : {nom}" |
| 3 | RECUE → VALIDEE | Candidat | "Bienvenue ! Voici ta facture pour finaliser" + PDF |
| 4 | RECUE → REFUSEE | Candidat | "On ne peut pas te prendre cette fois + remboursement" |
| 5 | * → ANNULEE | Candidat | "Ton annulation est confirmée" |
| 6 | * → REPORTEE | Candidat | "Ton crédit MKR de 100 € est valable jusqu'au {date}" |
| 7 | VALIDEE → SOLDEE | Candidat | "Virement reçu, prépare-toi pour le {date}" |
| 8 | Cron 7j | Ruslan | "Rappel : N candidatures en attente de visio" |

### 7.5 Cron quotidien (Vercel Cron, 3h UTC)

- Détecte `RECUE` créées il y a +7j → email Ruslan #8
- Détecte `DRAFT` créées il y a +1h → marque `EXPIRED`
- Détecte crédits `expires_at < NOW() + 30 days` → flag dashboard
- Détecte crédits `expires_at < NOW()` → marque `EXPIRED`

---

## 8 — CGV à mettre à jour

### 8.1 Article 3 (Prix)
Mise à jour de la grille tarifaire en EUR.

### 8.2 Nouvel article Frais d'inscription
Inséré avant l'Article 4 (Annulation) actuel :

> **Frais d'inscription** : Toute candidature donne lieu au paiement immédiat de frais d'inscription de 100 €, payables par carte bancaire via notre prestataire Stripe. Ces frais ne sont pas remboursables en cas d'annulation par le candidat. Ils sont déductibles du package final si la candidature est validée et le camp réalisé. En cas de report sur une autre session, les frais sont conservés sous forme de crédit nominatif valable 12 mois et déductibles d'une candidature future. En cas de refus de la candidature par MKR après l'entretien de validation, les frais sont intégralement remboursés sous 14 jours.

### 8.3 Article 4 (Annulation)
Clarifier que les frais d'inscription suivent la règle ci-dessus, indépendamment du barème de remboursement du package complet.

### 8.4 Mentions légales et politique de confidentialité
Ajouter Stripe et Supabase comme sous-traitants RGPD. Mentionner Resend pour les emails.

---

## 9 — Phasage

### Phase 1 — Backend + capture (5-7 jours)
- Setup projet Supabase (DB, Auth, Storage, Realtime)
- Création des 6 tables + vue + RLS
- API routes `/api/inscription/draft` + `/api/stripe/webhook`
- Modification `InscriptionLayout.tsx` (step paiement)
- Resend setup + 2 emails (RECUE candidat + Ruslan)
- Composant `<PlacesRestantes>` (Realtime + fallback)
- Page `/session-complete`
- Form `/attente`
- Currency CHF → EUR partout
- CGV mises à jour

**Livrable** : Le site capte les candidatures avec paiement 100 €. Ruslan voit les candidatures dans le table editor Supabase (pas encore de dashboard custom).

### Phase 2 — Dashboard admin (5-7 jours)
- Auth Supabase (`/admin/login`)
- Layout `/admin` avec onglets
- Home : kanban + sticky alertes
- Cards candidatures (responsive)
- Panel détail (4 onglets)
- 4 boutons d'action → `/api/admin/candidature/[id]/transition`
- Génération PDF facture + upload Supabase Storage
- 6 emails restants (Resend)
- Audit log

**Livrable** : Ruslan peut piloter le pipeline complet depuis téléphone ou desktop.

### Phase 3 — Polish & robustesse (3-5 jours)
- `/admin/credits` (liste actifs/expirés)
- `/admin/waitlist` (invitation par token)
- `/admin/sessions` (gestion capacité, ajout future)
- `/admin/settings` (RIB, infos facturation)
- Vercel Cron (alerte 7j + cleanup DRAFT + expiration crédits)
- Tests E2E des 7 statuts
- Stripe en mode live + déploiement prod
- Doc utilisation pour Ruslan (guide PDF/Notion)

**Livrable** : Système complet en prod, prêt pour trafic réel.

### Phase 4 — Optionnel/futur
- Push web (notifications nouvelles candidatures)
- Export CSV avancé
- Multi-sessions UI
- Dashboard analytics (taux conversion, durée pipeline)
- Multi-langue dashboard (RU si Ruslan préfère)

---

## 10 — Risques et mitigation

| Risque | Impact | Mitigation |
|---|---|---|
| Stripe compte russe/européen Ruslan | Élevé | Vérifier domiciliation juridique avant P1, plan B : compte Stripe France via DKDP |
| Supabase free tier dépassé | Faible | Volume MKR ~50 candidats/an, on est très loin des limites |
| Bug critique pipeline (ex : double consommation place) | Élevé | Locks SQL, tests E2E P3, audit log complet pour debug |
| Webhook Stripe perdu | Moyen | Idempotence, retry Stripe, vérification manuelle dashboard |
| Ruslan oublie un dossier | Moyen | Cron 7j + email rappel quotidien |
| Email Resend bouncing | Faible | DNS SPF/DKIM/DMARC, monitoring dashboard Resend |
| RGPD (données candidats) | Moyen | RLS Postgres, sous-traitance déclarée dans politique de conf |

---

## 11 — Décisions à confirmer avant kickoff Phase 1

| # | Question | Note |
|---|---|---|
| 1 | Compte Stripe : nouveau au nom de Ruslan, ou utiliser un compte DKDP existant ? | Impact juridique |
| 2 | Domaine email d'envoi (`noreply@mkrcamp.com` vs `inscription@`) ? | Préférence Ruslan |
| 3 | RIB de Ruslan disponible immédiatement (pour template PDF) ? | Bloque P2 si non |
| 4 | Logo MKR haute résolution pour PDF facture ? | À récupérer auprès du brand-identity |
| 5 | Stripe Pro (5 USD/mois) pour bypasser les frais 25 cents par dispute ? | À voir au volume |

---

## 12 — Mise à jour SITEMAP.md après implémentation

Ajouter au SITEMAP.md actuel :
- §1 Inventaire : `/admin/*` (5 pages), `/session-complete`, `/attente`, `/api/*` (6 routes)
- §2 Composants : `<PlacesRestantes>`, `<KanbanBoard>`, `<CandidatureCard>`, `<DetailPanel>`, `<StepPaiement>`, `<WaitlistForm>`, etc.
- §3 Data : remplacer `data/sessions.ts` source of truth par Supabase pour les places
- §6bis Propagation Map : ajouter section "Frais d'inscription" et "Paiement Stripe"
- §7 Conventions : ajouter règles sur le statut DRAFT, les transitions, l'audit log
- §8 Workflow : ajouter procédure de rollback si bug critique en prod

---

*Spec généré 2026-05-01 par Claude Opus 4.7. Décisions arbitrées par David Khazaei. Prêt pour invocation writing-plans pour le plan d'implémentation détaillé.*
