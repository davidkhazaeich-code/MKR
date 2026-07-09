# PLAN — Automatisation email MKR (rappels, automatisations, newsletter)

> Statut : **S1 + S2 + S3 (A2+A3) + C0 DÉPLOYÉS EN PROD le 2026-07-09** · relances candidat en dry-run (`EMAIL_AUTOMATION_ENABLED=false`), testées end-to-end en réel sur candidatures de test (paiement palier 1 + pré-départ, verrous et priorité 1 email/candidat/run validés, données test nettoyées).
> ⚠️ Correction pass implémentation : le « kill-switch sans deploy » était FAUX — sur Vercel une env var ne s'applique qu'au deploy suivant. Rollback réel = flip + redeploy API (~1 min).
> Emails : layout partagé `email-layout.ts`, VRAIES photos (galerie-real) exigées par David, templates paiement (2 paliers) + pré-départ (checklist) + guide. Prochaine fenêtre réelle : 2 impayés entrent en palier 1 le 14.07.
> Historique : **S1 + S2 + C0 DÉPLOYÉS EN PROD le 2026-07-09** (commits `532af6e`, `778138a`, `4862595`) — relances candidat en **dry-run** (`EMAIL_AUTOMATION_ENABLED=false`), à activer après observation des logs (protocole §5).
> Fait : cron quotidien 09h00 CH + digest (fallback email → contact@mkrcamp.com, Slack jamais configuré), webhook Cal créé et actif via API (id `7725f137`, compte Ruslan), C0 testé bout en bout, migration colonnes appliquée. Reste : A2/A3/B3 (S3-S4), IBAN, SPF Google, opt-in newsletter.
> Découvertes en implémentation : `SLACK_WEBHOOK_URL` jamais posée (digest par email en attendant) ; bug historique route guide (`Promise.all` non await → notifs jamais parties, corrigé via `after()`) ; API Cal v1 décommissionnée (v2 utilisée).
> Créé le 2026-07-09. Fondation : bascule expéditeur `contact@mkrcamp.com` via compte Resend MKR dédié (domaine vérifié, DKIM/DMARC alignés) faite le même jour. Chaque pass est tracée en §8.

## 0 — Résumé exécutif

Trois blocs. L'audit chiffré (pass 4) a inversé les priorités initiales :

