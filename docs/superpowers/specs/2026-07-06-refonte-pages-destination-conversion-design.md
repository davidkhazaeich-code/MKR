# Refonte pages destination MKR — conversion, SEO, GEO (2026-07-06)

Demande David : reprendre de A à Z les pages de découverte (la zone, le camp, les spécificités) pour maximiser les conversions vers l'inscription, pour le trafic SEO et SEA entrant. UX/UI responsive, SEO max, GEO.

## Périmètre

6 pages, FR + EN :

| Page | Rôle funnel | LP ads |
|---|---|---|
| `/le-camp` | Découverte produit (le camp, tout compris) | EN AG-1 (`/en/the-camp`), FR |
| `/programme/lutte` | LP produit Lutte Daghestan | EN AG-2 (`/en/program/wrestling`), FR |
| `/programme/mma` | LP produit MMA Tchétchénie | EN AG-3 (`/en/program/mma`), FR |
| `/destinations/dagestan` | Découverte de la zone (Lutte) | SEO + OG nettoyée ads |
| `/destinations/tchetchenie` | Découverte de la zone (MMA) | SEO |
| `/destinations` (hub) | Aiguillage 2 destinations | SEO |

Hors périmètre : blog (reste tel quel, y compris l'article Khabib conservé par décision David du 2026-07-05), homepage, pages transactionnelles.

## Stratégie conversion

1. **Message match ads → LP.** Les accroches posées dans Google Ads (Russian Visa Included, Flights and Transfers, Housing and Meals, Local Coaching, Limited Spots, No Upfront Payment, Selection Based Entry) doivent être visibles au-dessus de la ligne de flottaison. Nouveau bandeau `KeyFactsBand` sous le hero.
2. **Qualification self-select.** Nouveau bloc `AudienceFit` (« C'est pour toi si / Ce n'est pas pour toi si ») : propage la règle d'entrée David 2026-06-20 (minimum 1 an de pratique + vraie base au sol ; MMA = Avancé 5+ ans), assume la sélection comme un argument premium (= « Selection Based Entry » des annonces). Remplace le discours « ouvert à tous, débutants motivés » (contradiction connue, cf. memory `project_mkr_entry_rule_1an_base_sol`).
3. **Objections traitées sur place.** Nouveau bloc `PageFaq` (accordéon + JSON-LD FAQPage par page) : sécurité, visa, langue, niveau, « peut-on débarquer sans structure » (angle EN : you can't just fly in), paiement après visio.
4. **Prix transparent tôt.** Nouveau bandeau `PriceAnchor` : « à partir de X €/pers » dérivé de `data/pricing.ts` via `lib/pricing-copy.ts` (aucun chiffre en dur), prochaine session dynamique via `getNextSession()`, places restantes live (`PlacesRestantes` variant dual).
5. **Process sans friction.** Nouveau bloc `ProcessStrip` 4 étapes : candidature gratuite 5 min → visio avec Ruslan → MKR gère visa + vol intérieur → départ. Rappel « aucun paiement avant validation ».
6. **Preuve.** Vraies photos (galerie-real, lot Akhmat, photos Ruslan) prioritaires sur les visuels IA. Témoignages existants conservés. Section écurie/top mondial conservée sur /programme/mma (décision photos David 2026-05-23).
7. **CTA.** SectionCTA corrigé (bug : `next/link` brut → les CTA des pages EN renvoyaient vers les routes FR ; passage au `Link` i18n, pattern Hero/Sessions). CTA WhatsApp secondaire sur les pages programme (audience combat sports). StickyMobileCTA existant conservé.

## Règle noms de champions (aligne les décisions David)

- **Khabib : nulle part** (hors article blog conservé).
- **Pages LP ads (le-camp, programme/lutte, destinations/dagestan, hub)** : aucun nom de champion (policy Google Ads, dans la continuité du commit 1fb37ab). L'héritage passe par les chiffres (médailles olympiques, champions UFC « en série », ratio par habitant).
- **/programme/mma + /destinations/tchetchenie** : Akhmat Fight Club reste (lieu réel du camp). La section preuve sociale de /programme/mma garde sa photo réelle ; le nom reste uniquement en légende factuelle.
- Swap image : `pads-direct-kadyrov.webp` remplacée sur /programme/mma par une photo sans marqueur politique (réduit la surface policy, zéro coût).

## Nouveaux composants (globals.css : section dédiée en fin de fichier)

| Composant | Classes | Usage |
|---|---|---|
| `KeyFactsBand` | `.kfb-*` | Bandeau 4-5 faits inclus, icônes, sous le hero |
| `AudienceFit` | `.afit-*` | 2 colonnes pour qui / pas pour qui |
| `PageFaq` | `.pfaq-*` | FAQAccordion + JSON-LD FAQPage inline |
| `ProcessStrip` | `.pstrip-*` | 4 étapes compactes numérotées |
| `PriceAnchor` | `.panchor-*` | Prix « à partir de », session, places live, CTA |
| `UpdatedAt` | `.updated-at` | Datestamp visible (freshness GEO) |

Tous server components sauf besoin client (PlacesRestantes déjà client). Textes 100 % i18n (`messages/{fr,en}`), zéro hardcode TSX. Icônes existantes (`Icon.tsx`).

## SEO / GEO par page

- Titles < 60, descriptions < 160, mot-clé en tête (camp de lutte Daghestan, camp MMA Tchétchénie, stage lutte, Dagestan training camp...).
- TldrBox conservée et rafraîchie (règle d'entrée, prix d'appel, prochaine session).
- JSON-LD : BreadcrumbList (conservé), FAQPage par page (nouveau), SportsActivityLocation inchangé (layout).
- Datestamp « Mis à jour » visible sur les 5 pages de contenu.
- `llms.txt` + `llms-en.txt` resync (règle d'entrée, discours niveau).
- Maillage interne max 4-5 liens contextuels par page.
- OG images : COPY mis à jour si les titres changent.

## Propagation règle d'entrée (hors pages refondues)

- `messages/{fr,en}/data.faq.json` : 3 réponses « ouvert à tous / débutants » réécrites.
- `messages/{fr,en}/preparer-son-camp.json` : section niveau.
- `messages/{fr,en}/programme.json` : `root.pour_qui` (Amateur sérieux : 1 an minimum + base au sol).

## QA

`node scripts/i18n-check.js` · `npx tsc --noEmit` · `next build` · greps interdits (khabib hors blog, em dash, emoji, ampersand, « débutants motivés ») · captures Playwright 375/768/1440 FR+EN sur les 6 pages · commits ciblés (fichiers d'une autre session en attente : VisioBooking.tsx, globals.css, package-lock.json — à commiter séparément d'abord si toujours présents).
