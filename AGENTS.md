<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes, APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:bilingual-content-rule -->
# 🌐 RÈGLE BILINGUE FR + EN (NON NÉGOCIABLE)

Ce site est **bilingue FR (canonical) + EN** depuis 2026-05-27 via next-intl. **À chaque modification de contenu, tu DOIS propager FR → EN sinon la CI fail et l'EN dérive.**

## Workflow obligatoire à chaque modif de contenu

| Type de modif | Action EN obligatoire |
|---|---|
| Ajout/modif d'une clé dans `messages/fr/<ns>.json` | Ajouter/modifier la clé miroir dans `messages/en/<ns>.json` (manuellement OU via `claude /translate-content`) |
| Nouveau texte dans un composant `.tsx` | ⛔ Interdit en hardcoded. Extraire dans `messages/fr/<ns>.json` → propager EN |
| Modif copy dans `src/data/*.ts` | Vérifier si la copy est déjà migrée vers `messages/{fr,en}/data.*.json` ; si oui, modifier les 2 ; si non, migrer puis propager |
| Nouvelle page sous `src/app/[locale]/(site)/` | Créer FR + EN namespaces dans `messages/{fr,en}/<page>.json` + ajouter slug EN dans `src/i18n/routing.ts` (pathnames) + sitemap |
| Modif `docs/guide-caucase/guide.html` (PDF FR) | Modifier aussi `docs/guide-caucase/guide.en.html` + rebuild PDF EN : `./docs/guide-caucase/build.sh all` |
| Nouveau slug URL | Ajouter dans `src/i18n/routing.ts` `pathnames` map (FR↔EN) + sitemap se met à jour automatiquement |

## Glossaire EN locked

Lire `src/i18n/glossary.md` AVANT toute traduction EN. Règles clés :
- **Daghestan → Dagestan** (drop le H, règle critique SEO)
- **Tchétchénie → Chechnya**
- **Lutte → Wrestling** (jamais "fight" ou "combat")
- **MMA reste MMA** (acronyme universel, ne jamais expand)
- **Coach** (jamais "trainer"), **Camp** (jamais "course" ou "stage")
- **Tagline locked** : "L'immersion au milieu des champions" → "Immersion among champions"
- **Form labels** : Prénom→First name, Niveau→Level, Date de naissance→Date of birth, etc. (cf. §7 glossaire)
- **No em dash** `—` (utiliser `,` `.` ou ` · `), **no ampersand** `&` (écrire "and"), **no emoji**
- ICU placeholders et balises JSX/HTML préservés VERBATIM

## Filets de sécurité actifs

1. **CI GitHub Action** `i18n-coverage.yml` : `git push` qui touche `messages/**` **fail le build** si EN manque une clé FR. Tu seras bloqué.
2. **Slash command** `claude /translate-content` : detecte les diffs FR depuis le dernier commit, dispatch un sub-agent traducteur avec le master prompt + glossaire, propage en EN.
3. **Script validateur** : `node scripts/i18n-check.js` valide la parité 2557 clés FR vs EN (lancer en local avant push).
4. **Master prompt traducteur** : `docs/superpowers/specs/2026-05-27-i18n-fr-en-design.md` §9.2 — chaque sub-agent traducteur l'utilise.

## Réflexe Claude à chaque modif site

```
1. Modifier FR (messages/fr/*.json ou data/*.ts)
2. node scripts/i18n-check.js   → si fail → propager EN
3. claude /translate-content    → auto-traduction des diffs
4. node scripts/i18n-check.js   → doit passer (2557 clés ok)
5. rm -rf .next && npx next build → smoke check
6. git push origin main         → Vercel auto-deploy
```

**Admin reste 100% FR** : `proxy.ts` middleware bloque `/en/admin/*`. Pas de traduction admin.

Détails complets : voir SITEMAP.md section "BREAKING 2026-05-27 (site bilingue FR + EN)".
<!-- END:bilingual-content-rule -->
