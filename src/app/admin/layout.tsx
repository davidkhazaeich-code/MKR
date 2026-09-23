import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import { Teko, Barlow, Barlow_Condensed } from 'next/font/google'
import { ToastProvider } from '@/components/admin/ui/Toast'
import './admin.css'

// Root layout pour /admin/* (hors [locale]).
// Depuis le refactor i18n (commit fc65760, 2026-05-27), le root layout du site
// vit dans [locale]/layout.tsx. /admin reste 100% FR et hors [locale], donc
// il a besoin de son propre root layout avec html/body + les variables CSS
// next/font sur <html>, sinon admin.css tombe sur les polices de repli.
//
// Theme : cookie mkr_admin_theme ('light' | 'dark', ecrit par le selecteur
// d'apparence). Absent = Auto : pas d'attribut, admin.css suit
// prefers-color-scheme. Lu cote serveur : aucun flash au chargement.

const THEME_COOKIE = 'mkr_admin_theme'

const teko = Teko({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-teko',
  display: 'swap',
})

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal'],
  variable: '--font-barlow',
  display: 'swap',
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-barlow-condensed',
  display: 'swap',
})

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  manifest: '/admin/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'MKR Admin', statusBarStyle: 'black-translucent' },
  icons: { apple: '/apple-icon.png' },
}

// Pas de maximumScale : le zoom utilisateur reste autorise.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#121214',
  colorScheme: 'light dark',
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const stored = (await cookies()).get(THEME_COOKIE)?.value
  const theme = stored === 'light' || stored === 'dark' ? stored : undefined

  return (
    <html
      lang="fr"
      data-theme={theme}
      suppressHydrationWarning
      className={`${teko.variable} ${barlow.variable} ${barlowCondensed.variable}`}
    >
      <body>
        <div className="adm-root">
          <ToastProvider>{children}</ToastProvider>
        </div>
      </body>
    </html>
  )
}
