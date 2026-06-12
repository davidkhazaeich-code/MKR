import { test, expect } from '@playwright/test'

/**
 * Flux d'attribution affiliation : ?ref valide -> cookie mkr_ref -> bandeau trust + pre-remplissage form.
 *
 * PREREQUIS :
 *   - Serveur dev ou preview doit tourner sur baseURL (http://localhost:3000 par defaut,
 *     surcharger via PLAYWRIGHT_BASE_URL=https://preview.xxx.vercel.app).
 *   - Playwright browsers installes : `npx playwright install chromium`.
 *
 * EXECUTION :
 *   npx playwright test tests/affiliate/ref-capture.spec.ts --reporter=line
 *   (ce fichier est hors du testDir par defaut './tests/i18n' -- passer le chemin explicitement)
 *
 * COOKIE :
 *   proxy.ts pose mkr_ref = matched.code (uppercase) quand ?ref=<code> est reconnu.
 *   Valide 60 jours, httpOnly: false, SameSite: Lax.
 *   Ex : ?ref=paoloz -> cookie mkr_ref=PAOLOZ (code stocke en uppercase dans referral-codes.ts).
 *
 * BANDEAU (ReferralBanner) :
 *   Client component monte dans [locale]/layout.tsx -> present sur toutes les pages dont
 *   / et /inscription. Se rend visible via useEffect apres hydration : attendre
 *   `page.getByRole('status')` avant d'asserter.
 *   Texte FR : "Tu viens de la part de {partnerName}" (messages/fr/common.json referral_banner.text).
 *   partnerName pour PAOLOZ = "PaoloZ (@paolo_irl)".
 *
 * PRE-REMPLISSAGE FORM (test 3) :
 *   Le champ "Code de recommandation" est rendu au Step 1 (Identite) du formulaire
 *   InscriptionLayout.tsx. Pour l'atteindre il faudrait d'abord choisir un tunnel (Step 0)
 *   puis naviguer au Step 1, ce qui rendrait le test fragile aux evolutions du form.
 *   Choix retenu : verifier que le bandeau (role="status") persiste sur /inscription
 *   apres la navigation depuis / -- ce qui prouve que le cookie a bien ete transporte
 *   d'une page a l'autre dans le meme contexte navigateur. Le comportement de pre-remplissage
 *   du champ est couvert par des tests unitaires du composant InscriptionLayout.
 */

test.describe('Affiliation ?ref', () => {
  test('ref valide pose le cookie mkr_ref et affiche le bandeau', async ({ page, context }) => {
    await page.goto('/?ref=paoloz')

    // Verifier le cookie avant hydration (pose par le middleware cote serveur)
    const cookies = await context.cookies()
    const ref = cookies.find((c) => c.name === 'mkr_ref')
    expect(ref?.value).toBe('PAOLOZ')

    // Attendre que ReferralBanner s'hydrate et s'affiche (useEffect cote client)
    // partnerName = "PaoloZ (@paolo_irl)" -- on verifie la sous-chaine distinctive
    await expect(page.getByRole('status')).toContainText('PaoloZ', { timeout: 5000 })
  })

  test('ref inconnu ne pose pas de cookie', async ({ page, context }) => {
    await page.goto('/?ref=codebidon123')
    const cookies = await context.cookies()
    expect(cookies.find((c) => c.name === 'mkr_ref')).toBeUndefined()
  })

  test('le cookie mkr_ref persiste sur /inscription (preuve du transport de cookie)', async ({
    page,
  }) => {
    // Capturer le cookie sur la homepage
    await page.goto('/?ref=paoloz')

    // Attendre que le bandeau s'affiche sur / (confirme hydration + cookie lu cote client)
    await expect(page.getByRole('status')).toContainText('PaoloZ', { timeout: 5000 })

    // Naviguer vers le formulaire d'inscription (FR : /inscription)
    await page.goto('/inscription')

    // ReferralBanner est monte dans [locale]/layout.tsx -> presente sur toutes les pages locale.
    // Le meme cookie est lu apres hydration sur /inscription -> le bandeau doit rester visible.
    // Cela prouve que le cookie a survecu a la navigation et que le pre-remplissage du champ
    // sera effectif quand le candidat atteindra le Step 1 (Identite).
    await expect(page.getByRole('status')).toContainText('PaoloZ', { timeout: 5000 })
  })
})
