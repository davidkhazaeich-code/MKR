import type { Metadata, Viewport } from 'next'
import { Teko, Barlow, Barlow_Condensed } from 'next/font/google'
import { ToastProvider } from '@/components/admin/ui/Toast'
import './admin.css'

// Root layout pour /admin/* (hors [locale]).
// Depuis le refactor i18n (commit fc65760, 2026-05-27), le root layout du site
// vit dans [locale]/layout.tsx. /admin reste 100% FR et hors [locale], donc
// il a besoin de son propre root layout avec html/body + les variables CSS
// next/font sur <html>, sinon admin.css tombe sur les fallbacks system-ui /
// Bebas Neue et toute la typographie casse.

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
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0a0b',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
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
