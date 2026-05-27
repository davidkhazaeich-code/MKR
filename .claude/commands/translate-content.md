---
description: Auto-translate recent FR content changes to EN via sub-agent
---

# /translate-content

When you add or modify FR content in `messages/fr/*.json`, in a page, or in a data file, invoke this command to propagate the changes to EN.

## Steps

1. **Detect FR diffs since last commit**:
   ```bash
   git diff HEAD~1 -- messages/fr/
   ```

2. **For each new or modified key**, dispatch a `general-purpose` sub-agent with:
   - The translation master prompt (see `docs/superpowers/specs/2026-05-27-i18n-fr-en-design.md` section 9.2)
   - The MKR glossary (`src/i18n/glossary.md`)
   - The FR diff to translate

3. **Update `messages/en/*.json`** with the new values.

4. **Run i18n-check**:
   ```bash
   node scripts/i18n-check.js
   ```

5. **Stage and report**:
   ```bash
   git add messages/en/ && git status
   ```

6. **Confirm with David** before committing.
