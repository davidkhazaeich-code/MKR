// Manifeste de l'admin installable (ecran d'accueil du telephone de Ruslan).
// Le chemin contient un point : le proxy (src/proxy.ts, matcher sans les
// chemins a extension) ne s'y applique pas, il repond donc sans cookie.
export const dynamic = 'force-static'
export function GET() {
  return Response.json({
    name: 'MKR Admin', short_name: 'MKR Admin', start_url: '/admin', scope: '/admin', display: 'standalone',
    background_color: '#121214', theme_color: '#121214', lang: 'fr',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }, { headers: { 'Content-Type': 'application/manifest+json' } })
}
