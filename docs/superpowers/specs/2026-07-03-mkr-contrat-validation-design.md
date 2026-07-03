# Contrat de participation — génération + envoi depuis le dashboard admin

Date : 2026-07-03
Projet : MKR Caucasian Camp (Next.js 16 / Turbopack, App Router, admin FR-only)
Statut : validé, implémentation dans la foulée

## Objectif

Après validation d'une candidature (`status = validee`), Ruslan doit pouvoir
générer, prévisualiser et envoyer **le contrat de participation PDF** au candidat
directement depuis `/admin/inscriptions/[id]`, sans quitter le dashboard. Le
contrat contient : parties, séjour (dates, durée, discipline), prestations
incluses / non incluses, montant + RIB + échéance de paiement, grille
d'annulation, renvoi CGV. L'email part au candidat avec le PDF en pièce jointe,
copie exacte à `contact@mkrcamp.com` (bcc), copie du PDF archivée dans un bucket
Storage privé.

## Décisions structurantes

1. **Langue du contrat** : PDF + email générés dans **une** langue (`fr` | `en`),
   choisie dans la carte admin, pré-remplie depuis `submission_language` de la
   candidature. Le contenu FR/EN vit inline dans `src/data/contract.ts` (pas dans
   `messages/**` → parité i18n-check intacte, l'admin reste FR).
2. **Numéro de contrat** : séquence Postgres `contract_number_seq` + colonne
   `contract_number int unique`, attribuée **au premier enregistrement de champs
   contrat** (PATCH). Format d'affichage `MKR-YYYY-XXXX` (année d'émission,
   padding 4). Les trous de séquence sont acceptés (ce n'est pas une facture).
3. **Acceptation** : pas d'e-signature en v1. Clause « le règlement vaut
   acceptation du contrat et des CGV » + bloc signatures optionnel (Organisateur
   pré-rempli, Participant libre). Mineurs : clause représentant légal (tunnel
   famille).
4. **Fonts + logo dans le PDF** : réutilisation du pattern OG éprouvé en prod
   (`fs.readFile(process.cwd()/public/...)`) : `public/og-fonts/Teko-Bold.ttf`
   (titres), `Barlow-Medium.ttf` (corps) + `public/logo-dark.png`. Fallback
   Helvetica si lecture impossible (jamais de crash). `outputFileTracingIncludes`
   ajouté dans `next.config.ts` pour les routes contrat (ceinture + bretelles).
5. **@react-pdf/renderer v4** en `serverExternalPackages` (Turbopack ne le bundle
   pas côté serveur). Spike build avant câblage complet. Plan B : `pdf-lib`
   (interface `buildContractPdf(data, opts) → Buffer` isolée pour pivoter à coût
   contenu).
6. **RIB** : constante dans `src/data/contract.ts` (titulaire Ruslan Mukhtarov,
   BIC REVOFRP2). ⚠️ IBAN complet à renseigner (placeholder au moment de ce
   commit) : **garde-fou serveur** — l'envoi est refusé tant que l'IBAN est un
   placeholder ; l'aperçu affiche un bandeau rouge.
7. **Aperçu ≠ envoi** : `GET …/contract/preview` rend le PDF inline (nouvel
   onglet) avec filigrane « APERÇU », ne stocke rien, n'incrémente rien. La copie
   légale est celle générée par `POST …/contract/send` (sans filigrane), uploadée
   dans le bucket **avant** l'envoi email, versionnée `-vN`.
8. **Save-then-preview** : la carte admin enregistre (PATCH) puis ouvre l'aperçu —
   l'aperçu reflète toujours l'état persisté, jamais un brouillon.
9. **Renvoi** : bouton « Renvoyer » après premier envoi ; `contract_sent_count++`,
   nouveau fichier `-vN`, `contract_pdf_path` pointe la dernière version.
   L'historique complet vit dans `audit_log` (`contract_sent`).

## Modèle de données (migration `add_contract_fields`)

Sur `candidatures` :

| Colonne | Type | Note |
|---|---|---|
| `contract_start_date` | date | pré-rempli session/`date_debut_souhaitee` |
| `contract_end_date` | date | pré-rempli start + semaines×7 |
| `contract_duration_weeks` | int check 1..12 | pré-rempli `duree_semaines` |
| `contract_inclusions` | text | 1 item / ligne, défaut = CGV art. 5 (locale) |
| `contract_exclusions` | text | 1 item / ligne, défaut = CGV art. 6 (locale) |
| `contract_note` | text | optionnel, bloc « Conditions particulières » |
| `contract_payment_deadline` | date | ≤ start date (garde serveur) |
| `contract_locale` | text check fr/en | défaut effectif = `submission_language` |
| `contract_number` | int unique | via `contract_number_seq`, lazy |
| `contract_sent_at` | timestamptz | dernier envoi |
| `contract_sent_count` | int not null default 0 | |
| `contract_pdf_path` | text | chemin Storage de la dernière version envoyée |

Bucket Storage **privé** `contracts`, chemin `{candidature_id}/MKR-YYYY-XXXX-vN.pdf`.
Accès uniquement service-role (aucune policy publique).

## Fichiers

| Fichier | Nature |
|---|---|
| `src/data/contract.ts` | Source unique contenu : partie MKR, RIB, inclusions/exclusions FR+EN (miroir CGV art. 5/6), textes paiement/annulation/acceptation, labels discipline, `formatContractNumber`, formatage dates/montants |
| `src/lib/contract-pdf.tsx` | `buildContractPdf(data, { preview }) → Buffer` — layout A4, fonts brand, filigrane aperçu |
| `src/lib/contract-service.ts` | `loadContractContext(id)` (row + candidate + data + blockers), builder email HTML FR/EN, upload Storage |
| `src/lib/email.ts` | + `attachments?: [{filename, content}]`, + tag `'contract'` |
| `src/app/api/admin/candidature/[id]/route.ts` | PATCH étendu : champs contrat + validation + attribution `contract_number` + audit `contract_fields_update` |
| `…/contract/preview/route.ts` | GET → PDF inline (filigrane) |
| `…/contract/send/route.ts` | POST → PDF → Storage → email (pj + bcc contact@) → update + audit `contract_sent` |
| `…/contract/file/route.ts` | GET → redirect URL signée (60 s) vers la dernière copie envoyée |
| `src/components/admin/ContractCard.tsx` | Carte « Contrat » (rendue par AdminActions) |
| `src/components/admin/AdminActions.tsx` | rend ContractCard avec montant/statut live |
| `src/app/admin/inscriptions/[id]/page.tsx` | select des nouvelles colonnes + props + events audit timeline |
| `src/lib/admin-transitions.ts` | reminder `validee` mis à jour (contrat depuis la carte, RIB inclus dedans) |
| `next.config.ts` | `serverExternalPackages: ['@react-pdf/renderer']` + `outputFileTracingIncludes` |

## Garde-fous envoi (serveur, 400 lisible)

- statut ∈ {validee, soldee} (pas de contrat sur dossier reçu/refusé/annulé)
- email candidat présent
- `package_amount_cents` non nul et > 0 (« sur devis » bloqué → saisir le montant d'abord)
- dates début/fin présentes, fin ≥ début, durée présente
- échéance présente et ≤ date de début
- IBAN réel configuré (placeholder → refus)

L'UI reflète chaque blocage en clair dans la carte (liste « À compléter avant envoi »)
et désactive les boutons ; le serveur reste l'autorité.

## UX admin (carte « Contrat », colonne droite après Paiement)

- Dossier non validé → carte repliée « Valide la candidature pour préparer le contrat ».
- Champs : langue (fr/en), dates début/fin (fin auto = début + semaines×7 tant que
  non éditée à la main), durée, montant (€), échéance (défaut J+14 clampé à la veille
  du début), inclusions/exclusions (textarea, 1 item/ligne, pré-remplies selon langue), note.
- **Montant éditable depuis la carte (ajout 2026-07-03)** : MÊME champ que la carte
  Paiement (`package_amount_cents`, source unique — suivi paiement, commissions
  referral % et contrat restent cohérents ; pas de montant contractuel séparé).
  Draft resynchronisé depuis l'état live tant que non touché, save via le PATCH
  existant (audit `package_amount_change` + recompute commissions inchangés),
  callback `onAmountSaved` pour resynchroniser la carte Paiement sans refresh.
- « Enregistrer » explicite (pas d'auto-save : document légal), indicateur dirty.
- « Prévisualiser le PDF » (save-then-open, nouvel onglet).
- « Envoyer le contrat » → ConfirmModal récap (destinataire, montant, langue, n°) ;
  après 1er envoi le bouton devient « Renvoyer le contrat » avec avertissement vN.
- Ligne d'état : « Contrat MKR-2026-0007 envoyé le 03/07/2026 14:12 (2 envois) » +
  lien « Voir le PDF envoyé » (URL signée).
- Timeline : events `contract_fields_update` / `contract_sent` labellisés.

## UX candidat (email)

- Objet : `Ton contrat MKR Caucasian Camp — MKR-2026-0007` / EN équivalent.
- Corps (tutoiement FR, ton site) : récap séjour + montant + échéance + RIB
  (aussi dans l'email, pas seulement le PDF), référence virement = n° de contrat +
  nom, étapes suivantes, rappel assurance obligatoire, replyTo `contact@mkrcamp.com`.
- PJ : `MKR-2026-0007-contrat.pdf` (nom propre, pas de v interne côté candidat).

## Points challengés / hors périmètre v1

- **E-signature** (Docusign/Yousign) : hors v1, clause paiement-vaut-acceptation.
- **Badge contrat dans la liste** `/admin/inscriptions` : follow-up utile, hors v1.
- **Noms non latins** (candidats RU/étrangers) : Teko/Barlow = Latin uniquement.
  Sanitisation défensive (translittération cyrillique basique) pour éviter les
  glyphes manquants ; si ça devient fréquent → embarquer Noto Sans.
- **Relance échéance dépassée** : hors v1 (cron possible plus tard).
- **Multi-admin / concurrence** : incrément `contract_sent_count` côté serveur
  d'après l'état DB lu, single-admin de fait (cookie unique).

## Vérification

`tsc --noEmit` · `node scripts/i18n-check.js` · `rm -rf .next && npx next build`
(Turbopack) · aperçu + envoi sur dossier test · deploy Vercel → check live.