1. **Bloc B — Automatisations internes d'abord** : les chiffres réels montrent que la fuite n°1 est INTERNE — 8 `validee`, dont 6 sans contrat émis, 0 payée ; 10 `recue` (la plus ancienne du 31 mai) et 1 seule relance visio manuelle en tout. Le bouton existe, il n'est pas utilisé. Le digest quotidien Slack (B1) attaque ça en ½ journée, zéro risque candidat.
2. **Bloc A — Rappels automatiques candidat** : relance visio (l'humain ne relance pas → automatiser), rappel paiement (dès IBAN + deadlines posées), infos pré-départ (aucune cible avant le 1er `soldee`).
3. **Bloc C — Newsletter** : volume actuel 3 guide_leads → quasi nul. C0 (email « ton guide ») vaut le coup tout de suite ; C1-C3 au déclencheur d'audience, pas avant.

## 1 — Ce qui existe déjà (ground truth vérifié)

- **Envoi** : `src/lib/email.ts` (Resend, compte MKR, from `contact@mkrcamp.com`, tags analytics, fire-and-forget, no-op sans clé).
- **Emails candidat existants** : confirmation visio au submit (`notifyCandidate`), relance visio **manuelle** (bouton back office, `visio_reminder_sent_at` + `visio_reminder_count` + `audit_log`), contrat PDF (`contract_sent_at/count`), image souvenir **à la validation** (`souvenir_sent_at`, part à la transition `recue→validee` — PAS un email post-camp).
- **Les `guide_leads` n'ont jamais reçu d'email** : le guide est servi en download direct sur la page (`downloadUrl`), seul un mail interne part à Ruslan. Premier contact email = à construire (voir C0).
- **Données** : `candidatures.status` enum (`draft, recue, validee, refusee, soldee, camp_fait, annulee, reportee, expired`), `contract_payment_deadline`, `package_paid_at`, `payment_method` (`virement|cash|autre`), `contract_start_date/end_date`, `cancel_token`, `submission_language` (fr/en), `group_members` jsonb (tunnel groupe).
- **Manque critique** : la réservation Cal.com n'est PAS trackée en base (pas de webhook). Ruslan la voit dans Cal uniquement. Toute automatisation de relance visio « aveugle » risque de relancer un candidat qui a déjà réservé.
- **Infra** : Vercel **Pro** (crons OK), Resend MKR **free** (100 emails/jour, 3 000/mois, 1 audience / 1 000 contacts Broadcasts), Slack webhook interne câblé, `audit_log` en place, `ADMIN_TOKEN` pour les routes admin.

## 2 — Bloc A : rappels automatiques candidat

### A1 — Relance visio automatique
- **Cible** : `status='recue'` ET pas de visio réservée ET `created_at` > 72 h ET `visio_reminder_count < 2` (relance 1 : count=0 ; relance 2 : count=1 ET dernier envoi > 96 h).
- **Prérequis** : B2 (webhook Cal → colonne `visio_booked_at`). Sans lui, pas d'automatisation fiable.
- **Cadence** : 1 relance auto à J+3, une seconde à J+7 (cap à 2 auto). Le bouton manuel du back office reste pour les cas humains.
- **Template** : réutiliser `visio-email.ts` variante `reminder` (déjà bilingue FR/EN) — zéro nouveau template. Elle inclut déjà le lien « abandonner ma place » (`cancel_token`) : porte de sortie légalement propre, le candidat relancé peut se retirer en un clic.
- **Idempotence** : `visio_reminder_sent_at` + `visio_reminder_count` (existants) + `audit_log` acteur `system-cron`. L'update conditionnel (`WHERE visio_reminder_count = 0 RETURNING`) neutralise la course cron vs bouton manuel : si Ruslan a relancé à 08h59, le cron de 09h00 ne double pas. La relance 2 exige `visio_reminder_sent_at < now() - 96h`, donc une relance manuelle récente décale l'auto.
- **Stock existant (piège majeur)** : au déploiement, `visio_booked_at` sera NULL pour TOUTES les candidatures, y compris celles qui ont déjà réservé/fait leur visio → relance massive à tort. Règle : **A1 ne cible que les candidatures créées après le déploiement de B2** (cutoff `created_at`). Le stock ancien (10 `recue`) se traite en une passe manuelle avec Ruslan (sa liste Cal fait foi) via le bouton existant, ou un backfill `visio_booked_at` en SQL.

### A2 — Rappel paiement (le levier cash)
- **Cible** : `status='validee'` ET `contract_sent_at IS NOT NULL` ET `package_paid_at IS NULL` ET `contract_payment_deadline IS NOT NULL` (deadline absente → pas d'invention de date : remonter le dossier dans le digest B1 « contrat sans deadline »).
- **Cadence en paliers avec rattrapage** (résiste à un cron raté, pas d'égalité stricte de date) :
  - Palier 1 : deadline ≤ J+7 ET `payment_reminder_count = 0` → rappel courtois.
  - Palier 2 : deadline ≤ J+1 ET `count ≤ 1` ET dernier envoi > 72 h → rappel ferme.
  - Palier 3 : deadline dépassée de 3 j → notification interne Slack/Ruslan (pas de 3e mail candidat — escalade humaine).
- Les dates sont des `date` sans heure → tous les calculs en `Europe/Zurich`, jamais UTC brut.
- Re-check du status DANS l'update conditionnel (`WHERE status='validee' AND package_paid_at IS NULL`) : un dossier annulé/soldé entre sélection et envoi ne reçoit rien.
- **Garde-fou `payment_method`** : si `cash` convenu (paiement à l'arrivée), NE PAS relancer le virement. Exclure `payment_method='cash'`.
- **Nouveau** : colonnes `payment_reminder_sent_at`, `payment_reminder_count` + template bilingue « rappel échéance » (ton warm mais ferme, montant + deadline + renvoi au contrat PDF déjà reçu, reply-to contact@).
- **⚠️ Dépendance dure** : l'IBAN Ruslan n'est PAS renseigné dans `src/data/contract.ts` (warning connu). Le renseigner AVANT d'activer A2 — un rappel de paiement sans coordonnées bancaires valides est contre-productif. Mitigation template : renvoyer au contrat joint/reçu plutôt que de dupliquer l'IBAN dans l'email.

### A3 — Infos pratiques pré-départ
- **Cible** : `status='soldee'` ET `contract_start_date` à J-14.
- **Contenu** : checklist (passeport/visa, équipement, vol, contact WhatsApp sur place). Nouveau template bilingue.
- **Nouveau** : `predeparture_sent_at`.

### A4 — Post-camp : n'existe pas encore, reste hors scope
- Correction pass 1 : le « souvenir » actuel part à la **validation**, il n'y a AUCUN email post-camp aujourd'hui. Un email « merci / avis Google / partage vidéo » à `camp_fait` est une bonne idée future, mais geste humain (photos personnalisées) → manuel, hors scope automatisation.

## 3 — Bloc B : automatisations internes

### B2 (prérequis A1) — Webhook Cal.com → `visio_booked_at`
- Le Cal est le compte perso de Ruslan (`cal.com/ruslan-mukhtarov-mkr/15min`) → **le webhook se configure dans SON compte** (Settings → Developer → Webhooks, dispo aussi en plan free). Dépendance : accès au compte ou 10 min avec Ruslan.
- Route `POST /api/webhooks/cal` protégée par le secret Cal (vérification signature `x-cal-signature-256`), events : `BOOKING_CREATED` → set `visio_booked_at` ; `BOOKING_CANCELLED` → remettre à NULL (le candidat redevient relançable) ; `BOOKING_RESCHEDULED` → no-op sur le flag (toujours réservé), juste refresh du timestamp.
- Matching par email attendee (lowercase/trim) → candidature `recue` la plus récente du candidat. Email inconnu → log + notif Slack, ne pas planter.
- Bonus : notif Slack « X a réservé sa visio 🗓️ » + badge dans le dashboard admin.

### B1 — Digest quotidien interne (Slack, pas email)
- Le matin : candidatures `recue` sans visio > 72 h, contrats envoyés impayés (tri par deadline), candidatures `validee` sans contrat envoyé > 48 h, contrats sans deadline, compteur places session.
- Slack déjà câblé → zéro fatigue inbox.
- **Heartbeat (pass 5)** : le digest envoie TOUJOURS un message, même « ✅ RAS — n dossiers actifs ». Un silence total serait ambigu (rien à dire ou cron mort ?) — le digest quotidien devient le monitoring gratuit de toute la chaîne cron : pas de message un matin = quelque chose est cassé, et Ruslan/David le remarquent naturellement.

### B3 — Expiration automatique des dossiers morts
- `status='recue'` > 21 jours malgré 2 relances **ET `visio_booked_at IS NULL`** → `status='expired'` (enum existant) + libération de place + notif Slack.
- Garde-fou clé (pass 2) : un candidat qui a réservé ou FAIT sa visio mais attend la décision MKR reste `recue` — l'inaction est côté MKR, jamais expirer ce dossier.
- Note pass 1 : `expired` n'existe PAS dans la map de transitions admin (`admin-transitions.ts`) → transition **system** directe (service role + `audit_log` acteur `system-cron`), et ajouter `expired` à l'UI admin (label + éventuel retour arrière `expired→recue` si le candidat se réveille).
- **Décision David/Ruslan requise** : délai exact et si un email « dernière chance à J+14 » précède l'expiration.

## 4 — Bloc C : newsletter

### C0 (ajout pass 1) — Email « ton guide » aux leads
- Aujourd'hui un lead guide télécharge le PDF et ne reçoit RIEN. Ajouter un envoi automatique immédiat : « Ton guide du Caucase » (lien PDF + 2-3 conseils + CTA candidature), bilingue, tag `guide-caucase`.
- Double bénéfice : le lead garde le guide dans sa boîte (le download direct se perd), et l'email établit la relation d'envoi AVANT toute newsletter. C'est du transactionnel (il l'a demandé) → pas de consentement additionnel requis pour CET email.
- **Limite stricte (pass 3)** : C0 = UN email, point. Une séquence nurture (J+3, J+7…) serait du marketing de masse au sens LCD → interdite sans l'opt-in C1. Ne pas glisser.

### C1 — Base légale d'abord (LCD art. 3 al. 1 let. o + nLPD)
- `guide_leads` n'a PAS de consentement newsletter explicite (lead magnet ≠ opt-in newsletter). Ajouter une checkbox opt-in au form guide (+ champ `newsletter_consent boolean` + `consented_at`).
- Anciens candidats/clients : relation existante = exception LCD défendable pour contenus liés au camp, mais opt-out obligatoire.
- Désabonnement : lien Resend natif (`{{{RESEND_UNSUBSCRIBE_URL}}}`, header List-Unsubscribe géré) + backfeed du statut en base.
- **Privacy policy** : la page `politique-de-confidentialite` existe → la mettre à jour au lancement de C1 (finalité newsletter, données collectées par le form guide : email, locale, utm, ip, user-agent).
- Les rappels A1-A3 sont transactionnels (exécution de la candidature) : pas d'opt-in marketing requis, et la porte de sortie existe (lien abandon + reply-to humain).

### C2 — Sync audience
- Cron ou trigger : push contacts consentants (guide_leads opt-in + candidates non désabonnés) vers l'Audience Resend (API contacts), segmentation par `locale` (fr/en).

### C3 — Envoi
- Broadcasts rédigés dans le dashboard Resend (David/Romane), 1×/mois max, bilingue = 2 broadcasts segmentés.
- Plafond free 1 000 contacts : marge ×47 au volume actuel. Upgrade 20 $/mois seulement si dépassement.
- **Règle de bascule sous-domaine (pass 3)** : tant que l'audience < 500, broadcasts depuis `contact@mkrcamp.com` (simple, volume anecdotique). Au-delà, migrer le marketing sur `news.mkrcamp.com` (domaine Resend séparé) pour isoler la réputation du flux transactionnel — les contrats et rappels paiement ne doivent JAMAIS pâtir d'une newsletter.

### Hygiène DNS complémentaire (pass 3, indépendant du code)
- Le SPF apex (`v=spf1 include:spf.infomaniak.ch -all`) n'inclut PAS Google alors que Ruslan écrit depuis Gmail/Workspace : ses envois humains passent DMARC uniquement grâce au DKIM Google (un seul pilier). Ajouter `include:_spf.google.com` chez Infomaniak = 1 ligne, robustesse doublée.
- DMARC actuel `p=reject` sans reporting → optionnel : ajouter `rua=mailto:contact@mkrcamp.com` (ou un service gratuit type dmarc.postmarkapp.com) pour voir qui échoue. Nice-to-have.

## 5 — Design technique transversal

- **Un seul cron quotidien** `GET /api/cron/daily-emails` (Vercel cron, `0 7 * * *` UTC = 09:00 CH été), protégé par `CRON_SECRET` (header auto Vercel).
- Séquence dans le cron : A1 → A2 → A3 → B1 (digest reprend ce qui vient d'être fait) → B3.
- **Garde-fous globaux** :
  - `EMAIL_AUTOMATION_ENABLED` env var = kill-switch instantané sans deploy (env var editable dans Vercel, effet au run suivant).
  - `DRY_RUN` : log ce qui serait envoyé sans envoyer. **Les previews Vercel partagent la DB de prod** → la route cron refuse d'envoyer si `VERCEL_ENV !== 'production'` (dry-run forcé), en plus du `CRON_SECRET`.
  - Cap : max 20 emails/run (volume normal ≈ 0-3). Si cap atteint : tri par urgence (deadlines d'abord) + warning Slack.
  - Chaque envoi : update conditionnel AVANT envoi (`UPDATE ... WHERE <état attendu> RETURNING`) pour verrouiller contre le double envoi (cron doublé, course avec action manuelle), puis `audit_log`.
  - Un même candidat ne reçoit qu'UN email par run (si plusieurs règles matchent, priorité paiement > visio > pré-départ).
  - Tag Resend par type (`visio-reminder-auto`, `payment-reminder`, `predeparture`) pour le suivi.
- **Timezone** : les dates (`contract_payment_deadline`, `contract_start_date`) sont des `date` → comparer en Europe/Zurich, pas UTC.
- **Bounces** : hors scope MVP (volume minuscule, `last_event` visible dans le dashboard Resend). Webhook Resend `email.bounced` = amélioration future si le volume monte.
- **`export const maxDuration = 60`** sur la route cron (défaut Pro 15 s ; 20 envois séquentiels + latence Resend ≈ 10-15 s → marge).
- **Nouvelles env vars** (à ajouter dans Vercel + `.env.local` + `docs/SECURITY-FORMS-SETUP.md`) : `CRON_SECRET`, `CAL_WEBHOOK_SECRET`, `EMAIL_AUTOMATION_ENABLED` (défaut `false`).
- **Testabilité** : extraire chaque sélecteur de ciblage en fonction pure (input : rows + date du jour → output : liste d'actions) et les tester unitairement avec des fixtures — c'est LE code critique. L'envoi lui-même se valide en dry-run puis sur une candidature de test (email David) en prod.

### Protocole d'activation (chaque feature, pass 5)
1. Deploy avec `EMAIL_AUTOMATION_ENABLED=false` (le cron tourne en dry-run et logge ses cibles).
2. Lecture des logs dry-run pendant 2-3 jours (ou run manuel `curl` avec le secret) → la liste des cibles est-elle exactement celle attendue ?
3. Validation David sur la liste réelle → flip `EMAIL_AUTOMATION_ENABLED=true`.
4. Rollback à tout moment = re-flip la var (effet au run suivant, sans deploy).

### Runbook incidents (pass 5)
- **Envois anormaux / boucle** : kill-switch OFF → `audit_log` (acteur `system-cron`) pour identifier quoi/qui → fix → redry-run avant réactivation.
- **Digest absent un matin** : vérifier Vercel → Crons (dernier run, status), puis logs de la fonction. Re-trigger manuel possible par curl.
- **Candidat relancé à tort** : vérifier `visio_booked_at` + `audit_log` du dossier ; cause probable = webhook Cal raté (email différent entre Cal et candidature) → corriger le matching, poser `visio_booked_at` à la main, répondre humainement au candidat.

## 6 — Séquencement (révisé pass 4 sur données réelles)

| Sprint | Contenu | Effort | Justification chiffrée |
|---|---|---|---|
| S1 — Voir les trous | B1 digest Slack quotidien (validée sans contrat, contrat sans deadline, reçue sans visio, impayés) + hygiène SPF Google chez Infomaniak | ~½ j | Révèle dès le 1er run les 6 contrats non émis et les 5 deadlines manquantes. Zéro risque candidat, zéro nouveau template |
| S2 — Arrêter la fuite visio | B2 webhook Cal + `visio_booked_at` + badge ; A1 relance auto (cutoff) ; cron + garde-fous ; passe manuelle avec Ruslan sur le stock (10 `recue`, 1 seule relancée) | ~1 j | 10 dossiers dorment, le bouton manuel n'est pas utilisé — l'automatisation compense un process humain défaillant, prouvé par les données |
| S3 — Encaisser | A2 rappels paiement (précondition : IBAN renseigné + deadlines posées — le digest S1 aura déjà poussé à les poser) + C0 email guide | ~½-1 j | 8 dossiers validés, 0 € encaissé. Le levier cash direct |
| S4 — Au déclencheur (pas daté) | A3 pré-départ (dès le 1er `soldee`) ; B3 expiration (après arbitrage Ruslan) ; C1-C3 newsletter (dès audience > 50) | ~1 j cumulé | Aucune cible aujourd'hui pour ces trois-là — les construire maintenant serait de l'effort sans destinataire |

## 7 — Risques & questions ouvertes

1. ~~Tunnel `groupe` : qui reçoit ?~~ **Résolu pass 1** : seul le référent a un email en base (`candidates`) — les rappels vont au référent par construction. `group_members` (jsonb) n'a pas d'emails exploitables.
2. B3 expiration : délai et email « dernière chance » à valider par Ruslan/David.
3. Multi-candidatures même candidat : cibler uniquement la plus récente active.
4. BCC contrats (From = BCC = contact@) : comportement Gmail à vérifier au prochain envoi réel.
5. Cal.com : webhook à configurer dans le compte Ruslan (`ruslan-mukhtarov-mkr`) — besoin d'accès ou d'un créneau avec lui.
6. IBAN Ruslan manquant dans `src/data/contract.ts` → bloque l'activation de A2.

## 8 — Changelog de la boucle améliorative

- **v0 (2026-07-09)** : draft initial post ground-truth (schéma Supabase, code email, volumes réels, plan Vercel/Resend).
- **v1 (pass 1 — exactitude technique, vérifiée contre le code)** : souvenir = image à la VALIDATION et non post-camp (A4 réécrit) ; guide_leads ne reçoivent aucun email → ajout C0 « email ton guide » ; dépendance IBAN manquant sur A2 ; webhook Cal = compte perso Ruslan + vérif signature ; `expired` absent des transitions admin → transition system + UI à compléter ; question groupe résolue (référent seul en base).
- **v2 (pass 2 — cas limites & idempotence)** : cutoff `created_at` pour A1 (le stock pré-webhook ne doit pas être relancé en masse) + backfill manuel du stock ; paliers de rappel paiement avec rattrapage (résiste à un cron raté) au lieu d'égalités de dates ; deadline NULL → digest, pas d'invention ; B3 n'expire jamais un dossier avec visio réservée/faite ; `BOOKING_RESCHEDULED` ≠ cancel ; previews Vercel = dry-run forcé (DB de prod partagée) ; 1 email max par candidat par run avec ordre de priorité ; courses cron/manuel neutralisées par updates conditionnels.
- **v3 (pass 3 — légal & délivrabilité)** : lien « abandonner ma place » déjà dans le template reminder = porte de sortie native ; C0 verrouillé à UN email (pas de drip sans opt-in, LCD) ; privacy policy existante à amender au lancement newsletter ; règle chiffrée de bascule sous-domaine news. (>500 contacts) pour isoler la réputation transactionnelle ; hygiène DNS : SPF apex sans Google détecté (envois humains sur un seul pilier DKIM) → `include:_spf.google.com` recommandé + DMARC rua optionnel.
- **v4 (pass 4 — valeur/effort & séquencement, sur données SQL réelles)** : audit chiffré du pipeline → 6/8 validées sans contrat émis, 5/8 sans deadline, 0 payée, 1 relance visio manuelle sur 10 reçues (bouton non utilisé). Priorités inversées : B1 digest en premier (révèle les trous internes, ½ j, zéro risque), A1 en S2 avec traitement du stock, A2 en S3 (précondition IBAN + deadlines), A3/B3/C1-C3 déplacés « au déclencheur » (aucune cible actuelle = effort sans destinataire). Effort total build ~2-2,5 j étalés.
- **v5 (pass 5 — opérabilité production)** : digest = heartbeat (toujours envoyer, silence → alerte naturelle) ; protocole d'activation en 4 étapes (deploy OFF → dry-run observé 2-3 j → validation David → flip) avec rollback sans deploy ; runbook 3 incidents ; `maxDuration=60` ; tableau des nouvelles env vars ; sélecteurs de ciblage extraits en fonctions pures testables (le code critique), envoi validé par candidature de test en prod.

> **Boucle terminée (5/5). Le plan est prêt pour arbitrage.** Décisions restantes pour David/Ruslan : §7 (délai expiration B3, accès Cal Ruslan, IBAN) puis go S1.
