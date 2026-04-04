import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import MtnDivider from '@/components/MtnDivider'
import VideoSection from '@/components/VideoSection'
import Philosophie from '@/components/Philosophie'
import Coaches from '@/components/Coaches'
import Sessions from '@/components/Sessions'
import Timeline from '@/components/Timeline'
import Testimonials from '@/components/Testimonials'
import Voyage from '@/components/Voyage'
import VoyageReveal from '@/components/VoyageReveal'
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
          bgColor="#131313"
          fillColor="#0E0E0E"
          viewBox="0 0 1440 90"
          points="0,90 0,62 60,48 130,58 200,38 265,52 330,28 390,44 445,18 495,36 540,10 575,28 605,6 635,22 658,2 680,18 703,0 726,16 750,4 775,20 805,36 845,22 885,46 935,32 990,54 1050,40 1110,60 1165,46 1220,64 1280,52 1340,68 1400,56 1440,70 1440,90"
        />

        <VideoSection />

        {/* Mountain divider: video -> philosophie (next bg: --bg #131313) */}
        <MtnDivider
          bgColor="#0E0E0E"
          fillColor="#131313"
          viewBox="0 0 1440 70"
          points="0,70 0,50 80,40 170,52 260,30 340,46 410,20 470,38 525,12 565,30 595,8 620,26 645,4 668,20 690,0 715,18 742,6 768,22 795,10 825,28 862,16 905,36 952,22 1005,42 1060,28 1120,48 1180,34 1240,54 1295,42 1350,58 1405,46 1440,60 1440,70"
        />

        <Philosophie />

        {/* Mountain divider: philosophie -> coaches (next bg: surface-lowest #0E0E0E) */}
        <MtnDivider
          bgColor="#131313"
          fillColor="#0E0E0E"
          viewBox="0 0 1440 80"
          points="0,80 0,58 55,44 115,58 185,36 255,52 318,26 372,44 422,18 468,36 508,10 540,28 565,6 588,22 610,4 632,20 655,6 678,22 704,8 730,26 758,10 795,32 835,14 880,38 928,22 985,46 1045,30 1108,52 1165,36 1225,56 1285,42 1348,62 1405,48 1440,62 1440,80"
        />

        <Coaches />

        {/* Mountain divider: coaches -> sessions (next bg: bg #131313) */}
        <MtnDivider
          bgColor="#0E0E0E"
          fillColor="#131313"
          viewBox="0 0 1440 75"
          points="0,75 0,52 65,38 135,54 210,30 278,48 342,22 398,40 450,14 492,32 530,8 558,26 582,4 604,20 626,2 650,18 674,4 698,20 724,6 752,24 782,8 820,30 862,12 908,36 958,20 1015,44 1075,28 1138,50 1195,34 1255,54 1315,40 1375,58 1440,44 1440,75"
        />

        <Sessions />

        {/* Mountain divider: sessions -> timeline (next bg: surface-lowest #0E0E0E) */}
        <MtnDivider
          bgColor="#131313"
          fillColor="#0E0E0E"
          viewBox="0 0 1440 80"
          points="0,80 0,55 55,42 120,56 195,34 265,50 330,24 385,42 435,14 480,32 520,8 552,26 578,4 600,20 622,0 645,16 668,2 692,18 718,6 745,22 775,8 812,28 855,12 905,34 960,18 1020,40 1080,24 1140,46 1200,32 1260,52 1325,38 1390,58 1440,46 1440,80"
        />

        <Timeline />

        {/* Mountain divider: timeline -> testimonials (next bg: bg #131313) */}
        <MtnDivider
          bgColor="#0E0E0E"
          fillColor="#131313"
          viewBox="0 0 1440 70"
          points="0,70 0,48 70,35 145,50 225,28 300,46 365,18 420,36 470,10 510,28 548,4 572,22 595,0 618,18 640,4 665,20 690,6 718,24 748,10 782,30 822,14 870,38 922,20 980,44 1042,28 1105,50 1165,34 1225,56 1285,40 1348,60 1400,46 1440,58 1440,70"
        />

        <Testimonials />

        {/* Mountain divider: testimonials -> voyage (next bg: surface #1A1A18) */}
        <MtnDivider
          bgColor="#131313"
          fillColor="#1A1A18"
          viewBox="0 0 1440 70"
          points="0,70 0,48 70,35 145,50 225,28 300,46 365,18 420,36 470,10 510,28 548,4 572,22 595,0 618,18 640,4 665,20 690,6 718,24 748,10 782,30 822,14 870,38 922,20 980,44 1042,28 1105,50 1165,34 1225,56 1285,40 1348,60 1400,46 1440,58 1440,70"
        />

        <Voyage />

        <VoyageReveal />

        {/* Mountain divider: voyage -> contact (next bg: surface #1A1A18) */}
        <MtnDivider
          bgColor="#0E0E0E"
          fillColor="#131313"
          viewBox="0 0 1440 75"
          points="0,75 0,52 60,38 128,54 202,30 272,48 340,22 398,40 452,14 500,32 542,8 572,26 598,4 622,20 645,2 668,18 692,4 716,20 742,6 770,24 802,8 838,30 880,14 928,36 978,20 1034,42 1090,26 1148,48 1202,34 1258,54 1315,40 1375,58 1440,44 1440,75"
        />

        <Contact />

        {/* Mountain divider: contact -> FAQ (next bg: surface-lowest #0E0E0E) */}
        <MtnDivider
          bgColor="#1A1A18"
          fillColor="#0E0E0E"
          viewBox="0 0 1440 80"
          points="0,80 0,55 55,42 120,56 195,34 265,50 330,24 385,42 435,14 480,32 520,8 552,26 578,4 600,20 622,0 645,16 668,2 692,18 718,6 745,22 775,8 812,28 855,12 905,34 960,18 1020,40 1080,24 1140,46 1200,32 1260,52 1325,38 1390,58 1440,46 1440,80"
        />

        <FAQ />

        {/* Mountain divider: FAQ -> CTA (next bg: surface-lowest #0E0E0E) */}
        <MtnDivider
          bgColor="#0E0E0E"
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
