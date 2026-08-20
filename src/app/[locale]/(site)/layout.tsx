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

/* Regeneration horaire (ISR) de toutes les pages du site.
   Les sessions officielles sont calculees a l'execution (fenetre glissante,
   cf. data/sessions.ts) : sans revalidation, une page figee au build
   continuerait d'annoncer un camp deja parti jusqu'au prochain deploiement.
   Une heure suffit : la bascule se fait a une date, pas a une minute. */
export const revalidate = 3600

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
