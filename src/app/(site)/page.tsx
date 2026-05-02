import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Hero from '@/components/Hero'
import HomeScroller, { type ScrollSection } from '@/components/HomeScroller'

const VideoSection = dynamic(() => import('@/components/VideoSection'), { ssr: true })
const AudienceSwitcher = dynamic(() => import('@/components/AudienceSwitcher'), { ssr: true })
const FacilitatorBand = dynamic(() => import('@/components/FacilitatorBand'), { ssr: true })
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
  title: "Camp MMA et Lutte au Daghestan | MKR Caucasian Camp",
  description: "Entraîne-toi là où naissent les champions. Camp MMA et Lutte (adultes et enfants) de 1 à 3 semaines au Daghestan. 9 coachs expérimentés, vol intérieur Istanbul-Makhachkala inclus. Sessions 2026.",
  alternates: { canonical: 'https://mkrcamp.com/' },
}

const SECTIONS: ScrollSection[] = [
  { id: 'hero', label: 'Accueil' },
  { id: 'video', label: 'Le concept' },
  { id: 'audience', label: 'Pour qui' },
  { id: 'facilitator', label: 'On organise tout' },
  { id: 'philosophie', label: 'Pourquoi le Caucase' },
  { id: 'destinations', label: 'Le Daghestan' },
  { id: 'testimonials', label: 'Témoignages' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'timeline', label: 'Le parcours' },
  { id: 'coaches', label: 'Coachs' },
  { id: 'voyage', label: 'Voyage' },
  { id: 'contact-home', label: 'Contact' },
  { id: 'faq', label: 'FAQ' },
  { id: 'cta-final', label: 'Prochain camp' },
]

export default function Home() {
  return (
    <>
      <link rel="preload" as="video" href="/videos/hero-mountains.mp4" type="video/mp4" />
      <HomeScroller sections={SECTIONS} />
      <div id="hero" className="hs-anchor"><Hero /></div>
      <div id="video" className="hs-anchor"><VideoSection /></div>
      <div id="audience" className="hs-anchor"><AudienceSwitcher /></div>
      <div id="facilitator" className="hs-anchor"><FacilitatorBand /></div>
      <div id="philosophie" className="hs-anchor"><Philosophie /></div>
      <div id="destinations" className="hs-anchor"><DestinationShowcase /></div>
      <div id="testimonials" className="hs-anchor"><Testimonials /></div>
      <div id="sessions" className="hs-anchor"><Sessions /></div>
      <div id="timeline" className="hs-anchor"><Timeline /></div>
      <div id="coaches" className="hs-anchor"><Coaches /></div>
      <div id="voyage" className="hs-anchor"><VoyageReveal /></div>
      <div id="contact-home" className="hs-anchor"><Contact /></div>
      <div id="faq" className="hs-anchor"><FAQ /></div>
      <div id="cta-final" className="hs-anchor"><CTAFinal /></div>
    </>
  )
}
