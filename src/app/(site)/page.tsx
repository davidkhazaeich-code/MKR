import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Hero from '@/components/Hero'
import VideoSection from '@/components/VideoSection'
import Philosophie from '@/components/Philosophie'
import DestinationShowcase from '@/components/DestinationShowcase'
import Coaches from '@/components/Coaches'
import Sessions from '@/components/Sessions'
import Timeline from '@/components/Timeline'
import Testimonials from '@/components/Testimonials'
import Contact from '@/components/Contact'
import FAQ from '@/components/FAQ'
import CTAFinal from '@/components/CTAFinal'

const VoyageReveal = dynamic(() => import('@/components/VoyageReveal'))

export const metadata: Metadata = {
  title: "MKR Caucasian Camp | Camp d'Entrainement MMA & Lutte au Caucase",
  description: "Entraine-toi la ou naissent les champions. Camp MMA, lutte et Sambo de 3 semaines au Caucase. Coachs champions, hebergement et repas inclus. Sessions 2026.",
  alternates: { canonical: 'https://mkrcaucasiancamp.com/' },
}

export default function Home() {
  return (
    <>
      <link rel="preload" as="image" href="/images/environment/dagestan-panorama.webp" />
      <Hero />
      <VideoSection />
      <Philosophie />
      <DestinationShowcase />
      <Testimonials />
      <Sessions />
      <Timeline />
      <Coaches />
      <VoyageReveal />
      <Contact />
      <FAQ />
      <CTAFinal />
    </>
  )
}
