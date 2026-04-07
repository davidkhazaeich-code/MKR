import type { Metadata } from 'next'
import { Teko, Barlow, Barlow_Condensed } from 'next/font/google'
import { SITE_URL, SITE_NAME, SITE_EMAIL, SITE_DESCRIPTION, SOCIALS, GEO } from '@/data/site'
import { SESSIONS } from '@/data/sessions'
import { COACHES } from '@/data/coaches'
import { TESTIMONIALS } from '@/data/testimonials'
import './globals.css'

const teko = Teko({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-teko',
  display: 'swap',
})

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal'],
  variable: '--font-barlow',
  display: 'swap',
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-barlow-condensed',
  display: 'swap',
})

const META_TITLE = `${SITE_NAME} · Camp d'Entraînement MMA & Lutte au Caucase`
const META_DESC = `${SITE_DESCRIPTION} Rejoignez ${SITE_NAME}.`
const OG_IMAGE = `${SITE_URL}/images/social/og-image.webp`

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESC,
  metadataBase: new URL(SITE_URL),
  // TODO: remove robots block when ready to go live
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: {
    type: 'website',
    locale: 'fr_CH',
    title: META_TITLE,
    description: SITE_DESCRIPTION,
    url: `${SITE_URL}/`,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} - Camp d'entrainement MMA & Lutte au Caucase` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: META_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
}

/* ==========================================================================
   STRUCTURED DATA — JSON-LD
   ==========================================================================
   All schema blocks are defined here in the root layout so they appear on
   every page. Page-specific schema (BreadcrumbList, Article, etc.) should
   be added in the corresponding page.tsx files.
   ========================================================================== */

// ---------------------------------------------------------------------------
// 1. WebSite
// ---------------------------------------------------------------------------
const jsonLdWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  description: SITE_DESCRIPTION,
  inLanguage: 'fr',
  publisher: { '@id': `${SITE_URL}/#organization` },
}

// ---------------------------------------------------------------------------
// 2. Main @graph - generated from data layer
// ---------------------------------------------------------------------------
const coachPerformers = COACHES.map(c => ({ '@id': `${SITE_URL}/#person-${c.id}` }))

