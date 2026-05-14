'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import IconLutte from '@/components/icons/IconLutte'
import IconMMA from '@/components/icons/IconMMA'

const CHEVRON = (
  <svg className="nav-trigger-arrow" viewBox="0 0 10 10" fill="none"
    stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <polyline points="2,3 5,7 8,3"/>
  </svg>
)

const ARROW_RIGHT = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
    width="13" height="13" aria-hidden="true">
    <line x1="2" y1="8" x2="14" y2="8"/>
    <polyline points="9,3 14,8 9,13"/>
  </svg>
)

const ARROW_SM = (
  <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"
    width="10" height="10" aria-hidden="true">
    <polyline points="3,2 7,5 3,8"/>
  </svg>
)

const CHECK_SM = (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"
    width="12" height="12" aria-hidden="true">
    <polyline points="2,7 6,11 12,3"/>
  </svg>
)

const MOBILE_CHEVRON = (
  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <polyline points="3,6 9,12 15,6"/>
  </svg>
)

/* ── Mobile & mega menu link icons ── */
const ICO = {
  camp: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" width="18" height="18" aria-hidden="true"><path d="M10 2L2 18h16L10 2z"/><line x1="10" y1="10" x2="10" y2="14"/><circle cx="10" cy="16" r=".5" fill="currentColor"/></svg>,
  howItWorks: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" width="18" height="18" aria-hidden="true"><circle cx="10" cy="10" r="8"/><polyline points="10,5 10,10 14,12"/></svg>,
  prepare: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" width="18" height="18" aria-hidden="true"><rect x="5" y="2" width="10" height="16" rx="1"/><line x1="8" y1="6" x2="12" y2="6"/><line x1="8" y1="9" x2="12" y2="9"/><line x1="8" y1="12" x2="12" y2="12"/></svg>,
  logistics: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" width="18" height="18" aria-hidden="true"><path d="M2 14l4-10h8l4 10"/><circle cx="6" cy="14" r="2"/><circle cx="14" cy="14" r="2"/><line x1="8" y1="14" x2="12" y2="14"/></svg>,
  dayType: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" width="18" height="18" aria-hidden="true"><circle cx="10" cy="10" r="8"/><circle cx="10" cy="10" r="2" fill="currentColor"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="10" y1="16" x2="10" y2="18"/><line x1="2" y1="10" x2="4" y2="10"/><line x1="16" y1="10" x2="18" y2="10"/></svg>,
  sessions: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" width="18" height="18" aria-hidden="true"><rect x="3" y="4" width="14" height="13" rx="1.5"/><line x1="3" y1="8" x2="17" y2="8"/><line x1="7" y1="2" x2="7" y2="5"/><line x1="13" y1="2" x2="13" y2="5"/></svg>,
  overview: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" width="18" height="18" aria-hidden="true"><rect x="2" y="2" width="7" height="7" rx="1"/><rect x="11" y="2" width="7" height="7" rx="1"/><rect x="2" y="11" width="7" height="7" rx="1"/><rect x="11" y="11" width="7" height="7" rx="1"/></svg>,
  mma: <IconMMA className="nav-ico-discipline" />,
  lutte: <IconLutte className="nav-ico-discipline" />,
  coaches: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" width="18" height="18" aria-hidden="true"><circle cx="10" cy="6" r="3.5"/><path d="M3 18c0-4 3.5-7 7-7s7 3 7 7"/></svg>,
  dagestan: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" width="18" height="18" aria-hidden="true"><path d="M2 16L6 6l4 5 4-8 4 13"/><circle cx="15" cy="5" r="2"/></svg>,
  gallery: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" width="18" height="18" aria-hidden="true"><rect x="2" y="3" width="16" height="14" rx="1.5"/><circle cx="7" cy="8" r="2"/><path d="M2 14l4-4 3 3 4-5 5 6"/></svg>,
  testimonials: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" width="18" height="18" aria-hidden="true"><path d="M3 3h14v10H8L3 17V3z" strokeLinejoin="round"/><line x1="7" y1="7" x2="13" y2="7"/><line x1="7" y1="10" x2="11" y2="10"/></svg>,
  faq: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" width="18" height="18" aria-hidden="true"><circle cx="10" cy="10" r="8"/><path d="M7.5 7.5C7.5 6 9 5 10.5 5.5S12.5 7 12 8.5C11.5 10 10 10 10 11.5"/><circle cx="10" cy="14" r=".7" fill="currentColor"/></svg>,
  blog: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" width="18" height="18" aria-hidden="true"><path d="M3 17L13 7l4 4L7 21H3v-4z" transform="translate(0,-2)"/><line x1="11" y1="7" x2="15" y2="3" transform="translate(0,-2)"/></svg>,
  about: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" width="18" height="18" aria-hidden="true"><circle cx="10" cy="10" r="8"/><line x1="10" y1="9" x2="10" y2="14"/><circle cx="10" cy="6.5" r=".7" fill="currentColor"/></svg>,
  contact: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" width="18" height="18" aria-hidden="true"><rect x="2" y="4" width="16" height="12" rx="1.5"/><polyline points="2,4 10,11 18,4"/></svg>,
  inscription: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" width="18" height="18" aria-hidden="true"><path d="M14 2l4 4-9 9H5v-4L14 2z"/><line x1="12" y1="4" x2="16" y2="8"/></svg>,
  guide: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" width="18" height="18" aria-hidden="true"><path d="M4 2h9l5 5v11a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z"/><polyline points="13,2 13,7 18,7"/><line x1="6" y1="11" x2="14" y2="11"/><line x1="6" y1="14" x2="11" y2="14"/></svg>,
  calendar: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" width="18" height="18" aria-hidden="true"><rect x="3" y="4" width="14" height="13" rx="1.5"/><line x1="3" y1="8" x2="17" y2="8"/><line x1="7" y1="2" x2="7" y2="5"/><line x1="13" y1="2" x2="13" y2="5"/><circle cx="7" cy="12" r="1" fill="currentColor"/><circle cx="10" cy="12" r="1" fill="currentColor"/></svg>,
}

