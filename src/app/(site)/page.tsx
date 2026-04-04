import dynamic from 'next/dynamic'
import Hero from '@/components/Hero'
import VideoSection from '@/components/VideoSection'
import Philosophie from '@/components/Philosophie'
import Coaches from '@/components/Coaches'
import Sessions from '@/components/Sessions'
import Timeline from '@/components/Timeline'
import Testimonials from '@/components/Testimonials'
import Contact from '@/components/Contact'
import FAQ from '@/components/FAQ'
import CTAFinal from '@/components/CTAFinal'

const VoyageReveal = dynamic(() => import('@/components/VoyageReveal'))

export default function Home() {
  return (
    <>
      <Hero />
      <VideoSection />
      <Philosophie />
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