const jsonLdMain = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/images/logo-mkr.png`, width: 512, height: 512 },
      image: `${SITE_URL}/images/social/og-image.webp`,
      description: SITE_DESCRIPTION,
      email: SITE_EMAIL,
      contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', email: SITE_EMAIL, availableLanguage: ['French', 'English'] },
      sameAs: Object.values(SOCIALS),
      foundingDate: '2018',
      areaServed: { '@type': 'GeoCircle', geoMidpoint: { '@type': 'GeoCoordinates', latitude: GEO.latitude, longitude: GEO.longitude }, geoRadius: '500 km' },
      knowsAbout: ['MMA', 'Lutte gréco-romaine', 'Sambo', 'Boxe', 'Arts martiaux', "Camp d'entraînement"],
    },
    {
      '@type': 'SportsActivityLocation',
      '@id': `${SITE_URL}/#location`,
      name: SITE_NAME,
      url: `${SITE_URL}/le-camp`,
      description: "Camp d'entraînement MMA, Lutte et Sambo au cœur du Caucase, Géorgie. Salles d'entraînement avec tapis olympiques, cage MMA et équipement de frappe.",
      image: `${SITE_URL}/images/environment/gym-interior.webp`,
      address: { '@type': 'PostalAddress', addressCountry: GEO.country, addressRegion: GEO.region },
      geo: { '@type': 'GeoCoordinates', latitude: GEO.latitude, longitude: GEO.longitude },
      sport: ['MMA', 'Lutte gréco-romaine', 'Sambo', 'Boxe'],
      openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '06:00', closes: '21:00' },
      amenityFeature: [
        { '@type': 'LocationFeatureSpecification', name: 'Hébergement inclus', value: true },
        { '@type': 'LocationFeatureSpecification', name: '3 repas/jour', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Transfert aéroport', value: true },
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '5',
        bestRating: '5',
        worstRating: '1',
        ratingCount: String(TESTIMONIALS.length),
        reviewCount: String(TESTIMONIALS.length),
      },
      review: TESTIMONIALS.map(t => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: t.name },
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
        reviewBody: t.quote,
      })),
    },
    ...SESSIONS.map(s => ({
      '@type': 'Event',
      '@id': `${SITE_URL}/#event-${s.id}`,
      name: `${SITE_NAME} - Session ${s.season} 2026`,
      description: `Session ${s.season.toLowerCase()} de ${s.duration} en MMA et lutte au Caucase. Coaching d'élite, hébergement et repas inclus. Maximum ${s.maxCapacity} participants.`,
      startDate: s.startDate,
      endDate: s.endDate,
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      location: { '@id': `${SITE_URL}/#location` },
      image: `${SITE_URL}/images/social/og-image.webp`,
      url: `${SITE_URL}/sessions`,
      organizer: { '@id': `${SITE_URL}/#organization` },
      performer: coachPerformers,
      offers: {
        '@type': 'Offer',
        name: `Session ${s.season} 2026`,
        price: String(s.price),
        priceCurrency: s.priceCurrency,
        availability: s.status === 'limited' ? 'https://schema.org/LimitedAvailability' : 'https://schema.org/InStock',
        url: `${SITE_URL}/inscription`,
        validFrom: '2025-12-01',
      },
      maximumAttendeeCapacity: s.maxCapacity,
      inLanguage: ['fr', 'en'],
    })),
    ...COACHES.map(c => ({
      '@type': 'Person',
      '@id': `${SITE_URL}/#person-${c.id}`,
      name: `${c.firstName} ${c.lastName}`,
      jobTitle: c.jobTitle,
      description: c.bioShort,
      image: `${SITE_URL}${c.image}`,
      url: `${SITE_URL}/coachs`,
      worksFor: { '@id': `${SITE_URL}/#organization` },
      knowsAbout: c.knowsAbout,
    })),
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      className={`${teko.variable} ${barlow.variable} ${barlowCondensed.variable}`}
    >
      <head>
        {/* Loader styles + logic injected purely via JS in body script */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdMain) }}
        />
      </head>
      <body>
        {/* Loader — created via JS, outside React tree */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){
  var d=document,h=d.head||d.documentElement,b=d.body;
  /* 1. Inject styles */
  var s=d.createElement('style');
  s.textContent='#mkr-loader{position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;overflow:hidden}#mkr-loader .h{position:absolute;left:0;width:100%;height:50%;background:#0A0A0A;will-change:transform;transition:transform .9s cubic-bezier(.76,0,.24,1)}#mkr-loader .ht{top:0}#mkr-loader .hb{top:50%}#mkr-loader .h.go.ht{transform:translateY(-100%)}#mkr-loader .h.go.hb{transform:translateY(100%)}#mkr-loader .ct{position:absolute;z-index:2;top:50%;left:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:16px;transition:opacity .3s ease,transform .3s ease}#mkr-loader .ct.out{opacity:0;transform:translate(-50%,-50%) scale(.9)}#mkr-loader .ct img{width:clamp(40px,10vw,60px);height:auto}#mkr-loader .tr{width:clamp(80px,25vw,140px);height:2px;background:rgba(255,255,255,.1);border-radius:2px;overflow:hidden}#mkr-loader .fl{height:100%;width:0%;background:#C84B31;border-radius:2px;transition:width 1.2s cubic-bezier(.25,.46,.45,.94)}';
  h.appendChild(s);
  /* 2. Create loader */
  var w=d.createElement('div');w.id='mkr-loader';
  w.innerHTML='<div class="h ht"></div><div class="h hb"></div><div class="ct"><img src="/logo-white.webp" width="60" height="60" alt=""><div class="tr"><div class="fl" id="mkr-f"></div></div></div>';
  b.insertBefore(w,b.firstChild);
  b.style.overflow='hidden';
  var f=d.getElementById('mkr-f');
  /* 3. Force paint then animate */
  void w.offsetHeight;
  requestAnimationFrame(function(){requestAnimationFrame(function(){
    if(f)f.style.width='70%';
    setTimeout(function(){if(f)f.style.width='100%'},1300);
    setTimeout(function(){var c=w.querySelector('.ct');if(c)c.classList.add('out')},1900);
    setTimeout(function(){var a=w.querySelectorAll('.h');for(var i=0;i<a.length;i++)a[i].classList.add('go')},2200);
    setTimeout(function(){w.remove();s.remove();b.style.overflow=''},3200);
  })});
})()` }} />
        {children}
      </body>
    </html>
  )
}
