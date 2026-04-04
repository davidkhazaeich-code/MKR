import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import VideoSection from '@/components/VideoSection'
import Philosophie from '@/components/Philosophie'
import Coaches from '@/components/Coaches'
import Sessions from '@/components/Sessions'
import Timeline from '@/components/Timeline'
import Testimonials from '@/components/Testimonials'
import VoyageReveal from '@/components/VoyageReveal'
import Contact from '@/components/Contact'
import FAQ from '@/components/FAQ'
import CTAFinal from '@/components/CTAFinal'
import Footer from '@/components/Footer'
import RevealObserver from '@/components/RevealObserver'
import ScrollParallax from '@/components/ScrollParallax'

export default function Home() {
  return (
    <>
      <a href="#main" className="skip-link">Aller au contenu principal</a>
      <Nav />
      <main id="main">
        <Hero />
        <VideoSection />
        <Philosophie />
        <Coaches />
        <Sessions />
        <Timeline />
        <Testimonials />
        <VoyageReveal />
        <Contact />
        <FAQ />
        <CTAFinal />
      </main>
      <Footer />
      <RevealObserver />
      <ScrollParallax />
    </>
  )
}
