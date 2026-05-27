import { test, expect } from '@playwright/test';

const PAGES = [
  { fr: '/', en: '/en' },
  { fr: '/le-camp', en: '/en/the-camp' },
  { fr: '/programme', en: '/en/program' },
  { fr: '/programme/lutte', en: '/en/program/wrestling' },
  { fr: '/programme/lutte-enfants', en: '/en/program/youth-wrestling' },
  { fr: '/programme/mma', en: '/en/program/mma' },
  { fr: '/sessions', en: '/en/sessions' },
  { fr: '/inscription', en: '/en/apply' },
  { fr: '/mkr-camp-2026', en: '/en/mkr-camp-2026' },
  { fr: '/familles', en: '/en/family' },
  { fr: '/sur-mesure', en: '/en/custom' },
  { fr: '/clubs-groupes', en: '/en/clubs-groups' },
  { fr: '/destinations', en: '/en/destinations' },
  { fr: '/destinations/dagestan', en: '/en/destinations/dagestan' },
  { fr: '/destinations/tchetchenie', en: '/en/destinations/chechnya' },
  { fr: '/temoignages', en: '/en/testimonials' },
  { fr: '/a-propos', en: '/en/about' },
  { fr: '/contact', en: '/en/contact' },
  { fr: '/faq', en: '/en/faq' },
  { fr: '/galerie', en: '/en/gallery' },
  { fr: '/logistique', en: '/en/logistics' },
  { fr: '/comment-ca-marche', en: '/en/how-it-works' },
  { fr: '/preparer-son-camp', en: '/en/prepare-your-camp' },
  { fr: '/guide-caucase', en: '/en/caucasus-guide' },
  { fr: '/blog', en: '/en/blog' },
  { fr: '/cgv', en: '/en/terms' },
  { fr: '/mentions-legales', en: '/en/legal' },
  { fr: '/politique-de-confidentialite', en: '/en/privacy' },
];

const BREAKPOINTS = [
  { name: 'mobile', width: 375, height: 720 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

for (const { fr, en } of PAGES) {
  for (const path of [fr, en]) {
    for (const bp of BREAKPOINTS) {
      test(`${path} @ ${bp.name} (${bp.width}px)`, async ({ page }) => {
        await page.setViewportSize({ width: bp.width, height: bp.height });
        const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
        expect(response?.status(), `${path} returned ${response?.status()}`).toBeLessThan(400);

        const overflow = await page.evaluate(() => ({
          scrollW: document.documentElement.scrollWidth,
          clientW: document.documentElement.clientWidth,
        }));
        expect(
          overflow.scrollW,
          `Horizontal overflow on ${path} @ ${bp.name}: scrollW=${overflow.scrollW} clientW=${overflow.clientW}`
        ).toBeLessThanOrEqual(overflow.clientW + 2);
      });
    }
  }
}
