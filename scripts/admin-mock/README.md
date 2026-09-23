# Faux backend local pour l'admin MKR

Rend l'admin (`src/app/admin/*`, `src/app/api/admin/*`) exécutable en local sans
toucher la prod : zéro clé réelle, zéro accès réseau externe, zéro email
envoyé. Émule juste assez de Supabase (PostgREST + Storage) et de Resend pour
que `src/lib/supabase-admin.ts` et `src/lib/email.ts` fonctionnent normalement.

## Démarrer

```bash
npm run admin:dev
```

Ouvre <http://localhost:3100/admin/login>, token **`local-admin-token`**.

`dev.mjs` démarre le faux backend sur `127.0.0.1:54321`, attend qu'il réponde,
puis lance `npx next dev -p 3100` avec ces variables (elles **écrasent**
`.env.local` — Next ne remplace jamais une variable déjà définie au démarrage) :

| Variable | Valeur |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `http://127.0.0.1:54321` |
| `SUPABASE_SERVICE_ROLE_KEY` | `mock-service-role` |
| `ADMIN_TOKEN` | `local-admin-token` |
| `RESEND_API_KEY` | `re_mock` |
| `RESEND_BASE_URL` | `http://127.0.0.1:54321/resend` |
| `SLACK_WEBHOOK_URL` | *(vide)* |
| `CAL_WEBHOOK_SECRET` | `mock-cal-secret` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3100` |
| `CAL_API_KEY` | *(vide)* |
| `CRON_SECRET` | *(vide)* |

Ctrl+C arrête les deux process. `dev.mjs` refuse de démarrer si le port 3100
ou 54321 est déjà pris (message avec la commande `lsof` pour trouver le
coupable) — **Next 16 refuse un second `next dev` sur le même dossier**, et
`next build` ne doit jamais tourner pendant qu'un `next dev` est up.

## Vérifier (`smoke.mjs`)

```bash
node scripts/admin-mock/smoke.mjs
```

Se connecte (`POST /api/admin/login`), suit le 303, garde le cookie
`mkr_admin`, puis vérifie 5 pages (code de sortie 1 au premier échec) :

1. `/admin/inscriptions` — 200, contient un nom fictif (« Lucas »)
2. `/admin/inscriptions/00000000-0000-4000-8000-000000000001` — 200, idem
3. `/admin/referrals` — 200, contient « 6 candidature » (6 dossiers avec un
   code referral dans `fixtures.mts` — cette page agrège par *partenaire*,
   elle n'affiche jamais de nom de candidat)
4. `/admin/guide-leads` — 200, contient `lead1@example.com`
5. `/admin/inscriptions/00000000-0000-4000-8000-00000000ffff` — affiche
   « Dossier introuvable » (vraie 404 Next, le status n'est pas vérifié)

`SMOKE OK (5/5)` = tout est vert. Le journal du mock (terminal où tourne
`dev.mjs`) doit ne montrer aucun `-> 400` : ça prouverait qu'une page de
l'admin sélectionne une colonne qui n'existe pas dans le schéma ci-dessous.

## Fichiers

| Fichier | Rôle |
|---|---|
| `fixtures.mts` | Jeu de données déterministe (`buildFixtures(now)`). Lancé en sous-processus par `server.mjs`, ou directement en CLI : `node --experimental-strip-types --import ./scripts/_alias-hook.mjs scripts/admin-mock/fixtures.mts --json` |
| `server.mjs` | Serveur Node pur (aucune dépendance) : PostgREST-lite + Storage-lite + Resend-lite, tout en mémoire |
| `dev.mjs` | Démarre `server.mjs` puis `next dev -p 3100` avec les bonnes variables |
| `smoke.mjs` | Vérifie l'admin actuel contre le mock (voir ci-dessus) |

## Ce que `server.mjs` émule

Comportement calqué sur le client **réellement installé**
(`@supabase/postgrest-js` et `@supabase/storage-js` 2.105.1, lus dans
`node_modules` avant d'écrire ce fichier), pas sur la doc PostgREST générale.
Deux pièges qui ont guidé le design :

- **`.maybeSingle()` n'envoie PAS `Accept: vnd.pgrst.object+json`** dans cette
  version du client (fix de supabase/postgrest-js#361) : il récupère un
  tableau et le dépouille lui-même côté client. Seul **`.single()`** envoie
  cet `Accept` — c'est le seul cas où le serveur doit répondre 406/`PGRST116`
  sur 0 ou plusieurs lignes.
- **`select` arrive déjà sans espaces** : le client les retire avant d'envoyer
  (`PostgrestQueryBuilder.select()`). Le parseur du serveur n'a donc pas à
  gérer les espaces dans `select=id,status,candidate:candidates(prenom)`.

### `GET|HEAD /rest/v1/<table>`

- `select` : colonnes, `*`, alias (`alias:colonne`), et l'embarquement
  `candidate:candidates(...)` (avec ou sans le hint `!candidate_id`) — c'est
  la **seule** relation embarquée utilisée par l'admin, résolue « en dur » via
  `candidatures.candidate_id = candidates.id`.
- Filtres : `eq, neq, in.(...), is.null/true/false, not.<op>, gt, gte, lt,
  lte, ilike` (`%`/`_` joker, insensible à la casse).
- `order=col.asc|desc[.nullsfirst|nullslast]`, plusieurs colonnes séparées
  par virgule ; `limit` ; `offset`.
- Colonne inconnue (`select` ou filtre) → 400 `{ code: '42703', message:
  'column <table>.<col> does not exist' }`, comme un vrai PostgREST.
- `Prefer: count=exact` → `Content-Range: <from>-<to>/<total>` (ou
  `*/<total>` si la page est vide) ; `total` = lignes filtrées, avant
  pagination.

### `POST|PATCH|DELETE /rest/v1/<table>`

- `POST` : objet ou tableau. `id` généré si absent (UUID, sauf `audit_log`
  qui a un `id` bigint auto-incrémenté). Toute colonne du schéma non fournie
  est stockée à `null` (comme une vraie table Postgres — une colonne n'est
  jamais « absente » d'une ligne).
- `PATCH`/`DELETE` : mêmes filtres que le `GET`. `DELETE candidatures`
  supprime en cascade son `audit_log`.
- `Prefer: return=representation` → renvoie les lignes (respecte `select` et
  `Accept` objet) ; sinon 201 (POST) ou 204 (PATCH/DELETE) sans corps.

### `POST /rest/v1/rpc/next_contract_number`

Entier croissant à partir de 20, remis à 20 par `/__reset`.

### Storage (bucket `contracts` uniquement — le seul utilisé par le code)

- `POST|PUT /storage/v1/object/contracts/<path>` stocke les octets bruts en
  mémoire.
- `POST /storage/v1/object/sign/contracts/<path>` → `{ signedURL:
  '/object/sign/contracts/<path>?token=mock' }` (forme exacte attendue par
  `@supabase/storage-js`, qui préfixe lui-même avec l'URL du bucket).
- `GET /storage/v1/object/sign/contracts/<path>` sert le PDF stocké (peu
  importe la query string `?token=...`).

### Resend

`POST /resend/emails` (⚠️ le SDK Resend lit `RESEND_BASE_URL` **une seule
fois, au chargement du module** — c'est pour ça que `dev.mjs` doit injecter la
variable *avant* que `next dev` démarre, pas après). Enregistre `{ to,
subject, bcc, tags, attachmentsCount, at }`, répond `{ id: 'mock_<n>' }`.
Zéro email réel n'est jamais envoyé.

### Contrôle

- `POST /__reset` — recharge les fixtures avec un `now` frais (vide aussi le
  storage, les emails et remet le compteur de contrat à 20).
- `GET /__emails` — liste des emails « envoyés » (pour vérifier un flux sans
  ouvrir une vraie boîte).
- `GET /__state` — compte des lignes par table (sert de sonde de disponibilité
  à `dev.mjs`).

Journal : une ligne par requête sur stdout, `METHODE chemin -> status`.

## `fixtures.mts` — jeu de données

Déterministe par rapport à `now` (aucun `Math.random()`, aucune date figée) :
relancer avec le même `now` (donc : au même instant) produit exactement le
même jeu. `/__reset` relance avec un `now` frais, donc les dossiers « visio
dans 2h » etc. restent d'actualité même après plusieurs jours le process
tournant.

Sessions et codes referral viennent de `@/data/sessions` et
`@/data/referral-codes` (mêmes sources que l'app réelle) — jamais de session
ou de code inventé qui n'existerait pas vraiment côté admin.

60 candidatures (`id` = `00000000-0000-4000-8000-0000000000NN`, `NN` de `01` à
`3c`), 59 candidats (un doublon volontaire, voir dossiers 30/33 ci-dessous),
~190 entrées d'audit (au moins un exemple de chaque type d'événement connu),
6 leads guide. Détail dossier par dossier : voir `task-1-report.md`.

## Limites connues

- Le PDF de contrat référencé par `contract_pdf_path` sur les dossiers
  « contrat envoyé » des fixtures **n'existe pas réellement** dans le storage
  en mémoire tant qu'un vrai envoi n'a pas eu lieu dans la session en cours
  (le storage est vide au démarrage, seul son *chemin* est pré-rempli pour
  que l'UI affiche le lien). Cliquer « Télécharger le contrat » sur un
  dossier fixture avant de l'avoir renvoyé donne un 404 — cliquer « Envoyer
  le contrat » régénère le PDF et corrige `contract_pdf_path` normalement.
- Auth : ce serveur ne vérifie ni `apikey` ni `Authorization` — la protection
  admin réelle (cookie `mkr_admin` == `ADMIN_TOKEN`) vit entièrement dans
  `src/proxy.ts`, en dehors de ce mock.
