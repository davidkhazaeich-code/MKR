# Product

## Register

brand

> Note surfaces : le site public `/[locale]/(site)` est la surface primaire (register **brand**). Le back office `/admin` est une surface **product** : toute tâche design sur `/admin` utilise le register product.

## Users

- **Visiteurs du site public** : pratiquants de lutte et MMA francophones (canonical FR) et anglophones, 18-40 ans, qui envisagent un camp d'immersion au Dagestan / en Tchétchénie. Ils arrivent via Google Ads, Instagram (@mkrcamp) ou le blog, souvent sur mobile.
- **Back office `/admin`** : deux utilisateurs seulement. Ruslan (fondateur, facilitateur du camp, non-technique, consulte souvent sur mobile entre deux entraînements) et David (agence DKDP, suivi technique et marketing, desktop). Leur job : traiter le pipeline de candidatures (recue → validee → soldee → camp_fait, plus annulee/reportee), envoyer contrats PDF et relances visio, suivre les referrals et les leads du guide.

## Product Purpose

mkrcamp.com vend des camps d'entraînement tout inclus au Dagestan et en Tchétchénie (lutte et MMA). Le site convertit en candidatures ; la visio avec Ruslan valide chaque dossier ; le paiement se fait post-visio (virement). Le back office est l'outil quotidien de gestion de ce pipeline : zéro friction, zéro erreur d'état (transitions de statut gardées), traçabilité complète (audit log, timeline).

Succès = candidatures qualifiées traitées vite : un dossier reçu est relancé, validé en visio, contractualisé et soldé sans jamais perdre d'information ni envoyer deux fois le même email.

## Brand Personality

Brut, direct, crédible. « Réalité Brute » : pas de fioritures, pas d'emphase marketing creuse. L'immersion au milieu des champions. Couleur de marque rust (`--primary`), typographies Teko / Barlow Condensed pour les displays, interface sombre assumée.

Pour `/admin` : sobriété d'outil. L'interface disparaît derrière la tâche ; la familiarité prime sur l'originalité (référentiel : Linear, Stripe Dashboard).

## Anti-references

- Dashboards SaaS génériques sur-décorés : gradient text, glassmorphism, hero metrics à gros chiffre + gradient.
- Emoji dans l'UI, em dashes dans la copy (règles maison : jamais d'emoji, jamais de em dash, « et » jamais `&`).
- Fond noir pur `#000` (toujours des neutres teintés) et boutons géants pleine largeur.
- Toute affordance inventée pour des tâches standard (modales inutiles, contrôles de formulaire exotiques).

## Design Principles

Révisés le 2026-09-23 (admin v2, cf. `docs/superpowers/specs/2026-09-23-admin-v2-design.md`) : le critère de réussite reste qu'en ouvrant l'admin, Ruslan sait en trois secondes ce qu'il doit faire, et que chaque action courante se fait en deux gestes au plus depuis un téléphone.

1. **Chaque dossier a une prochaine étape calculée**, jamais devinée à l'œil : une fonction pure (`src/lib/admin/next-step.ts`) est la seule source de vérité, et elle pilote à la fois l'accueil, la colonne « prochaine étape » de la liste et le panneau d'action de la fiche.
2. **Une action primaire par contexte**, qui porte l'icône de son action ; les actions secondaires restent sans icône, sauf WhatsApp et Appeler.
3. **La couleur de marque ne sert qu'au cliquable** : boutons primaires, liens, onglet actif, focus. Les statuts et les tons (succès, alerte, danger) restent des couleurs sémantiques, jamais la couleur de marque, et se lisent en point plus texte, sans bordure de bouton.
4. **Zéro perte** : optimistic UI seulement confirmée par le serveur ensuite ; toute erreur revient à l'état précédent avec un message actionnable ; les notes partent même si Ruslan quitte la page en pleine frappe.
5. **Mobile réel** : Ruslan traite des dossiers depuis son téléphone entre deux entraînements ; chaque écran admin fonctionne à 375 px, cibles tactiles 44 px, champs de saisie à 16 px pour ne pas déclencher le zoom automatique de l'iPhone, zoom utilisateur toujours autorisé.
6. **Un seul chrome, un seul vocabulaire de composants** : la même barre latérale sur ordinateur ou la même barre de navigation basse sur téléphone, les mêmes boutons, les mêmes points de statut, les mêmes fenêtres et notifications sur les six écrans admin.

## Accessibility & Inclusion

WCAG AA visé sur l'admin : contrastes 4,5:1 minimum sur texte (les jetons `--adm-*` sont vérifiés par `scripts/admin-mock/contrast.mjs`, clair et sombre), focus visibles, navigation clavier complète (raccourcis existants documentés), `prefers-reduced-motion` respecté. Thème clair ou sombre, suit l'appareil par défaut ; un choix manuel reste mémorisé sur l'appareil (cookie `mkr_admin_theme`), sans flash au chargement. Site public : idem plus alt text soignés (images de camp réelles).
