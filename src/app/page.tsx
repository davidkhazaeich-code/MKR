import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import MtnDivider from '@/components/MtnDivider'
import VideoSection from '@/components/VideoSection'
import Philosophie from '@/components/Philosophie'
import Coaches from '@/components/Coaches'
import Sessions from '@/components/Sessions'
import Timeline from '@/components/Timeline'
import Testimonials from '@/components/Testimonials'
import Contact from '@/components/Contact'
import FAQ from '@/components/FAQ'
import CTAFinal from '@/components/CTAFinal'
import Footer from '@/components/Footer'
import RevealObserver from '@/components/RevealObserver'

export default function Home() {
  return (
    <>
      <a href="#main" className="skip-link">Aller au contenu principal</a>
      <Nav />
      <main id="main">
        <Hero />

        {/* Mountain divider: hero -> video (next bg: surface-lowest #0E0E0E) */}
        <MtnDivider
          fillColor="#0E0E0E"
          viewBox="0 0 1440 90"
          points="0,90 0,62 60,48 130,58 200,38 265,52 330,28 390,44 445,18 495,36 540,10 575,28 605,6 635,22 658,2 680,18 703,0 726,16 750,4 775,20 805,36 845,22 885,46 935,32 990,54 1050,40 1110,60 1165,46 1220,64 1280,52 1340,68 1400,56 1440,70 1440,90"
        />

        <VideoSection />

        {/* Mountain divider: video -> philosophie (next bg: surface #1A1A18) */}
        <MtnDivider
          fillColor="#1A1A18"
          viewBox="0 0 1440 70"
          points="0,70 0,50 80,40 170,52 260,30 340,46 410,20 470,38 525,12 565,30 595,8 620,26 645,4 668,20 690,0 715,18 742,6 768,22 795,10 825,28 862,16 905,36 952,22 1005,42 1060,28 1120,48 1180,34 1240,54 1295,42 1350,58 1405,46 1440,60 1440,70"
        />

        <Philosophie />
        <Coaches />
        <Sessions />

        {/* Mountain divider: sessions -> timeline (next bg: surface-lowest #0E0E0E) */}
        <MtnDivider
          fillColor="#0E0E0E"
          viewBox="0 0 1440 80"
          points="0,80 0,55 55,42 120,56 195,34 265,50 330,24 385,42 435,14 480,32 520,8 552,26 578,4 600,20 622,0 645,16 668,2 692,18 718,6 745,22 775,8 812,28 855,12 905,34 960,18 1020,40 1080,24 1140,46 1200,32 1260,52 1325,38 1390,58 1440,46 1440,80"
        />

        <Timeline />

        {/* Mountain divider: timeline -> testimonials (next bg: bg #131313) */}
        <MtnDivider
          fillColor="#131313"
          viewBox="0 0 1440 70"
          points="0,70 0,48 70,35 145,50 225,28 300,46 365,18 420,36 470,10 510,28 548,4 572,22 595,0 618,18 640,4 665,20 690,6 718,24 748,10 782,30 822,14 870,38 922,20 980,44 1042,28 1105,50 1165,34 1225,56 1285,40 1348,60 1400,46 1440,58 1440,70"
        />

        <Testimonials />

        {/* Mountain divider: testimonials -> contact (next bg: surface #1A1A18) */}
        <MtnDivider
          fillColor="#1A1A18"
          viewBox="0 0 1440 70"
          points="0,70 0,48 70,35 145,50 225,28 300,46 365,18 420,36 470,10 510,28 548,4 572,22 595,0 618,18 640,4 665,20 690,6 718,24 748,10 782,30 822,14 870,38 922,20 980,44 1042,28 1105,50 1165,34 1225,56 1285,40 1348,60 1400,46 1440,58 1440,70"
        />

        <Contact />

        {/* Mountain divider: contact -> FAQ (next bg: surface-lowest #0E0E0E) */}
        <MtnDivider
          fillColor="#0E0E0E"
          viewBox="0 0 1440 80"
          points="0,80 0,55 55,42 120,56 195,34 265,50 330,24 385,42 435,14 480,32 520,8 552,26 578,4 600,20 622,0 645,16 668,2 692,18 718,6 745,22 775,8 812,28 855,12 905,34 960,18 1020,40 1080,24 1140,46 1200,32 1260,52 1325,38 1390,58 1440,46 1440,80"
        />

        <FAQ />

        {/* Mountain divider: FAQ -> CTA (next bg: surface-lowest #0E0E0E) */}
        <MtnDivider
          fillColor="#0E0E0E"
          viewBox="0 0 1440 70"
          points="0,70 0,48 70,35 145,50 225,28 300,46 365,18 420,36 470,10 510,28 548,4 572,22 595,0 618,18 640,4 665,20 690,6 718,24 748,10 782,30 822,14 870,38 922,20 980,44 1042,28 1105,50 1165,34 1225,56 1285,40 1348,60 1400,46 1440,58 1440,70"
        />

        <CTAFinal />
      </main>
      <Footer />
      <RevealObserver />
    </>
  )
}
