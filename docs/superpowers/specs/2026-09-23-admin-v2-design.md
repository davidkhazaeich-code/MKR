# Admin MKR v2 : poste de travail orienté action

> Spec validée par David le 2026-09-23 (« Go », carte blanche). Branche `admin-v2`.
> Surface : `/admin/*` uniquement (register **product**, cf. `PRODUCT.md`). 100 % FR, aucun impact i18n.

## 1. Objectif

Rendre le back office pratique et navigable pour Ruslan (téléphone, entre deux entraînements) et David (ordinateur), sans retirer une seule fonctionnalité, et avec tout qui marche.

Critère de réussite : en ouvrant l'admin, Ruslan sait en trois secondes ce qu'il doit faire, et chaque action courante (appeler, valider, envoyer le contrat, enregistrer un paiement, relancer) se fait en deux gestes au plus depuis un téléphone.

## 2. Constat (code relu en entier, base interrogée le 2026-09-23)

| Problème | Mesure |
|---|---|
| « À traiter » mélange tout | 34 dossiers « Reçue » ; sur 49 actifs : 14 sur le camp d'août parti, 9 visios passées sans décision, 12 jamais réservées, 4 visios à venir, 3 contrats à envoyer, 7 paiements attendus (5 pour Toussaint, départ le 17.10) |
| Heure des visios invisible | 19 réservations Cal en base, heure du rendez-vous dans `audit_log.data.start_time`, jamais affichée ; le badge « Visio en retard » (reçue depuis plus de 7 j) signale aussi des gens qui ont réservé |
| Liste lourde | stats + pipeline + 5 rangées de pastilles + recherche avant le premier dossier (~2 écrans en 390 px) ; jusqu'à 10 badges par carte |
| Fiche mobile | Valider / Refuser après une quinzaine d'écrans ; FAB « Actions » en rustine |
| Fiche desktop | colonne d'actions `sticky` plus haute que l'écran : les notes ne se voient qu'en bas de page |
| Paiement | montant, interrupteur « soldé » et statut « Soldée » = trois gestes ; 0 paiement jamais saisi |
| Historique | libellés bruts (`package_amount_estimated`, `visio_booked`, `referral_attached`…) |
| Connexion | cookie de 8 h : jeton de 64 caractères à ressaisir chaque jour |
| Données cachées | `visio_booked_at`, `payment_reminder_*`, `predeparture_sent_at` jamais montrés |

## 3. Principes

1. **Chaque dossier a une prochaine étape calculée** (fonction pure, testée). Elle pilote l'accueil, la colonne « Prochaine étape » de la liste et le panneau d'action de la fiche. Une seule source de vérité, alignée sur le digest quotidien (`lib/automation/selectors.ts`).
2. **Une action primaire par contexte**, portant l'icône de son action (règle David du 23.09). Secondaires sans icône, sauf WhatsApp (vert, logo) et Appeler (téléphone). Pastilles = filtres uniquement, jamais d'action.
3. **La couleur d'action (rust MKR) ne sert qu'au cliquable** : boutons primaires, liens, onglet actif, focus. Les statuts utilisent des couleurs sémantiques (point + texte, sans bordure de bouton).
4. **Mobile réel** : cibles de 44 px, champs à 16 px (pas de zoom iOS), zoom utilisateur autorisé, zones sûres iPhone.
5. **Zéro perte** : états optimistes seulement confirmés par le serveur, retour arrière et message actionnable en cas d'erreur, notes flushées en `keepalive`.
6. Pas d'em dash, pas d'emoji, jamais d'esperluette ; titres en capitales composés plus petits.

## 4. Architecture de l'information

| Route | Écran | Statut |
|---|---|---|
| `/admin` | **À faire** (nouvel accueil) | nouveau |
| `/admin/inscriptions` | **Candidatures** | refonte |
| `/admin/inscriptions/[id]` | **Fiche dossier** | refonte |
| `/admin/sessions` | **Sessions** | nouveau |
| `/admin/referrals` | **Partenaires** | refonte visuelle |
| `/admin/guide-leads` | **Leads guide** | refonte visuelle |
| `/admin/login` | Connexion | restyle + 30 jours |

Les URL existantes ne bougent pas (liens Slack, digest, emails internes). Login et logo renvoient désormais vers `/admin`.