type PanelId = 'camp' | 'programme' | 'destinations' | 'infos'

function MobAccordion({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  return (
    <div className="mob-acc">
      <button
        className="mob-acc-trigger"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(v => !v)}
      >
        {title}
        {MOBILE_CHEVRON}
      </button>
      <div
        id={id}
        className="mob-acc-body"
        aria-hidden={!open}
        ref={bodyRef}
        style={{ height: open ? bodyRef.current?.scrollHeight : 0 }}
      >
        <div className="mob-acc-body-inner">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function Nav() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activePanel, setActivePanel] = useState<PanelId | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Close mobile menu + mega panels on route change
  useEffect(() => {
    setMenuOpen(false)
    setActivePanel(null)
  }, [pathname])

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 60)
          const docH = document.documentElement.scrollHeight - window.innerHeight
          setScrollProgress(docH > 0 ? Math.min(window.scrollY / docH, 1) : 0)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activePanel) setActivePanel(null)
        if (menuOpen) setMenuOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen, activePanel])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const openPanel = useCallback((id: PanelId) => {
    if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null }
    setActivePanel(id)
  }, [])

  const scheduleClose = useCallback(() => {
    closeTimerRef.current = setTimeout(() => setActivePanel(null), 110)
  }, [])

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null }
  }, [])

  const togglePanel = useCallback((id: PanelId) => {
    setActivePanel(cur => cur === id ? null : id)
  }, [])

  return (
    <>
      <header id="site-header">
        <nav id="nav" className={scrolled ? 'is-scrolled' : ''} aria-label="Navigation principale">
          <div className="nav-inner">

            <Link href="/" className="nav-logo" aria-label="MKR Caucasian Camp · Accueil">
              <Image src="/logo-white.webp" alt="MKR Caucasian Camp" className="nav-logo-img" width={320} height={193} priority />
            </Link>

            <ul className="nav-list" role="list">
              {(['camp', 'programme', 'destinations', 'infos'] as PanelId[]).map(id => (
                <li key={id}>
                  <button
                    className="nav-trigger"
                    id={`trigger-${id}`}
                    aria-expanded={activePanel === id}
                    aria-controls={`mega-${id}`}
                    data-mega={id}
                    onMouseEnter={() => openPanel(id)}
                    onMouseLeave={scheduleClose}
                    onClick={() => togglePanel(id)}
                  >
                    {id === 'camp' && ICO.camp}
                    {id === 'programme' && ICO.overview}
                    {id === 'destinations' && ICO.dagestan}
                    {id === 'infos' && ICO.about}
                    {id === 'camp' ? 'Le Camp' : id === 'programme' ? 'Programme' : id === 'destinations' ? 'Destinations' : 'Découvrir'}
                    {CHEVRON}
                  </button>
                </li>
              ))}
            </ul>

            <div className="nav-right">
              <Link href="/inscription" className="nav-cta" aria-label="Postuler au camp">POSTULER</Link>
              <button
                className={`nav-hamburger${menuOpen ? ' open' : ''}`}
                aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                onClick={() => setMenuOpen(v => !v)}
              >
                <span/><span/><span/>
              </button>
            </div>

          </div>
        </nav>
        <div
          className="scroll-progress"
          style={{ transform: `scaleX(${scrollProgress})` }}
          aria-hidden="true"
        />
      </header>

      {/* ══ MEGA PANELS ══ */}
      <div id="mega-wrap" className={activePanel ? 'has-open' : ''} aria-live="polite">

        {/* ── LE CAMP ── */}
        <div
          id="mega-camp"
          className={`mega-panel${activePanel === 'camp' ? ' is-active' : ''}`}
          role="region"
          aria-labelledby="trigger-camp"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className="mega-inner">
            <span className="mega-section-label">Le Camp MKR · Choisis ta venue</span>
            <div className="mega-camp-grid">
              <div>
                <h2 className="mega-camp-feature-title">CHOISIS<br/>TA SESSION.</h2>
                <p className="mega-camp-feature-body">Quatre sessions par an calées sur les vacances scolaires francophones. MKR organise tout : visa, vol intérieur, transferts, hébergement, repas, encadrement.</p>
                <Link href="/sessions" className="mega-arrow-link">Voir les 4 sessions {ARROW_RIGHT}</Link>
              </div>
              <div>
                <span className="mega-camp-links-label">Sessions officielles 2026 / 2027</span>
                <ul className="mega-link-list" role="list">
                  <li><Link href="/mkr-camp-2026">{ICO.sessions} Été · 17 août - 5 sept 2026 {ARROW_SM}</Link></li>
                  <li><Link href="/sessions#toussaint-2026">{ICO.sessions} Toussaint · 17 oct - 7 nov 2026 {ARROW_SM}</Link></li>
                  <li><Link href="/sessions#fevrier-2027">{ICO.sessions} Hiver · 13 fév - 6 mars 2027 {ARROW_SM}</Link></li>
                  <li><Link href="/sessions#paques-2027">{ICO.sessions} Pâques · 3 - 24 avril 2027 {ARROW_SM}</Link></li>
                </ul>
              </div>
              <div>
                <span className="mega-camp-links-label">Autres formats</span>
                <ul className="mega-link-list" role="list">
                  <li><Link href="/sur-mesure">{ICO.calendar} Sur Mesure · tes dates {ARROW_SM}</Link></li>
                  <li><Link href="/familles">{ICO.coaches} Famille · parent + enfant 8-17 {ARROW_SM}</Link></li>
                  <li><Link href="/clubs-groupes">{ICO.coaches} Club et Groupe · 5 à 20 {ARROW_SM}</Link></li>
                  <li><Link href="/comment-ca-marche">{ICO.howItWorks} Comment ça marche {ARROW_SM}</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ── PROGRAMME ── */}
        <div
          id="mega-programme"
          className={`mega-panel${activePanel === 'programme' ? ' is-active' : ''}`}
          role="region"
          aria-labelledby="trigger-programme"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className="mega-inner">
            <span className="mega-section-label">Disciplines et Programme 2026</span>
            <div className="mega-prog-grid">
              <Link href="/programme/mma" className="mega-prog-card">
                <Image src="/images/action/sparring-mma-wall.webp" alt="" className="mega-prog-bg" fill sizes="(max-width: 768px) 100vw, 33vw" aria-hidden="true" />
                <div className="mega-prog-icon" aria-hidden="true">
                  <IconMMA />
                </div>
                <h3 className="mega-prog-title">MMA</h3>
                <p className="mega-prog-desc">Striking, clinch, takedowns, submissions. Sparring quotidien avec des combattants locaux. Transitions debout-sol.</p>
                <span className="mega-arrow-link">Voir le programme {ARROW_RIGHT}</span>
              </Link>
              <Link href="/programme/lutte" className="mega-prog-card">
                <Image src="/images/action/takedown-wrestling.webp" alt="" className="mega-prog-bg" fill sizes="(max-width: 768px) 100vw, 33vw" aria-hidden="true" />
                <div className="mega-prog-icon" aria-hidden="true">
                  <IconLutte />
                </div>
                <h3 className="mega-prog-title">LUTTE ADULTES</h3>
                <p className="mega-prog-desc">Lutte libre. Méthodes daghestanaises transmises par des champions, sparring quotidien.</p>
                <span className="mega-arrow-link">Voir le programme {ARROW_RIGHT}</span>
              </Link>
              <Link href="/programme/lutte-enfants" className="mega-prog-card">
                <Image src="/images/ruslan/kids/kids-coach-cercle-mkr.webp" alt="" className="mega-prog-bg" fill sizes="(max-width: 768px) 100vw, 33vw" aria-hidden="true" />
                <div className="mega-prog-icon" aria-hidden="true">
                  <IconLutte />
                </div>
                <h3 className="mega-prog-title">JEUNESSE</h3>
                <p className="mega-prog-desc">Programme 8-17 ans avec parent participant. Pédagogie progressive, ratio 1 coach pour 5 enfants, sécurité renforcée.</p>
                <span className="mega-arrow-link">Voir le programme {ARROW_RIGHT}</span>
              </Link>
            </div>
            <div className="mega-prog-secondary">
              <Link href="/programme" className="mega-prog-secondary-link">{ICO.overview} Vue d&apos;ensemble du programme {ARROW_SM}</Link>
              <Link href="/temoignages" className="mega-prog-secondary-link">{ICO.testimonials} Témoignages athlètes {ARROW_SM}</Link>
            </div>
          </div>
        </div>

        {/* ── DESTINATIONS ── */}
        <div
          id="mega-destinations"
          className={`mega-panel${activePanel === 'destinations' ? ' is-active' : ''}`}
          role="region"
          aria-labelledby="trigger-destinations"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className="mega-inner">
            <span className="mega-section-label">Deux destinations, une discipline par camp</span>
            <div className="mega-dest-layout mega-dest-layout--dual">
              <Link href="/destinations/dagestan" className="mega-dest-card mega-dest-card--dual" aria-label="Daghestan · destination Lutte">
                <Image src="/images/environment/dagestan-panorama.webp" alt="" className="mega-dest-img" fill sizes="(max-width: 768px) 100vw, 40vw" aria-hidden="true" />
                <div className="mega-dest-overlay" aria-hidden="true"/>
                <div className="mega-dest-content">
                  <span className="mega-dest-region">Caucase · Russie · Lutte</span>
                  <h2 className="mega-dest-name">DAGHESTAN</h2>
                  <p className="mega-dest-tagline">Berceau de la lutte libre mondiale. Pour les camps Lutte adultes et enfants.</p>
                  <span className="mega-dest-cta">Découvrir le Daghestan {ARROW_RIGHT}</span>
                </div>
              </Link>
              <Link href="/destinations/tchetchenie" className="mega-dest-card mega-dest-card--dual" aria-label="Tchétchénie · destination MMA">
                <Image src="/images/environment/dagestan-panorama.webp" alt="" className="mega-dest-img" fill sizes="(max-width: 768px) 100vw, 40vw" aria-hidden="true" />
                <div className="mega-dest-overlay" aria-hidden="true"/>
                <div className="mega-dest-content">
                  <span className="mega-dest-region">Caucase · Russie · MMA</span>
                  <h2 className="mega-dest-name">TCHÉTCHÉNIE</h2>
                  <p className="mega-dest-tagline">Terre des champions MMA. Pour les camps MMA adultes.</p>
                  <span className="mega-dest-cta">Découvrir la Tchétchénie {ARROW_RIGHT}</span>
                </div>
              </Link>
              <div className="mega-dest-aside">
                <span className="mega-camp-links-label">Préparer le voyage</span>
                <ul className="mega-link-list" role="list">
                  <li><Link href="/destinations">{ICO.dagestan} Vue d&apos;ensemble {ARROW_SM}</Link></li>
                  <li><Link href="/logistique">{ICO.logistics} Logistique, vols et visa {ARROW_SM}</Link></li>
                  <li><Link href="/guide-dagestan">{ICO.guide} Guide PDF Caucase {ARROW_SM}</Link></li>
                </ul>
                <div className="mega-dest-security" role="note">
                  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16" aria-hidden="true">
                    <polygon points="9,1.5 16.5,5 16.5,13 9,16.5 1.5,13 1.5,5"/>
                    <line x1="9" y1="8" x2="9" y2="12"/><circle cx="9" cy="6" r="0.5" fill="currentColor"/>
                  </svg>
                  <span className="mega-dest-security-text">
                    Combo Daghestan + Tchétchénie disponible uniquement sur sur-mesure.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── INFOS ── */}
        <div
          id="mega-infos"
          className={`mega-panel${activePanel === 'infos' ? ' is-active' : ''}`}
          role="region"
          aria-labelledby="trigger-infos"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className="mega-inner">
            <span className="mega-section-label">Découvrir MKR · Preuve et ressources</span>
            <div className="mega-infos-grid">
              <div>
                <span className="mega-infos-col-label">Voir le camp</span>
                <ul className="mega-link-list" role="list">
                  <li><Link href="/galerie">{ICO.gallery} Galerie photos et vidéos {ARROW_SM}</Link></li>
                  <li><Link href="/temoignages">{ICO.testimonials} Témoignages athlètes {ARROW_SM}</Link></li>
                  <li><Link href="/blog">{ICO.blog} Blog et articles {ARROW_SM}</Link></li>
                </ul>
              </div>
              <div>
                <span className="mega-infos-col-label">Comprendre, échanger</span>
                <ul className="mega-link-list" role="list">
                  <li><Link href="/faq">{ICO.faq} Questions fréquentes {ARROW_SM}</Link></li>
                  <li><Link href="/a-propos">{ICO.about} À propos de MKR {ARROW_SM}</Link></li>
                  <li><Link href="/contact">{ICO.contact} Nous contacter {ARROW_SM}</Link></li>
                </ul>
              </div>
              <div className="mega-testi" aria-label="Témoignage athlète">
                <Image src="/images/testimonials/thomas-b.webp" alt="" className="mega-testi-avatar" width={40} height={40} aria-hidden="true" />
                <span className="mega-testi-quote-mark" aria-hidden="true">&ldquo;</span>
                <p className="mega-testi-quote">Deux semaines après le retour, j&apos;ai remporté mon premier titre régional. Ce que j&apos;ai construit là-bas, aucune salle en France ne pouvait me le donner.</p>
                <span className="mega-testi-name">Thomas B.</span>
                <span className="mega-testi-meta">Boxe · Lyon · Session Automne 2025</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Backdrop */}
      <div
        id="nav-backdrop"
        className={activePanel ? 'is-visible' : ''}
        aria-hidden="true"
        onClick={() => setActivePanel(null)}
      />

      {/* ══ MOBILE MENU ══ */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal"
        aria-hidden={!menuOpen}
        className={menuOpen ? 'is-open' : ''}
      >
        <div className="mobile-inner">
          <MobAccordion title="Le Camp" id="mob-camp">
            <span className="mob-sub-label">Sessions officielles 2026 / 2027</span>
            <Link href="/mkr-camp-2026" className="mob-sub-link">{ICO.sessions} Été · 17 août - 5 sept 2026</Link>
            <Link href="/sessions#toussaint-2026" className="mob-sub-link">{ICO.sessions} Toussaint · 17 oct - 7 nov 2026</Link>
            <Link href="/sessions#fevrier-2027" className="mob-sub-link">{ICO.sessions} Hiver · 13 fév - 6 mars 2027</Link>
            <Link href="/sessions#paques-2027" className="mob-sub-link">{ICO.sessions} Pâques · 3 - 24 avril 2027</Link>
            <span className="mob-sub-label">Autres formats</span>
            <Link href="/sur-mesure" className="mob-sub-link">{ICO.calendar} Sur Mesure · tes dates</Link>
            <Link href="/familles" className="mob-sub-link">{ICO.coaches} Famille · parent + enfant</Link>
            <Link href="/clubs-groupes" className="mob-sub-link">{ICO.coaches} Club et Groupe · 5 à 20</Link>
            <Link href="/sessions" className="mob-sub-link">{ICO.sessions} Voir tous les tarifs</Link>
            <span className="mob-sub-label">Préparer sa venue</span>
            <Link href="/le-camp" className="mob-sub-link">{ICO.camp} Découvrir le camp</Link>
            <Link href="/comment-ca-marche" className="mob-sub-link">{ICO.howItWorks} Comment ça marche</Link>
            <Link href="/preparer-son-camp" className="mob-sub-link">{ICO.prepare} Préparer son camp</Link>
          </MobAccordion>
          <MobAccordion title="Programme" id="mob-prog">
            <Link href="/programme" className="mob-sub-link">{ICO.overview} Vue d&apos;ensemble</Link>
            <Link href="/programme/mma" className="mob-sub-link">{ICO.mma} MMA · Tchétchénie</Link>
            <Link href="/programme/lutte" className="mob-sub-link">{ICO.lutte} Lutte adultes · Daghestan</Link>
            <Link href="/programme/lutte-enfants" className="mob-sub-link">{ICO.lutte} Jeunesse 8-17 · Daghestan</Link>
          </MobAccordion>
          <MobAccordion title="Destinations" id="mob-dest">
            <span className="mob-sub-label">Une destination par discipline</span>
            <Link href="/destinations/dagestan" className="mob-sub-link">{ICO.dagestan} Daghestan · Lutte</Link>
            <Link href="/destinations/tchetchenie" className="mob-sub-link">{ICO.dagestan} Tchétchénie · MMA</Link>
            <Link href="/destinations" className="mob-sub-link">{ICO.overview} Vue d&apos;ensemble</Link>
            <span className="mob-sub-label">Préparer le voyage</span>
            <Link href="/logistique" className="mob-sub-link">{ICO.logistics} Logistique, vols et visa</Link>
            <Link href="/guide-dagestan" className="mob-sub-link">{ICO.guide} Guide PDF Caucase</Link>
          </MobAccordion>
          <MobAccordion title="Découvrir" id="mob-decouvrir">
            <Link href="/galerie" className="mob-sub-link">{ICO.gallery} Galerie</Link>
            <Link href="/temoignages" className="mob-sub-link">{ICO.testimonials} Témoignages</Link>
            <Link href="/blog" className="mob-sub-link">{ICO.blog} Blog</Link>
            <Link href="/faq" className="mob-sub-link">{ICO.faq} FAQ</Link>
            <Link href="/a-propos" className="mob-sub-link">{ICO.about} À propos</Link>
            <Link href="/contact" className="mob-sub-link">{ICO.contact} Contact</Link>
          </MobAccordion>
          <a href="https://wa.me/33666177691" target="_blank" rel="noopener noreferrer" className="mob-direct">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" width="18" height="18" aria-hidden="true">
              <path d="M3 17l1.4-3.4a7.5 7.5 0 1 1 2.9 2.6L3 17"/>
            </svg>
            WhatsApp +33 6 66 17 76 91
          </a>
          <div className="mob-cta-wrap">
            <Link href="/inscription" className="mob-cta">POSTULER AU CAMP</Link>
          </div>
        </div>
      </div>
    </>
  )
}
