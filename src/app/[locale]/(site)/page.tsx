import dynamic from 'next/dynamic'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import Hero from '@/components/Hero'
import { localizedMetadata } from '@/lib/i18n-helpers'
import type { Locale } from '@/i18n/routing'
import { getAntoineParcoursProps } from '@/data/antoine-parcours'

const AudienceSwitcher = dynamic(() => import('@/components/AudienceSwitcher'), { ssr: true })
const VideoSection = dynamic(() => import('@/components/VideoSection'), { ssr: true })
const FacilitatorBand = dynamic(() => import('@/components/FacilitatorBand'), { ssr: true })
const Philosophie = dynamic(() => import('@/components/Philosophie'), { ssr: true })
const Sessions = dynamic(() => import('@/components/Sessions'), { ssr: true })
const Timeline = dynamic(() => import('@/components/Timeline'), { ssr: true })
const Testimonials = dynamic(() => import('@/components/Testimonials'), { ssr: true })
const FAQ = dynamic(() => import('@/components/FAQ'), { ssr: true })
const CTAFinal = dynamic(() => import('@/components/CTAFinal'), { ssr: true })
const VoyageReveal = dynamic(() => import('@/components/VoyageReveal'))
const VerticalVideoSplit = dynamic(() => import('@/components/VerticalVideoSplit'), {
  loading: () => <div style={{ minHeight: 600 }} aria-hidden />,
})

const HOME_META = {
  fr: {
    title: "Camp MMA Tchétchénie et Lutte Daghestan | MKR Caucasian",
    description: "Entraîne-toi là où naissent les champions. Lutte au Daghestan, MMA en Tchétchénie. 1 à 3 semaines au Caucase, 4 sessions par an, vol intérieur inclus.",
  },
  en: {
    title: "MMA Camp Chechnya and Wrestling Camp Dagestan | MKR Caucasian",
    description: "Train where champions are born. Wrestling in Dagestan, MMA in Chechnya. 1 to 3 weeks in the Caucasus, 4 sessions per year, domestic flight included.",
  },
} as const

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const lang = (locale as Locale) ?? 'fr'
  const copy = HOME_META[lang as 'fr' | 'en'] ?? HOME_META.fr
  return localizedMetadata('/', lang, copy.title, copy.description)
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const tAntoine = await getTranslations('data.antoine-parcours')
  const antoineProps = getAntoineParcoursProps('home', tAntoine as never)

  return (
    <>
      <link rel="preload" as="video" href="/videos/hero-mountains.mp4" type="video/mp4" />
      {/*
        ORDRE DES SECTIONS (arbitrage David, 2026-09-04).
        ⚠️ L'ordre visuel n'est pas libre : chaque section s'emboite dans la
        precedente (margin-top negatif + clip-path en crete de montagne), et la
        section qui arrive doit peindre PAR-DESSUS celle du haut. Le z-index de
        la chaine, dans globals.css bloc "MOUNTAIN SECTION TRANSITIONS", suit
        donc exactement cet ordre. Deplacer une section ici sans renumeroter la
        chaine fait disparaitre une crete (la section du haut repasse devant) et
        peut recouvrir le bas de son contenu.
      */}
      <div data-scroll-section data-scroll-label="Accueil" className="hs-anchor"><Hero /></div>
      {/* Film de présentation (FR + EN depuis 2026-07-22, les 2 exports existent) */}
      <div data-scroll-section data-scroll-label="Le film" className="hs-anchor"><VideoSection /></div>
      <div data-scroll-section data-scroll-label="Tout est inclus" className="hs-anchor"><FacilitatorBand /></div>
      <div data-scroll-section data-scroll-label="Le processus" className="hs-anchor"><Timeline /></div>
      <div data-scroll-section data-scroll-label="Pour qui" className="hs-anchor"><AudienceSwitcher /></div>
      <div data-scroll-section data-scroll-label="Témoignages" className="hs-anchor"><Testimonials /></div>
      <div data-scroll-section data-scroll-label="Antoine en vidéo" className="hs-anchor">
        <VerticalVideoSplit {...antoineProps} />
      </div>
      <div data-scroll-section data-scroll-label="Pourquoi le Caucase" className="hs-anchor"><Philosophie /></div>
      <div data-scroll-section data-scroll-label="Comment y aller" className="hs-anchor"><VoyageReveal /></div>
      <div data-scroll-section data-scroll-label="Sessions" className="hs-anchor"><Sessions /></div>
      <div data-scroll-section data-scroll-label="FAQ" className="hs-anchor"><FAQ /></div>
      <div data-scroll-section data-scroll-label="Prochain camp" className="hs-anchor"><CTAFinal /></div>
    </>
  )
}
