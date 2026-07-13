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

1. **L'état d'abord** : chaque dossier montre son statut, ses transitions possibles et son historique sans clic supplémentaire. Les actions irréversibles se confirment, jamais les autres.
2. **Zéro perte** : optimistic UI seulement quand le serveur confirme derrière ; toute erreur revient à l'état précédent avec un message actionnable.
3. **Densité utile** : tableaux denses, scan rapide, filtres persistants. Pas de cartes décoratives.
4. **Mobile réel** : Ruslan traite des dossiers depuis son téléphone ; chaque écran admin fonctionne à 375px, cibles tactiles 44px.
5. **Une seule vocabulaire de composants** : mêmes badges, mêmes boutons, mêmes toasts sur tous les écrans admin.

## Accessibility & Inclusion

WCAG AA visé sur l'admin : contrastes 4.5:1 minimum sur texte, focus visibles, navigation clavier complète (raccourcis existants documentés), `prefers-reduced-motion` respecté. Site public : idem plus alt text soignés (images de camp réelles).
