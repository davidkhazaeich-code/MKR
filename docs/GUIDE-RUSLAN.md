# Guide Ruslan : gérer MKR Caucasian Camp

Bienvenue Ruslan. Ce guide te dit comment piloter le site et le pipeline candidatures sans avoir besoin de David à chaque modification.

Toutes les opérations se font dans **2 endroits** :
1. **Le dashboard admin** : `mkrcamp.com/admin`, pour gérer les candidatures du jour
2. **Le code source** (GitHub) : `github.com/davidkhazaeich-code/MKR`, pour changer un tarif ou modifier un texte (les sessions, elles, tournent toutes seules)

---

## Sommaire

1. [Accéder au dashboard admin](#1-acceder-au-dashboard-admin)
2. [Gérer une candidature (visio, validation, contrat, paiement)](#2-gerer-une-candidature)
3. [Modifier un tarif (un seul fichier à éditer !)](#3-modifier-un-tarif)
4. [Les sessions officielles, qui tournent toutes seules](#4-sessions-officielles)
5. [Modifier un texte sur le site (FAQ, descriptions, etc.)](#5-modifier-un-texte)
6. [Publier les changements (deploy)](#6-deploy)
7. [Où trouver quoi sur le site (cheat sheet)](#7-cheat-sheet)
8. [En cas de problème](#8-en-cas-de-probleme)

---

## 1. Accéder au dashboard admin

URL : **mkrcamp.com/admin**

Cette adresse t'amène directement sur l'écran « À faire », qui te dit tout de suite ce qui attend une action, sans que tu aies besoin de trier les dossiers toi-même. Le mot de passe est celui que David t'a transmis. Une fois connecté, la connexion reste mémorisée 30 jours sur ton appareil, donc tu n'as pas besoin de le retaper à chaque visite, sauf si tu changes de téléphone ou d'ordinateur, ou si tu te déconnectes toi-même.

Sur ton téléphone, tu peux ajouter l'admin à ton écran d'accueil comme une vraie application, depuis le menu de partage du navigateur (« Sur l'écran d'accueil » ou équivalent selon le navigateur). Il s'ouvre alors en plein écran, sans la barre d'adresse.

### Se déplacer dans l'admin

Sur ordinateur, une barre à gauche donne accès à tout : À faire, Candidatures, Sessions, Partenaires, Leads guide. En bas de cette barre, tu changes l'apparence (claire, sombre ou automatique selon ton appareil) et tu te déconnectes.

Sur téléphone, quatre icônes en bas de l'écran : À faire, Candidatures, Sessions et Plus. Le bouton Plus ouvre un panneau avec Partenaires, Leads guide, l'apparence et la déconnexion.

### Ce que tu vois sur chaque écran

- **À faire** : la date du jour, ta prochaine session qui part et dans combien de jours, le nombre de dossiers par statut, l'agenda des visios à venir groupées par jour, puis des listes classées par urgence, chacune affichée seulement si elle contient un dossier : les visios passées sans décision, les paiements en retard ou attendus, les contrats à envoyer, les devis Club et Groupe, les candidatures sans visio à relancer, les dossiers dont le camp est déjà parti, les camps terminés à clôturer, les bonus partenaires à payer, et enfin les nouvelles candidatures.
- **Candidatures** : la liste complète, avec une recherche par nom, email ou téléphone, des onglets par statut et des filtres (session, formule, discipline, origine, partenaire, langue, étape, tri). Chaque ligne te dit d'un coup d'œil la prochaine étape du dossier.
- **Sessions** : une carte par session, avec les places prises en Lutte et en MMA, les montants engagés et encaissés, et un lien direct vers les dossiers de chaque statut pour cette session.
- **Partenaires** et **Leads guide** : les mêmes informations qu'avant, à savoir les commissions à payer, les liens à partager, et l'export des contacts du guide PDF, simplement plus lisibles sur téléphone.

### Les statuts d'un dossier

Chaque dossier a un statut, qui n'avance que par une action de ta part sur sa fiche : **Reçue** pour une candidature qui vient d'arriver, **Validée** une fois que tu as fait la visio et accepté le candidat, **Soldée** quand le paiement complet est arrivé, **Camp fait** une fois le séjour terminé. À côté de ce chemin normal : **Refusée**, **Annulée** ou **Reportée** pour un dossier qui ne va pas jusqu'au bout.

---

## 2. Gérer une candidature

Tu cliques sur une ligne et tu arrives sur la fiche du dossier. Sur téléphone, elle est répartie en quatre onglets (Profil, Suivi, Paiement, Historique) sous un en-tête fixe avec le nom et le statut, et une barre d'actions fixe en bas (WhatsApp, Appeler, action principale). Sur ordinateur, les quatre groupes sont affichés en deux colonnes, sans onglet.

### Le panneau « prochaine étape »

En haut de la fiche, un panneau te dit en clair ce qu'il reste à faire sur ce dossier, avec un seul bouton principal qui fait exactement cette action : ouvrir la réservation de la visio, valider, préparer le contrat, enregistrer le paiement, passer le dossier en soldé, proposer une autre session, marquer le camp fait, ou relancer un candidat qui n'a pas encore réservé sa visio. Les autres changements de statut possibles restent disponibles en dessous, en secondaire.

Valider un dossier demande une confirmation, parce que ça envoie automatiquement un email au candidat pour lui annoncer que son dossier est validé.

### Onglet Profil
Identité et coordonnées (prénom, nom, email, téléphone, pays, ville de départ), expérience sportive (discipline, années de pratique, niveau, club, palmarès, lien vidéo), santé, et selon le tunnel les informations Famille (enfants, conjoint participant ou non, nombre de parents) ou Club et Groupe (nom du club, nombre de participants, niveau, disciplines). Tu y trouves aussi les autres dossiers du même candidat s'il y en a.

### Onglet Suivi
L'heure exacte de la visio réservée sur Cal, un lien direct vers la page de réservation, le compte-rendu de la visio puis tes notes internes. Les deux se sauvegardent tout seuls pendant que tu tapes, donc tu n'as pas de bouton Enregistrer à chercher ni de risque de perdre ce que tu viens d'écrire si tu changes d'écran juste après. Cet onglet porte aussi le bouton pour relancer un candidat sans visio, et celui pour lui proposer une autre session si le camp choisi est déjà parti.

### Onglet Paiement
Une carte unique pour le paiement : montant restant, montant du séjour modifiable, méthode, date, et un interrupteur pour marquer le dossier comme soldé. Le bouton « Enregistrer un paiement » ouvre une fenêtre qui pré-remplit tout d'un coup (montant, méthode, date du jour, et la case pour passer directement en Soldée) au lieu de faire les gestes un par un. La carte contrat reste au même endroit qu'avant (préparer, enregistrer, envoyer, renvoyer, avec le RIB toujours inclus dans l'email), tout comme le bonus partenaire s'il y en a un pour ce dossier.

### Onglet Historique
Toute action reste tracée dans la timeline, avec un texte clair pour chaque événement. Tout en bas se trouve la zone de suppression définitive d'un dossier, protégée : il faut taper SUPPRIMER dans le champ prévu pour confirmer.

### Se déplacer d'un dossier à l'autre
En haut de la fiche sur téléphone, et sur le côté sur ordinateur : un bouton précédent et un bouton suivant qui gardent l'ordre de la liste ou de l'écran À faire d'où tu venais, sans devoir repasser par la liste à chaque fois.

---

## 3. Modifier un tarif

C'est **LE point qui change tout**. La grille tarifaire vit dans **un seul fichier** : `src/data/pricing.ts`.

Tu y modifies un chiffre, tu commits, tu push, Vercel reconstruit, et tout le site (pages, FAQ, CGV, hero stats, formulaire, métadonnées SEO) se met à jour automatiquement, ainsi que le rappel de tarif que tu vois dans la fiche d'un dossier admin.

Le fichier contient quatre paliers par taille de groupe (Solo ou Duo, Trio à cinq, Club ou Groupe, et au-delà sur devis) et le forfait Famille (le prix de base pour un parent et un enfant, puis chaque enfant supplémentaire), chacun décliné sur une semaine, deux semaines et trois semaines.

Les montants eux-mêmes bougent de temps en temps, ils ont encore changé le 15 septembre 2026, donc ce guide ne les recopie pas : ils seraient faux la fois suivante. Pour voir les prix qui sont réellement en ligne aujourd'hui, le plus sûr est d'ouvrir directement le fichier sur GitHub, ou de regarder **mkrcamp.com/sessions**, qui affiche exactement ce que voit un visiteur.

### Étape par étape

1. Va sur **github.com/davidkhazaeich-code/MKR**.
2. Navigue dans `src/data/pricing.ts`.
3. Clique sur le crayon en haut à droite pour éditer.
4. Repère la ligne du palier que tu veux changer, puis le bon montant selon la durée choisie, en première position pour une semaine, en deuxième pour deux semaines, en troisième pour trois semaines.
5. Remplace le chiffre par le nouveau montant, sans toucher au reste de la ligne.
6. Descends en bas de la page jusqu'à « Commit changes ».
7. Ajoute un message clair qui dit quel palier tu as changé et dans quel sens.
8. Confirme. Vercel reconstruit le site en une à deux minutes.

### Ce que tu n'as pas à faire

Tu n'as pas besoin de modifier les pages une par une, que ce soit sessions, familles, CGV ou FAQ. Tu n'as pas besoin de mettre à jour les métadonnées SEO, ni de toucher au formulaire d'inscription, ni au rappel de tarif dans la fiche d'un dossier admin. Tout se propage automatiquement depuis `data/pricing.ts` : c'est le principe central du système.

### Cas limite

Si tu veux changer la structure des paliers, par exemple ajouter un palier pour onze à vingt personnes au lieu de passer directement sur devis, demande à David. Modifier les chiffres existants reste autonome. Changer la structure se discute avant.

---

## 4. Sessions officielles

Les sessions ne sont plus une liste à tenir à jour : elles tournent toutes seules. Le camp revient quatre fois par an, en février, à Pâques, en août et à la Toussaint, et `src/data/sessions.ts` calcule automatiquement les prochaines dates à partir de ces quatre gabarits de saison. Dès qu'une session démarre, elle sort de la liste des inscriptions, et la même saison de l'année suivante apparaît toute seule à la fin de la liste. Il n'y a plus de tableau à modifier ni de session à ajouter chaque année, et donc plus rien à synchroniser entre deux fichiers.

### Si une date ou un nombre de places doit être corrigé

Les dates sont calculées depuis le calendrier des vacances scolaires, mais si toi ou David fixez une date différente pour une session précise, ou si le calendrier scolaire ne tombe pas exactement comme prévu, ça se corrige avec une exception dans le même fichier, section `SESSION_OVERRIDES`. Le plus simple est de demander à David de l'ajouter en lui donnant les nouvelles dates de début et de fin. Le nombre de places, en Lutte et en MMA, se règle de la même façon, session par session.

### Ce qui ne se change pas ici

Le prix d'une session ne vit plus dans ce fichier : il vient de `data/pricing.ts`, voir la section précédente. Ne cherche pas de montant à modifier dans `sessions.ts`.

### Pour clôturer une session terminée

Rien à faire dans le code. Une fois le camp fini, l'écran Sessions de l'admin te le signale de lui-même, et chaque dossier soldé de cette session passe en « Camp terminé, dossier à clôturer » sur l'écran À faire. Tu le fais alors basculer en Camp fait depuis sa fiche, dossier par dossier.

---

## 5. Modifier un texte

### FAQ (homepage et page FAQ complète)

📁 `src/data/faq.ts`

- `FAQ_HOMEPAGE` : top 6 questions affichées sur la homepage
- `FAQ_CATEGORIES` : FAQ complète (Sécurité / Logistique / Entrainement / Inscription / Familles et Jeunesse)

Pour modifier une réponse : trouve l'objet `{ question: '...', answer: '...' }` et édite le champ `answer`.

### Descriptions des 4 tunnels (Session / Sur Mesure / Famille / Club)

📁 `src/data/registration-types.ts`

Ces descriptions apparaissent sur la homepage (AudienceSwitcher), la page Sessions, le formulaire, le footer.

### CGV (Conditions Générales de Vente)

📁 `src/app/(site)/cgv/page.tsx`

Les 11 articles sont dans le JSX. Modifie directement le texte voulu.

### Coordonnées contact

Pour changer le numéro WhatsApp, l'email ou les réseaux sociaux : voir `SITEMAP.md` (à la racine du projet), section "Propagation Map" → "Téléphone WhatsApp" et "Email contact". Plusieurs fichiers à toucher.

### Textes des pages individuelles

Chaque page a son propre fichier dans `src/app/(site)/<nom>/page.tsx`. Édite directement le JSX.

---

## 6. Publier les changements (deploy)

Le site est hébergé sur **Vercel**. À chaque `git push origin main` :
1. Vercel détecte le nouveau commit
2. Lance le build automatiquement (1-2 min)
3. Met le nouveau site en ligne

**Tu peux suivre le déploiement** sur le dashboard Vercel : `vercel.com` → projet MKR → onglet "Deployments".

Si le build échoue (rare), Vercel garde l'ancienne version en ligne et t'envoie un email d'erreur. Dans ce cas, contacte David.

### Workflow simple via GitHub (sans terminal)

1. Va sur `github.com/davidkhazaeich-code/MKR`
2. Édite le fichier voulu dans le navigateur (crayon ✏️)
3. En bas de la page, "Commit changes" → message clair → bouton vert
4. Vercel rebuild automatiquement → site à jour en 2 min

C'est tout. Pas besoin de Git en local.

---

## 7. Cheat sheet

| Je veux changer... | Fichier à modifier |
|---|---|
| **Un prix** (palier, forfait famille, enfant supp) | `src/data/pricing.ts` |
| **Une session officielle** | `src/data/sessions.ts` + `src/app/(site)/sessions/page.tsx` |
| **Une réponse FAQ homepage** | `src/data/faq.ts` → `FAQ_HOMEPAGE` |
| **Une réponse FAQ complète** | `src/data/faq.ts` → `FAQ_CATEGORIES` |
| **Description d'un tunnel** | `src/data/registration-types.ts` |
| **CGV** | `src/app/(site)/cgv/page.tsx` |
| **Texte hero homepage** | `src/components/Hero.tsx` |
| **Photo de coach** | Remplacer le fichier dans `public/images/coaches/` (garder le nom) |
| **Article de blog** | `src/app/(site)/blog/[slug]/page.tsx` (ARTICLES_MAP) |
| **Témoignages homepage** | `src/data/testimonials.ts` |
| **WhatsApp / email** | Voir SITEMAP.md "Propagation Map" |
| **Photo hero (vidéo)** | `public/videos/hero-*.mp4` |

> 📚 Référence complète : `SITEMAP.md` à la racine du projet. C'est la cartographie exhaustive du site.

---

## 8. En cas de problème

### Le site ne se met pas à jour après mon commit

1. Va sur Vercel → onglet Deployments
2. Le dernier déploiement est-il "Ready" (vert) ou "Error" (rouge) ?
3. Si rouge : clique dessus pour voir le log d'erreur. Contacte David avec une capture d'écran.
4. Si vert mais l'ancienne version reste affichée : vide le cache du navigateur (Cmd+Shift+R / Ctrl+Shift+R).

### J'ai cassé quelque chose, comment annuler ?

Sur GitHub :
1. Va dans l'onglet "Commits" du projet
2. Trouve ton commit fautif
3. Clique sur "..." (3 points) → "Revert"
4. Confirme. GitHub crée un commit qui annule le précédent.
5. Vercel rebuild → le site revient à l'état d'avant.

### Une candidature ne s'enregistre pas

1. Vérifie sur Vercel : le site est-il "Ready" ?
2. Vérifie le dashboard Supabase (David te montre comment) pour confirmer si la candidature est bien arrivée en base.
3. Si rien : contacte David, il peut regarder les logs API.

### Slack ne reçoit plus les notifications

Variable d'environnement `SLACK_WEBHOOK_URL` à vérifier dans Vercel (Settings → Environment Variables). David peut la régénérer.

### Le formulaire affiche un mauvais tarif

C'est forcément que `data/pricing.ts` a un chiffre incohérent. Va voir → corrige → push.

---

## Bonnes pratiques

✅ **Toujours commit avec un message clair** : "Hausse tarif Duo 1 sem 1490→1500" plutôt que "fix"
✅ **Faire les changements un par un** : ne pas modifier 5 prix d'un coup sans vérifier. Un commit = un changement = un déploiement.
✅ **Vérifier le site en production après chaque push** (1-2 min après) : ouvre `mkrcamp.com` en navigation privée pour éviter le cache.
✅ **Tester le formulaire d'inscription** après tout changement de prix pour valider que les totaux sont corrects.

❌ **Ne JAMAIS modifier les fichiers `.next/`, `node_modules/`, `package-lock.json`** sans demander.
❌ **Ne JAMAIS toucher au dossier `src/app/api/`** (logique serveur).
❌ **Ne JAMAIS supprimer des fichiers** sans demander.

---

## Ressources

- **Repo GitHub** : `github.com/davidkhazaeich-code/MKR`
- **Vercel** : `vercel.com` (compte David, Ruslan peut être invité comme Member)
- **Supabase** : `supabase.com` projet `mkr-inscriptions` (id `bgwvrzgnoqlqqrvflwav`)
- **Site en ligne** : `mkrcamp.com`
- **Admin candidatures** : `mkrcamp.com/admin/inscriptions`
- **Cartographie complète** : `SITEMAP.md` à la racine du projet

---

*Dernière mise à jour : 2026-09-23 (admin v2 : nouvel écran À faire, fiche dossier en onglets, connexion mémorisée 30 jours, sessions qui tournent seules)*

*Une question ? Contacte David : il préfère répondre une fois clairement plutôt que de te laisser bloqué.*
