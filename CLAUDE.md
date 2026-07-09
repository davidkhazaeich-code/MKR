@AGENTS.md
@SITEMAP.md

## Conventions emails (David, 2026-07-09) — OBLIGATOIRE

Tout email MKR (candidat, lead, interne) respecte ces règles :

1. **Jamais de tiret cadratin** dans sujets et corps. Séparateur : « · » (comme les emails visio).
2. **Photos dans les emails candidat/lead** : JPEG uniquement (compat Outlook, pas de webp), hébergées sur le site dans `public/images/email/` (1120px de large = 2x retina pour 560px), servies en URL absolue `${SITE_URL}/images/email/...`. Portrait Ruslan : `images/ruslan/ruslan-portrait-chemise-noire.jpg`.
3. **Dark + light mode** : design sombre de marque FIXE (fond #000/#111110, orange #C84B31), verrouillé par `bgcolor` + couleurs inline + `meta color-scheme` + gardes `prefers-color-scheme` avec `!important` (voir `src/lib/guide-email.ts`, le modèle de référence).
4. **Responsive** : table 560px max-width fluide, media query < 480px (padding, taille de texte, boutons full-width).
5. **Bilingue FR/EN** systématique, sélection par `submission_language`. Français AVEC accents corrects (é, à, ç…) dans tout contenu visible — les commentaires code restent ASCII.
6. **Serverless : jamais de fire-and-forget nu** dans une route API. Envois post-réponse via `after()` de `next/server` (bug historique corrigé sur guide-caucase), sinon `await`.
