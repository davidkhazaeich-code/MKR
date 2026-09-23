import Link from 'next/link'
import dynamic from 'next/dynamic'
import { setRequestLocale } from 'next-intl/server'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import InstagramFeed from '@/components/InstagramFeed'

const RevealObserver = dynamic(() => import('@/components/RevealObserver'))
const ScrollParallax = dynamic(() => import('@/components/ScrollParallax'))
const StickyMobileCTA = dynamic(() => import('@/components/StickyMobileCTA'))
const ScrollNav = dynamic(() => import('@/components/ScrollNav'))
/* Bulle WhatsApp : montee ICI et pas dans le layout racine, pour rester
   volontairement absente du tunnel /inscription (hors group `(site)`). */
const WhatsAppFloat = dynamic(() => import('@/components/WhatsAppFloat'))

/* RouteScrollReset est monte dans le root layout (src/app/layout.tsx) pour couvrir
   aussi /inscription et /admin/* (hors group `(site)`). Ne pas le remonter ici. */

/* Pages statiques, sans `revalidate`.
   Les sessions officielles sont calculees a l'execution (fenetre glissante,
   cf. data/sessions.ts), mais la fenetre ne tourne que le jour ou un camp
   demarre, quatre fois par an. Ce jour-la, le cron
   /api/cron/revalidate-sessions regenere tout le site.
   Ne pas remettre de regeneration horaire : du 2026-08-20 au 2026-09-23 elle
   reecrivait les ~76 pages FR + EN chaque heure (72 000 ecritures ISR par jour,
   le premier poste de la facture Vercel), pour un contenu identique. Le flux
   RSC sort dans un ordre different a chaque rendu : Vercel y voit une nouvelle
   version et facture l'ecriture complete. */

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  return (
    <>
      <Link href="#main" className="skip-link">Aller au contenu principal</Link>
      <Nav />
      <main id="main">
        {children}
      </main>
      {/* Feed Instagram "Suivez le camp" : site-wide, juste avant le footer */}
      <InstagramFeed />
      <Footer />
      <StickyMobileCTA />
      <WhatsAppFloat />
      <RevealObserver />
      <ScrollParallax />
      <ScrollNav />
    </>
  )
}
