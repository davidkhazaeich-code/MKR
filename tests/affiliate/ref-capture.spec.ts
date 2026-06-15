import { test, expect } from '@playwright/test'

/**
 * Flux d'attribution affiliation : ?ref valide -> cookie mkr_ref pose + redirection vers URL propre.
 *
 * PREREQUIS :
 *   - Serveur dev ou preview doit tourner sur baseURL (http://localhost:3000 par defaut,
 *     surcharger via PLAYWRIGHT_BASE_URL=https://preview.xxx.vercel.app).
 *   - Playwright browsers installes : `npx playwright install chromium`.
 *
 * EXECUTION :
 *   npm run test:affiliate
 *
 * COMPORTEMENT (proxy.ts) :
 *   ?ref=<code> reconnu -> pose cookie mkr_ref = matched.code (uppercase), valide 90 jours,
 *   httpOnly: false, SameSite: Lax -> PUIS redirige (307) vers la meme URL sans le ?ref.
 *   Resultat : le visiteur atterrit sur une URL propre (mkrcamp.com/) avec le cookie en place.
 *   Ex : ?ref=paoloz -> cookie mkr_ref=PAOLOZ + URL finale sans ?ref.
 *   Un ?ref inconnu/inactif est ignore : pas de cookie, pas de redirection.
 *
 * PRE-REMPLISSAGE FORM :
 *   Le cookie mkr_ref est lu cote client par InscriptionLayout pour pre-remplir le champ
 *   "Code de recommandation" (Step 1). Atteindre ce champ demande de passer le Step 0 (tunnel),
 *   ce qui rendrait le test fragile. On verifie ici le transport du cookie jusqu'a /inscription ;
 *   le pre-remplissage du champ est couvert par le comportement du composant.
 */

test.describe('Affiliation ?ref', () => {
  test('ref valide pose le cookie mkr_ref et nettoie l URL (sans ?ref)', async ({ page, context }) => {
    // Playwright suit automatiquement la redirection 307 vers l'URL propre.
    await page.goto('/?ref=paoloz')

    const cookies = await context.cookies()
    const ref = cookies.find((c) => c.name === 'mkr_ref')
    expect(ref?.value).toBe('PAOLOZ')

    // L'URL finale ne doit plus contenir le parametre ref.
    expect(page.url()).not.toContain('ref=')
  })

  test('ref inconnu ne pose pas de cookie', async ({ page, context }) => {
    await page.goto('/?ref=codebidon123')
    const cookies = await context.cookies()
    expect(cookies.find((c) => c.name === 'mkr_ref')).toBeUndefined()
  })

  test('le cookie mkr_ref persiste sur /inscription (transport du cookie)', async ({ page, context }) => {
    await page.goto('/?ref=paoloz')
    await page.goto('/inscription')

    const cookies = await context.cookies()
    const ref = cookies.find((c) => c.name === 'mkr_ref')
    expect(ref?.value).toBe('PAOLOZ')
  })
})
