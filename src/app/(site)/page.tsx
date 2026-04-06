import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Hero from '@/components/Hero'

const VideoSection = dynamic(() => import('@/components/VideoSection'), { ssr: true })
const Philosophie = dynamic(() => import('@/components/Philosophie'), { ssr: true })
const DestinationShowcase = dynamic(() => import('@/components/DestinationShowcase'), { ssr: true })
const Coaches = dynamic(() => import('@/components/Coaches'), { ssr: true })
const Sessions = dynamic(() => import('@/components/Sessions'), { ssr: true })
const Timeline = dynamic(() => import('@/components/Timeline'), { ssr: true })
const Testimonials = dynamic(() => import('@/components/Testimonials'), { ssr: true })
const Contact = dynamic(() => import('@/components/Contact'), { ssr: true })
const FAQ = dynamic(() => import('@/components/FAQ'), { ssr: true })
const CTAFinal = dynamic(() => import('@/components/CTAFinal'), { ssr: true })
const VoyageReveal = dynamic(() => import('@/components/VoyageReveal'))

export const metadata: Metadata = {
  title: "MKR Caucasian Camp | Camp d'Entrainement MMA & Lutte au Caucase",
  description: "Entraine-toi la ou naissent les champions. Camp MMA, lutte et Sambo de 3 semaines au Caucase. Coachs champions, hebergement et repas inclus. Sessions 2026.",
  alternates: { canonical: 'https://mkrcaucasiancamp.com/' },
}

export default function Home() {
  return (
    <>
      <link rel="preload" as="video" href="/videos/hero-mountains.mp4" type="video/mp4" />
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
