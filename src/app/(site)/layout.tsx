import Link from 'next/link'
import dynamic from 'next/dynamic'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const RevealObserver = dynamic(() => import('@/components/RevealObserver'))
const ScrollParallax = dynamic(() => import('@/components/ScrollParallax'))
const StickyMobileCTA = dynamic(() => import('@/components/StickyMobileCTA'))
const ScrollNav = dynamic(() => import('@/components/ScrollNav'))

/* RouteScrollReset est monte dans le root layout (src/app/layout.tsx) pour couvrir
   aussi /inscription et /admin/* (hors group `(site)`). Ne pas le remonter ici. */

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Link href="#main" className="skip-link">Aller au contenu principal</Link>
      <Nav />
      <main id="main">
        {children}
      </main>
      <Footer />
      <StickyMobileCTA />
      <RevealObserver />
      <ScrollParallax />
      <ScrollNav />
    </>
  )
}
