@AGENTS.md
@SITEMAP.md

## Conventions emails (David, 2026-07-09) — OBLIGATOIRE

Tout email MKR (candidat, lead, interne) respecte ces règles :

1. **Jamais de tiret cadratin** dans sujets et corps. Séparateur : « · » (comme les emails visio).
2. **Photos dans les emails candidat/lead** : JPEG uniquement (compat Outlook, pas de webp), hébergées sur le site dans `public/images/email/` (1120px de large = 2x retina pour 560px), servies en URL absolue `${SITE_URL}/images/email/...`. Portrait Ruslan : `images/ruslan/ruslan-portrait-chemise-noire.jpg`.
   **Vraies photos d'abord** (David, 2026-07-09) : puiser dans `public/images/galerie-real/` (photos réelles du camp) ou `MKR-PHOTOS-FINAL-4K/` côté client — jamais les visuels IA léchés de `action/`/`environment/` pour les emails. Si génération nécessaire (nanobanana), exiger un rendu réaliste avec imperfections (luminosité imparfaite, cadrage amateur, grain).
3. **Dark + light mode** : design sombre de marque FIXE (fond #000/#111110, orange #C84B31), verrouillé par `bgcolor` + couleurs inline + `meta color-scheme` + gardes `prefers-color-scheme` avec `!important` (voir `src/lib/guide-email.ts`, le modèle de référence).
4. **Responsive** : table 560px max-width fluide, media query < 480px (padding, taille de texte, boutons full-width).
5. **Bilingue FR/EN** systématique, sélection par `submission_language`. Français AVEC accents corrects (é, à, ç…) dans tout contenu visible — les commentaires code restent ASCII.
6. **Serverless : jamais de fire-and-forget nu** dans une route API. Envois post-réponse via `after()` de `next/server` (bug historique corrigé sur guide-caucase), sinon `await`.
7. **Logo d'en-tête : la couleur du logo suit la couleur du BLOC qui le porte** (David, 2026-08-26). Les noms de fichiers décrivent l'encre du logo, pas sa destination, et ça se lit à l'envers : `logo-dark.png` a le texte « KR / CAUCASIAN CAMP » en **noir** (fond clair uniquement), `logo-white.png` l'a en **blanc** (fond sombre uniquement). Sur fond noir, `logo-dark` ne laisse voir que la montagne orange, le reste disparaît.
   - Fond noir / sombre → `logo-white.png` : `email-layout.ts` (shell partagé : relance de repositionnement, rappels de paiement, pré-départ, guide) et `souvenir-notify.tsx`.
   - Bandeau blanc dédié → `logo-dark.png` : `visio-email.ts` et `cancel-page.ts`, qui posent un `background:#ffffff` explicite pour survivre aux clients qui forcent le thème clair.
   - **Avant de changer un logo d'email, lire la couleur du `<td>` parent**, pas le nom du template. Contrôle : rendre l'email et mesurer l'amplitude de luminance des pixels du logo (script type `.tmp/render-emails-logo.mts` + `.tmp/shot-emails-logo.mjs`), une amplitude sous ~60 = invisible.
8. **Porte de sortie WhatsApp** (David, 2026-08-21) : tout email candidat porte un bloc « une question ? Écris à Ruslan sur WhatsApp », en position **secondaire** (jamais au-dessus du CTA principal), avec un message pré-rempli propre au contexte. Helpers : `renderWhatsAppBlock` / `renderWhatsAppButtonHtml` / `whatsAppTextLine` de `src/lib/email-layout.ts`, numéro via `whatsappUrl()` de `src/data/site.ts` (jamais de `wa.me` en dur). Le bloc doit apparaître dans le HTML **et** dans la version `text`. Glyphe = PNG à fond vert plein (`/images/email/whatsapp-glyph.png`), jamais un SVG (Gmail et Outlook ne les rendent pas) ni un PNG transparent (alpha mal gérée par Outlook/Word).

## Cache et traductions (David, 2026-09-23), OBLIGATOIRE

1. **Jamais de `revalidate` horaire** sur un layout ou une page publique. Les pages sont statiques ; la bascule des sessions passe par le cron `/api/cron/revalidate-sessions` (SITEMAP.md, section du 2026-09-23). La régénération horaire réécrivait les ~76 pages chaque heure : 72 000 écritures ISR par jour, premier poste de la facture Vercel.
2. **Composant `'use client'` qui lit un nouveau namespace** : l'ajouter dans `src/i18n/client-namespaces.json`. Sinon `npm run build` échoue (`scripts/i18n-client-check.mjs`), et sans ce contrôle le texte s'afficherait en clé brute.
3. **Rien de lourd inliné dans le HTML** (data URI, SVG calculé au rendu) : un fichier dans `public/`. La carte du monde pesait 2,2 Mo par page d'accueil.
