# Guide Ruslan — Gérer MKR Caucasian Camp

Bienvenue Ruslan. Ce guide te dit comment piloter le site et le pipeline candidatures sans avoir besoin de David à chaque modification.

Toutes les opérations se font dans **2 endroits** :
1. **Le dashboard admin** : `mkrcamp.com/admin/inscriptions` — pour gérer les candidatures du jour
2. **Le code source** (GitHub) : `github.com/davidkhazaeich-code/MKR` — pour changer les tarifs, ajouter une session, modifier un texte

---

## Sommaire

1. [Accéder au dashboard admin](#1-acceder-au-dashboard-admin)
2. [Gérer une candidature (visio → paiement → validation)](#2-gerer-une-candidature)
3. [Modifier un tarif (un seul fichier à éditer !)](#3-modifier-un-tarif)
4. [Ajouter ou modifier une session officielle](#4-sessions-officielles)
5. [Modifier un texte sur le site (FAQ, descriptions, etc.)](#5-modifier-un-texte)
6. [Publier les changements (deploy)](#6-deploy)
7. [Où trouver quoi sur le site (cheat sheet)](#7-cheat-sheet)
8. [En cas de problème](#8-en-cas-de-probleme)

---

## 1. Accéder au dashboard admin

URL : **mkrcamp.com/admin/inscriptions**

Le dashboard est protégé par un mot de passe que David t'a transmis. Une fois connecté, tu vois la liste de toutes les candidatures, classées par statut :
- **Reçue** : candidature en ligne fraîche, à appeler
- **Visio planifiée** : RDV pris, en attente de la visio
- **Acceptée** : visio passée, candidat validé, RIB envoyé
- **Soldée** : virement reçu, dossier complet
- **Refusée / Annulée** : dossier clos

Tu peux filtrer par **tunnel** (Session officielle / Sur Mesure / Famille / Club & Groupe) ou par **session** (Été 2026, Toussaint 2026, Hiver 2027, Pâques 2027). La recherche par nom/email fonctionne en haut de la liste.

---

## 2. Gérer une candidature

Tu cliques sur une ligne → tu arrives sur la fiche détaillée. Tu y trouves :

### Section "Identité et coordonnées"
Prénom, nom, email, téléphone, pays, ville de départ.

### Section "Expérience sportive"
Discipline principale, années de pratique, niveau, club, palmarès, lien vidéo.

### Section "Santé"
Condition physique, blessures récentes, contre-indications, capacité à s'entraîner 2× par jour.

### Section "Famille" (si tunnel Famille)
- **Format** : session officielle choisie ou sur-mesure
- **Enfants** : liste avec prénom, âge, expérience, contre-indications
- **Conjoint(e) participe aussi** : Oui/Non
- **Nombre de parents participants** : 1 ou 2

> 💡 Si le tunnel est Famille avec 2 parents : applique le tarif Solo/Duo aux 2 parents + 790 €/sem par enfant. Si 1 parent : forfait Parent+Enfant (1er enfant inclus) + 790 €/sem par enfant supplémentaire.

### Section "Groupe / Club" (si tunnel Club & Groupe)
- Nom du club, nombre de participants (5 / 6-10 / 11-20), niveau du groupe, disciplines, palmarès collectif.

### Actions disponibles

**Changer le statut** : bouton à droite. Le système te rappelle à chaque transition ce que tu dois faire :
- `Reçue` → `Visio planifiée` : RDV pris avec le candidat
- `Visio planifiée` → `Acceptée` : visio passée, candidat OK → envoyer le RIB par email
- `Acceptée` → `Soldée` : virement reçu sur ton compte → marquer comme payé

**Saisir le paiement** (après visio, quand tu envoies le RIB) :
- **Montant package (€)** : total convenu avec le candidat. Le hint sous le champ te rappelle le tarif Solo/Duo de référence selon la grille actuelle.
- **Méthode** : Virement bancaire / Espèces / Autre
- **Date de paiement** : date à laquelle l'argent est arrivé sur le compte

**Notes admin** : champ libre pour tes notes internes (ce que le candidat t'a dit en visio, son niveau réel, ses contraintes, etc.).

**Notes visio** : compte-rendu structuré de la visio.

### Historique
Toute action est tracée dans la timeline en bas de la fiche (qui a changé quoi, quand). Tu peux remonter l'historique d'un dossier en un coup d'œil.

---

## 3. Modifier un tarif

C'est **LE point qui change tout**. La grille tarifaire vit dans **un seul fichier** :

📁 `src/data/pricing.ts`

Tu y modifies les chiffres → tu commits → tu push → Vercel rebuild → tout le site (pages, FAQ, CGV, hero stats, formulaire, métadonnées SEO) est mis à jour automatiquement.

### Étape par étape

1. Va sur **github.com/davidkhazaeich-code/MKR**
2. Navigue dans `src/data/pricing.ts`
3. Clique sur le crayon (✏️) en haut à droite pour éditer
4. Trouve la section correspondante :

```typescript
export const PRICING_TIERS = {
  duo: {  // 1 à 2 personnes
    perAdult: { 1: 1490, 2: 2290, 3: 2790 },  // 1 sem / 2 sem / 3 sem
    // ...
  },
  trio: {  // 3 à 5 personnes
    perAdult: { 1: 1390, 2: 1990, 3: 2690 },
    // ...
  },
  club: {  // 6 à 10 personnes
    perAdult: { 1: 1290, 2: 1790, 3: 2390 },
    // ...
  },
  private: {  // 11+ : sur devis
    perAdult: { 1: 0, 2: 0, 3: 0 },  // laisser à 0
    // ...
  },
}

export const FAMILY_PRICING = {
  base: { 1: 2590, 2: 4790, 3: 6890 },  // forfait 1P+1E
  extraChildPerWeek: { 1: 790, 2: 1580, 3: 2370 },  // par enfant supp
}
```

5. Change le chiffre. Par exemple, si tu veux passer le palier Duo 1 sem de 1490 à 1500 € : remplace `1: 1490` par `1: 1500`.
6. Descends en bas de la page → "Commit changes"
7. Ajoute un message clair : `Hausse tarif Duo 1 sem : 1490 → 1500 €`
8. Confirme. Vercel reconstruit le site en 1-2 minutes.

### Ce que tu n'as PAS à faire

❌ Tu n'as **PAS** besoin de modifier les pages (sessions, familles, CGV, FAQ, etc.) une par une.
❌ Tu n'as **PAS** besoin de mettre à jour les métadonnées SEO.
❌ Tu n'as **PAS** besoin de toucher au formulaire d'inscription.

Tout se propage automatiquement depuis `data/pricing.ts`. C'est le principe central du système.

### Cas limite

Si tu veux changer la **structure** des paliers (ex : ajouter un palier "11-20 = 1190 €/pers" au lieu de "11+ = devis"), demande-moi (David). Modifier les chiffres existants = autonome. Changer la structure = on en discute.

---

## 4. Sessions officielles

Le calendrier des 4 sessions vit dans **2 fichiers** (à synchroniser manuellement) :

1. **`src/data/sessions.ts`** : objet `SESSIONS` (source pour Hero homepage, Sessions homepage, form select)
2. **`src/app/(site)/sessions/page.tsx`** : tableau `SESSIONS` hardcoded en haut du fichier (cards visuelles de la page Sessions)

### Pour ajouter une session

Ouvre `src/data/sessions.ts` et ajoute un objet sur le modèle :

```typescript
{
  id: 'ete-2027',  // slug ASCII, unique
  season: 'Été',
  seasonLabel: 'Été 2027',
  label: 'CAMP\nDAGHESTANAIS',
  name: 'CAMP\nDAGHESTANAIS',
  monthAbbr: 'AOÛ',
  dates: '17 août - 5 septembre 2027',
  datesFull: '17 août - 5 septembre 2027',
  startDate: '2027-08-17',
  endDate: '2027-09-05',
  price: 1490,
  priceCurrency: 'EUR',
  maxCapacity: 15,
  spotsLabel: 'Places disponibles',
  status: 'open',
  intensity: 'Maximale',
  duration: '1 à 3 semaines',
  destination: 'Daghestan',
},
```

Puis ouvre `src/app/(site)/sessions/page.tsx` et ajoute un objet équivalent dans le tableau `SESSIONS` en haut du fichier.

Commit + push : le carousel Hero, le formulaire d'inscription, la page Sessions, la FAQ, et le CTA final se mettent à jour automatiquement.

### Pour modifier une session existante (dates, prix, places)

Modifie l'objet dans `data/sessions.ts`. Si tu changes l'ID, met aussi à jour `app/(site)/sessions/page.tsx` (même tableau).

### Pour supprimer une session terminée

Retire l'objet des 2 tableaux. La session disparaît partout (Hero, Sessions homepage, page Sessions, formulaire).

> ⚠️ Avant de supprimer une session, vérifie qu'il n'y a plus de candidatures ouvertes pour celle-ci dans le dashboard admin.

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

*Dernière mise à jour : 2026-05-11 (post refonte grille tarifaire par taille de groupe)*

*Une question ? Contacte David — il préfère répondre une fois clairement plutôt que de te laisser bloqué.*