**Chrome** (sombre dans les deux thèmes, logo blanc, cohérent avec la barre d'état iOS) :
- ≥ 1024 px : barre latérale fixe (logo, À faire, Candidatures, Sessions, Partenaires, Leads guide ; en pied : apparence, déconnexion).
- < 1024 px : en-tête fixe (logo ou retour, titre, rafraîchir) + barre d'onglets en bas (À faire, Candidatures, Sessions, Plus). « Plus » ouvre un panneau : Partenaires, Leads guide, Apparence (Auto, Clair, Sombre), Déconnexion.
- Fiche dossier en mobile : pas de barre d'onglets ; en-tête avec retour et dossier précédent/suivant, barre d'actions fixe en bas (WhatsApp, Appeler, action primaire).

**Thème** : contenu clair ou sombre, suit le système par défaut ; choix manuel mémorisé dans le cookie `mkr_admin_theme` (lu côté serveur par le layout : pas de flash).

**Rafraîchissement** : bouton dans l'en-tête ; `router.refresh()` automatique au retour sur l'onglet si les données ont plus de 60 s.

## 5. Moteur « prochaine étape » (`src/lib/admin/next-step.ts`)

Entrée : une ligne dossier + `now`. Sortie : `{ kind, tone, title, detail, short, urgent, rank, dueAt }`. Aucune I/O.

Ordre d'évaluation :

| Statut | Condition (dans l'ordre) | `kind` | Ton |
|---|---|---|---|
| recue / validee | session officielle déjà partie (`startDate <= aujourd'hui`) | `camp_parti` | danger |
| recue | visio réservée, début dans le futur ou il y a moins de 30 min | `visio_a_venir` | info (accent si aujourd'hui) |
| recue | visio réservée, début passé depuis plus de 30 min | `visio_passee` | warn |
| recue | visio réservée, heure inconnue | `visio_reservee` | info |
| recue | tunnel `groupe`, pas de visio | `devis_a_envoyer` | warn |
| recue | pas de visio, reçue depuis 3 j ou plus | `a_relancer` | warn |
| recue | pas de visio, reçue depuis moins de 3 j | `nouvelle` | neutral |
| validee | `package_paid_at` renseigné | `a_solder` | warn |
| validee | contrat jamais envoyé | `contrat_a_envoyer` | warn |
| validee | contrat envoyé sans échéance | `contrat_sans_echeance` | warn |
| validee | échéance dépassée | `paiement_en_retard` | danger |
| validee | échéance à venir | `paiement_attendu` | info |
| soldee | session terminée | `camp_a_cloturer` | warn |
| soldee | sinon | `depart_a_venir` | ok |
| autres | refusee, annulee, reportee, camp_fait | `clos` | neutral |

« Aujourd'hui » et les heures se calculent en `Europe/Zurich` (comme le digest). Le serveur fournit `nowIso` aux composants clients : même horloge au rendu et à l'hydratation.

Test : `scripts/admin-next-step-check.mts` (fixtures couvrant chaque ligne du tableau + les bascules de minuit et de fuseau).

## 6. Écrans

### 6.1 À faire (`/admin`)

En tête : date du jour, prochain départ (« Toussaint 2026 part dans 24 j · Lutte 10/15 · MMA 2/15 », lien vers Sessions) et la ligne pipeline (reçues, validées, soldées, camp fait).

Sections, affichées seulement si non vides, dans cet ordre :
1. **Visios** : agenda groupé (Aujourd'hui, Demain, Cette semaine, Plus tard) ; heure, nom, langue (FR/EN), discipline et session ; boutons WhatsApp et « Réservation » (page Cal du rendez-vous).
2. **À trancher** : visio passée, dossier encore « Reçue ».
3. **Paiements** : en retard, attendus (échéance), contrats sans échéance, payés à solder ; montant affiché.
4. **Contrats à envoyer**.
5. **Devis Club et Groupe**.
6. **À relancer** : âge, nombre de relances et date de la dernière ; bouton « Relancer » en ligne (modale de confirmation, route existante `POST …/visio-reminder`).
7. **Camp parti** : proposition de report envoyée ou non.
8. **Camps terminés à clôturer**.
9. **Bonus partenaires à payer** (`referral_payout_status = due`).
10. **Nouvelles candidatures** (moins de 3 jours, sans visio).

Chaque ligne est un lien vers la fiche (lien étiré), avec au plus deux boutons en ligne. L'ordre de la page sert de contexte précédent/suivant.

Desktop ≥ 1200 px : colonne principale (sections 2 à 10) + colonne latérale (agenda, prochain départ, pipeline).

### 6.2 Candidatures (`/admin/inscriptions`)

- Toutes les candidatures chargées en une requête (limite 2 000) ; filtrage et tri **côté client**, instantanés, reflétés dans l'URL par `history.replaceState` (intégré à `useSearchParams` en Next 16).
- Paramètres : `q`, `statut` (`actifs` par défaut, `recue`, `validee`, `soldee`, `camp_fait`, `refusee`, `annulee`, `reportee`, `tous`), `session` (id, `upcoming`, `none`), `tunnel`, `discipline`, `source`, `partenaire` (code, `invalid`, `none`, `due`), `langue`, `etape`, `tri`. Anciens paramètres acceptés : `status`, `referralCode`.
- Contrôles : recherche (nom, prénom, email, téléphone, pays), onglets de statut avec compteurs à facettes, bouton « Filtres (n) » (repliable en mobile, toujours visible en desktop) avec des `select` natifs (session avec places Lutte et MMA, tunnel, discipline, source, partenaire, langue, étape, tri), pastilles de filtres actifs retirables, « Tout effacer ».
- Ligne : avatar, nom, pays et langue ; statut (point + libellé) ; camp (discipline · session) ; prochaine étape (icône + texte au ton sémantique) ; source ou partenaire (discret) ; reçue il y a ; bouton WhatsApp. Note admin sur une ligne si présente. Mobile : carte compacte en 3 lignes.
- Clavier conservé : `/` recherche, `J`/`K` et flèches, `Entrée` ouvre, `Échap` efface. Préchargement au survol conservé.
- Au-delà de 150 lignes : « Afficher les N suivantes ».

### 6.3 Fiche dossier (`/admin/inscriptions/[id]`)

- **En-tête** : avatar, nom, statut, ligne méta (discipline · session · durée · langue · reçue il y a), progression, boutons WhatsApp, Appeler, Email ; précédent/suivant (`J`/`K`, `Échap` retour à la liste filtrée d'origine).
- **Prochaine étape** : titre, détail, action primaire selon `kind` (ouvrir la réservation Cal, valider, préparer le contrat, enregistrer le paiement, passer en soldée, proposer une autre session, marquer camp fait, relancer) et toutes les autres transitions permises en secondaire. Raccourcis `V R A Z S T` conservés. La validation demande désormais une confirmation (elle envoie l'email « dossier validé » au candidat).
- **Contenu** : quatre panneaux, en onglets sous 1024 px (Profil, Suivi, Paiement, Historique ; onglet mémorisé dans le hash), en deux colonnes au-dessus (gauche : Profil, Historique ; droite : Suivi, Paiement ; plus de colonne collante).
  - Profil : camp et logistique, contact et identité (âge calculé), réponses du formulaire (`FormAnswers`), membres du groupe, acquisition, autres dossiers du même candidat (nouveau).
  - Suivi : compte-rendu visio puis notes admin (auto-save + flush), état de la réservation visio, carte relance visio, carte « proposer une autre session ».
  - Paiement : carte unique (reste à payer, barre, montant éditable, méthode, date, interrupteur soldé, bouton « Enregistrer un paiement »), carte contrat (logique inchangée), bonus partenaire, rappels de paiement et infos pré-départ envoyés.
  - Historique : chronologie avec tous les événements traduits, zone dangereuse (suppression par saisie de `SUPPRIMER`).
- **Enregistrer un paiement** (nouvelle fenêtre) : montant (pré-rempli), méthode, date de réception (aujourd'hui), case « Passer le dossier en Soldée » ; un seul `PATCH` existant avec `package_amount_cents`, `payment_method`, `payment_date`, `package_paid`, `status`.
- Un état client partagé (`DossierProvider`) remplace l'état local d'`AdminActions` : l'en-tête, la prochaine étape et les cartes restent synchronisés après chaque action.

### 6.4 Sessions (`/admin/sessions`)

Une carte par session non terminée (en cours + 4 à venir), puis les sessions passées qui portent des dossiers, les ids orphelins et « Sur mesure » (sans session). Par carte : dates, départ dans N jours ou en cours ou terminé, jauges Lutte et MMA (places prises = reçue + validée + soldée sur le tunnel session, comme aujourd'hui), dossiers par statut (liens vers la liste filtrée), montants engagés (validées + soldées + camp fait) et encaissés.

### 6.5 Partenaires et Leads guide

Mêmes données et mêmes actions (KPIs, liens d'affiliation à copier, compteurs par partenaire, « CA à saisir », lien vers la liste filtrée ; filtre par source et export CSV des leads). Tableau en desktop, cartes empilées en mobile.

### 6.6 Transverse

- `src/app/admin/error.tsx` (nouveau, `unstable_retry`), `not-found.tsx` et les `loading.tsx` passent sur le nouveau chrome.
- Admin installable : `metadata.manifest` vers `/admin/manifest.webmanifest` (route handler ; le proxy ne s'applique pas aux chemins à point), `appleWebApp`, `viewportFit: 'cover'`, `theme-color` sombre.
- Historique : libellés FR pour tous les événements connus (`created`, `status_change`, `visio_booked`, `visio_booking_cancelled`, `visio_rescheduled`, `visio_reminder_sent`, `visio_confirmation_resent`, `rebooking_sent`, `rebooking_reminder_sent`, `payment_reminder_sent`, `predeparture_sent`, `package_amount_estimated`, `package_amount_backfilled`, `package_amount_change`, `package_paid_change`, `payment_method_change`, `payment_date_change`, `notes_admin_update`, `notes_visio_update`, `contract_fields_update`, `contract_sent`, `souvenir_sent`, `souvenir_reset`, `attribution_captured`, `referral_attached`, `referral_due`, `referral_cancelled`, `referral_bonus_recomputed`, `referral_payout_status_change`, `referral_payout_paid_at_change`, `referral_payout_method_change`, `email_corrected`, `fee_paid_change`) ; repli lisible pour un événement inconnu.

## 7. Système de design

- Fichier unique `src/app/admin/admin.css` réécrit. Jetons `--adm-*` en deux jeux (clair par défaut, sombre via `[data-theme="dark"]` et `prefers-color-scheme` quand le thème est Auto). `color-scheme` suit le thème (sélecteurs natifs, calendriers).
- Couleur d'action : rust MKR (`#C84B31` sur sombre, `#B8432A` sur clair, texte de lien éclairci ou foncé pour tenir 4,5:1).
- Tons sémantiques : ok (vert), warn (ambre), danger (rouge), info (bleu), violet, neutral ; statut = point + libellé.
- Typo : Barlow (texte, 15 px, 16 px dans les champs), Barlow Condensed (libellés en capitales, 12 px), Teko (nom du dossier, grands chiffres).
- Boutons : un seul système, rayon 10, hauteur 44 (40 en desktop dense) ; primaire (rust + icône de l'action), secondaire (contour, sans icône), contact (WhatsApp vert avec logo, Appeler avec téléphone), danger, lien tertiaire.
- Composants partagés dans `src/components/admin/ui/` : `Button`, `StatusDot`, `Tone`, `Sheet` (panneau bas mobile), `Tabs`, `ConfirmModal` (piège de focus, retour du focus), `Toast` (au-dessus de la barre du bas), `Icon` (jeu Lucide étendu).
- Aucun style en ligne pour les couleurs : tout passe par les classes et jetons (condition du double thème).

## 8. Données et API

- **Migration `add_visio_starts_at`** : `candidatures.visio_starts_at timestamptz`, remplie depuis le dernier `audit_log.visio_booked.data.start_time` des dossiers encore réservés. Additive : appliquée avant le déploiement du code.
- **Webhook Cal** : `BOOKING_CREATED` écrit `visio_starts_at` ; `BOOKING_RESCHEDULED` met aussi à jour `visio_starts_at` et trace `visio_rescheduled` ; `BOOKING_CANCELLED` le remet à `null`.
- **Connexion** : cookie `mkr_admin` porté à 30 jours (httpOnly, secure, sameSite strict inchangés) ; champ jeton en `autocomplete="current-password"` avec un identifiant « admin » pour les gestionnaires de mots de passe ; `next` par défaut `/admin`.
- Aucune autre route d'API modifiée. Lecture serveur regroupée dans `src/lib/admin/data.ts`.

## 9. Inventaire de non-régression

| Fonction actuelle | Nouvelle place |
|---|---|
| KPIs (à traiter, visio en retard, validées, soldées + camp fait) | ligne pipeline de l'accueil + sections précises (le faux « visio en retard » est remplacé par « À relancer » et « À trancher ») |
| Barre pipeline | ligne pipeline de l'accueil |
| Pastilles session avec places L/M et infobulle | `select` Session (places dans le libellé) + écran Sessions |
| Filtres tunnel, discipline, source, statut | onglets et filtres de la liste |
| Recherche mémorisée, filtre code partenaire, `?referralCode=` | paramètres d'URL `q` et `partenaire` (ancien nom accepté), retour de fiche vers l'URL filtrée |
| Raccourcis liste et fiche | conservés, plus `J`/`K` en fiche |
| Badges (tunnel, EN, discipline, statut, camp parti, camp terminé, MMA niveau, devis, source, nouveau, paiement, code partenaire) | ligne de la liste (statut, camp, langue, source/partenaire) et « prochaine étape » ; avertissement MMA en méta |
| Fiche : identité, logistique, acquisition, réponses, membres du groupe | onglet Profil |
| Progression | en-tête de fiche |
| Bandeau devis groupe | prochaine étape `devis_a_envoyer` |
| État paiement + carte Paiement | carte Paiement unique (plus la nouvelle fenêtre) |
| Carte contrat (prévisualiser, enregistrer, envoyer, renvoyer, PDF envoyé, garde-fous) | onglet Paiement, logique inchangée |
| Relance visio, proposition de session | onglet Suivi (+ relance en ligne depuis l'accueil) |
| Notes admin et compte-rendu visio (auto-save, flush) | onglet Suivi |
| Bonus partenaire (marquer payé, annuler le paiement) | onglet Paiement |
| Historique + rappels post-transition | onglet Historique |
| Suppression définitive | onglet Historique, zone dangereuse |
| Mailto, tel, WhatsApp | en-tête, barre d'actions mobile, lignes de liste et de l'accueil |
| Referrals : KPIs, liens à copier, tableau, totaux, « Voir » | écran Partenaires |
| Leads : filtre source, export CSV, tableau | écran Leads guide |
| Login, logout, 404, skeletons | restylés |

## 10. QA

- **Faux backend local** (`scripts/admin-mock/`, commité, sans aucune donnée réelle) : serveur PostgREST minimal + Storage + Resend (`RESEND_BASE_URL`), jeu de données synthétique couvrant chaque `kind`, chaque tunnel, chaque statut. `next dev` lancé avec des variables qui écrasent `.env.local` (Supabase, jeton admin local, Resend factice) : aucun email réel, aucune écriture en production.
- Contrôles : `tsc`, `next build`, `i18n-check`, `crm-rotation-check`, `admin-next-step-check`.
- Balayage Playwright : chaque écran × 360, 390, 768, 1024, 1440 px × clair et sombre : zéro débordement horizontal, zéro erreur console, zéro requête en échec, cibles tactiles de 44 px en mobile.
- Parcours Playwright sur le faux backend : connexion (erreur puis succès), relance en ligne, recherche, chaque filtre, synchro URL, anciens paramètres, clavier, précédent/suivant, onglets, valider (confirmation, email souvenir simulé), refuser, retirer la validation, reporter, annuler, fenêtre de paiement, champs de paiement, contrat (enregistrer, n° attribué, aperçu PDF, envoi), relance visio, proposition de session, notes (auto-save et flush à la navigation), bonus partenaire (payé puis annulé), suppression, Sessions, copie de lien partenaire, export CSV, thème persistant, déconnexion, 404.
- Contraste des paires de jetons calculé dans les deux thèmes (≥ 4,5:1 pour le texte).

## 11. Livraison

1. Branche `admin-v2` (worktree hors du dossier de David), commits par étape.
2. Migration appliquée en production (additive, sans effet sur le code actuel).
3. Fusion dans `main` et push (déploiement Vercel), vérification en lecture seule en production.
4. Documentation : entrée `SITEMAP.md`, `docs/GUIDE-RUSLAN.md` (partie admin réécrite, sessions et tarifs corrigés), `PRODUCT.md` (principes admin), mémoire projet.

Retour arrière : `git revert` du merge ; la colonne ajoutée n'est lue par personne d'autre et peut rester.

## 12. Hors périmètre

Pas de nouvel email candidat, pas de changement des automatisations (cron, relances en dry-run), pas de multi-comptes, pas de temps réel.
