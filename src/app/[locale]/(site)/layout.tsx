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

/* RouteScrollReset est monte dans le root layout (src/app/layout.tsx) pour couvrir
   aussi /inscription et /admin/* (hors group `(site)`). Ne pas le remonter ici. */

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
      <RevealObserver />
      <ScrollParallax />
      <ScrollNav />
    </>
  )
}
