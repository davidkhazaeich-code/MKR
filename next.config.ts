import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// CSP : on est restrictif mais on autorise ce que le site utilise reellement.
// - 'self' partout sauf img/font/connect car on a besoin de fonts Google + images CDN Vercel
// - 'unsafe-inline' pour script-src : Next.js injecte des scripts inline pour hydration
// - app.cal.com autorise dans script-src + connect-src + frame-src : embed Cal.com inline
//   (visio de selection en fin de candidature, composant VisioBooking sur /inscription).
//   Sans ces autorisations, le script embed.js et l'iframe app.cal.com sont bloques
//   et le calendrier ne s'affiche pas (boite vide).
// - frame-src : ce que MKR a le droit d'embarquer (Cal.com). A ne pas confondre avec...
// - frame-ancestors 'none' : empeche les AUTRES sites d'embarquer MKR (anti-clickjacking,
//   redondant avec X-Frame-Options DENY mais CSP wins).
// - Google Ads / gtag.js (AW-18296696470) : googletagmanager.com sert gtag.js (script-src)
//   et recoit la mesure (connect-src) ; google-analytics + googleadservices + doubleclick
//   pour la mesure/conversions (connect-src) et le conversion linker (frame-src). Les pixels
//   de conversion passent par img-src 'https:' (deja large). pagead2.googlesyndication.com
//   recoit les hits ccm/collect de gtag (connect-src) + remarketing (script-src). Sans ces
//   origines, la balise est bloquee et aucune conversion ne remonte. Voir src/lib/gtag.ts.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://app.cal.com https://www.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' https://fonts.gstatic.com data:",
  "connect-src 'self' https://bgwvrzgnoqlqqrvflwav.supabase.co https://app.cal.com https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com https://www.google.com",
  "media-src 'self'",
  "frame-src 'self' https://app.cal.com https://cal.com https://td.doubleclick.net https://www.googletagmanager.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join('; ')

const nextConfig: NextConfig = {
  // @react-pdf/renderer (contrat PDF admin) : jamais bundlé côté serveur
  // (Turbopack), résolu depuis node_modules au runtime. Voir
  // docs/superpowers/specs/2026-07-03-mkr-contrat-validation-design.md
  serverExternalPackages: ['@react-pdf/renderer'],
  // Les routes contrat lisent fonts + logo via fs depuis public/ (pattern OG).
  // On force leur inclusion dans le bundle serverless Vercel (ceinture+bretelles).
  outputFileTracingIncludes: {
    '/api/admin/candidature/[id]/contract/preview': ['./public/og-fonts/**', './public/logo-dark.png'],
    '/api/admin/candidature/[id]/contract/send': ['./public/og-fonts/**', './public/logo-dark.png'],
  },
  async redirects() {
    return [
      {
        source: '/guide-dagestan',
        destination: '/guide-caucase',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: CSP },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ]
  },
};

export default withNextIntl(nextConfig);
