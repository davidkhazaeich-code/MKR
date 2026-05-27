import dynamic from 'next/dynamic'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import Hero from '@/components/Hero'
import { buildMetadata } from '@/lib/seo'
import { getAntoineParcoursProps } from '@/data/antoine-parcours'

const AudienceSwitcher = dynamic(() => import('@/components/AudienceSwitcher'), { ssr: true })
const FacilitatorBand = dynamic(() => import('@/components/FacilitatorBand'), { ssr: true })
const Philosophie = dynamic(() => import('@/components/Philosophie'), { ssr: true })
const DestinationShowcase = dynamic(() => import('@/components/DestinationShowcase'), { ssr: true })
const Sessions = dynamic(() => import('@/components/Sessions'), { ssr: true })
const Timeline = dynamic(() => import('@/components/Timeline'), { ssr: true })
const Testimonials = dynamic(() => import('@/components/Testimonials'), { ssr: true })
const FAQ = dynamic(() => import('@/components/FAQ'), { ssr: true })
const CTAFinal = dynamic(() => import('@/components/CTAFinal'), { ssr: true })
const VoyageReveal = dynamic(() => import('@/components/VoyageReveal'))
const VerticalVideoSplit = dynamic(() => import('@/components/VerticalVideoSplit'), {
  loading: () => <div style={{ minHeight: 600 }} aria-hidden />,
})

export const metadata = buildMetadata({
  title: "Camp MMA Tchétchénie et Lutte Daghestan | MKR Caucasian",
  description: "Entraîne-toi là où naissent les champions. Lutte au Daghestan, MMA en Tchétchénie. 1 à 3 semaines au Caucase, 4 sessions par an, vol intérieur inclus.",
  path: '/',
})

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const tAntoine = await getTranslations('data.antoine-parcours')
  const antoineProps = getAntoineParcoursProps('home', tAntoine as never)

  return (
    <>
      <link rel="preload" as="video" href="/videos/hero-mountains.mp4" type="video/mp4" />
      <div data-scroll-section data-scroll-label="Accueil" className="hs-anchor"><Hero /></div>
      <div data-scroll-section data-scroll-label="Pour qui" className="hs-anchor"><AudienceSwitcher /></div>
      <div data-scroll-section data-scroll-label="Pourquoi le Caucase" className="hs-anchor"><Philosophie /></div>
      <div data-scroll-section data-scroll-label="Les destinations" className="hs-anchor"><DestinationShowcase /></div>
      <div data-scroll-section data-scroll-label="Témoignages" className="hs-anchor"><Testimonials /></div>
      <div data-scroll-section data-scroll-label="Antoine en vidéo" className="hs-anchor">
        <VerticalVideoSplit {...antoineProps} />
      </div>
      <div data-scroll-section data-scroll-label="On organise tout" className="hs-anchor"><FacilitatorBand /></div>
      <div data-scroll-section data-scroll-label="Comment y aller" className="hs-anchor"><VoyageReveal /></div>
      <div data-scroll-section data-scroll-label="Sessions" className="hs-anchor"><Sessions /></div>
      <div data-scroll-section data-scroll-label="Le parcours" className="hs-anchor"><Timeline /></div>
      <div data-scroll-section data-scroll-label="FAQ" className="hs-anchor"><FAQ /></div>
      <div data-scroll-section data-scroll-label="Prochain camp" className="hs-anchor"><CTAFinal /></div>
    </>
  )
}
