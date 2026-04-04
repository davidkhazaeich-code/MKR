import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import RevealObserver from '@/components/RevealObserver'
import ScrollParallax from '@/components/ScrollParallax'
import StickyMobileCTA from '@/components/StickyMobileCTA'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="skip-link">Aller au contenu principal</a>
      <Nav />
      <main id="main">
        {children}
      </main>
      <Footer />
      <StickyMobileCTA />
      <RevealObserver />
      <ScrollParallax />
    </>
  )
}
