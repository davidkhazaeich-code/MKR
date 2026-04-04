'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

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
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activePanel, setActivePanel] = useState<PanelId | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 60)
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
              <Image src="/logo-white.webp" alt="" className="nav-logo-img" width={109} height={112} aria-hidden="true" priority />
              <div className="nav-logo-text">
                <span className="nav-logo-mkr">MKR</span>
                <span className="nav-logo-sub">Caucasian Camp</span>
              </div>
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
                    {id === 'camp' ? 'Le Camp' : id === 'programme' ? 'Programme' : id === 'destinations' ? 'Destinations' : 'Infos'}
                    {CHEVRON}
                  </button>
                </li>
              ))}
            </ul>

            <div className="nav-right">
              <Link href="/sessions" className="nav-sessions-link">Sessions 2026</Link>
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
            <span className="mega-section-label">Le Camp MKR</span>
            <div className="mega-camp-grid">
              <div>
                <h2 className="mega-camp-feature-title">IMMERSION<br/>TOTALE.</h2>
                <p className="mega-camp-feature-body">Deux sessions par jour. Coaches daghestanais. Transport local, hebergement et repas pris en charge. Tu arrives avec ton sac. On s&apos;occupe du reste.</p>
                <Link href="/le-camp" className="mega-arrow-link">Decouvrir le camp {ARROW_RIGHT}</Link>
              </div>
              <div>
                <span className="mega-camp-links-label">Avant le camp</span>
                <ul className="mega-link-list" role="list">
                  <li><Link href="/comment-ca-marche">{ARROW_SM} Comment ca marche</Link></li>
                  <li><Link href="/preparer-son-camp">{ARROW_SM} Preparer son camp</Link></li>
                  <li><Link href="/logistique">{ARROW_SM} Logistique et visa</Link></li>
                  <li><Link href="/le-camp#journee-type">{ARROW_SM} Journee type</Link></li>
                  <li><Link href="/sessions">{ARROW_SM} Sessions et tarifs</Link></li>
                </ul>
              </div>
              <div className="mega-camp-accent" aria-hidden="true">
                <Image src="/images/environment/gym-interior.webp" alt="" className="mega-camp-accent-img" fill sizes="280px" />
                <h3 className="mega-camp-accent-title">TOUT<br/>COMPRIS.</h3>
                <span className="mega-camp-accent-sub">Dagestan · Tchetchenie · Georgie</span>
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
                  <svg viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="13" cy="9" r="4"/><path d="M5 26c0-5 3.5-8 8-8s8 3 8 8"/>
                    <line x1="19" y1="5" x2="24" y2="2.5"/><line x1="19" y1="9.5" x2="24" y2="11"/>
                  </svg>
                </div>
                <h3 className="mega-prog-title">MMA</h3>
                <p className="mega-prog-desc">Striking, clinch, takedowns, submissions. Sparring quotidien avec des combattants locaux. Transitions debout-sol.</p>
                <span className="mega-arrow-link">Voir le programme {ARROW_RIGHT}</span>
              </Link>
              <Link href="/programme/lutte" className="mega-prog-card">
                <Image src="/images/action/takedown-wrestling.webp" alt="" className="mega-prog-bg" fill sizes="(max-width: 768px) 100vw, 33vw" aria-hidden="true" />
                <div className="mega-prog-icon" aria-hidden="true">
                  <svg viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 19 L8 9 L13 15 L19 5 L23 13"/>
                    <circle cx="6" cy="20" r="2"/><circle cx="21" cy="14" r="2"/>
                  </svg>
                </div>
                <h3 className="mega-prog-title">LUTTE</h3>
                <p className="mega-prog-desc">Lutte libre et greco-romaine. Methodes daghestanaises transmises par des champions.</p>
                <span className="mega-arrow-link">Voir le programme {ARROW_RIGHT}</span>
              </Link>
              <Link href="/programme#conditioning" className="mega-prog-card">
                <Image src="/images/action/conditioning-rope.webp" alt="" className="mega-prog-bg" fill sizes="(max-width: 768px) 100vw, 33vw" aria-hidden="true" />
                <div className="mega-prog-icon" aria-hidden="true">
                  <svg viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="1" y="10" width="6" height="6"/><rect x="19" y="10" width="6" height="6"/>
                    <line x1="7" y1="13" x2="19" y2="13" strokeWidth="2.5"/>
                    <rect x="10" y="8" width="6" height="10"/>
                  </svg>
                </div>
                <h3 className="mega-prog-title">S&amp;C</h3>
                <p className="mega-prog-desc">Strength et Conditioning. Seances en montagne, gainage, endurance specifique. Inclus dans chaque session.</p>
                <span className="mega-arrow-link">Inclus dans le camp {CHECK_SM}</span>
              </Link>
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
            <span className="mega-section-label">Destinations 2026</span>
            <div className="mega-dest-grid">
              <Link href="/destinations/dagestan" className="mega-dest-card" aria-label="Explorer le Dagestan">
                <Image src="/images/environment/dagestan-panorama.webp" alt="" className="mega-dest-img" fill sizes="(max-width: 768px) 100vw, 50vw" aria-hidden="true" />
                <div className="mega-dest-overlay" aria-hidden="true"/>
                <div className="mega-dest-content">
                  <span className="mega-dest-region">Caucase · Russie</span>
                  <h2 className="mega-dest-name">DAGESTAN</h2>
                  <p className="mega-dest-tagline">La terre qui a forge les meilleurs combattants de la planete.</p>
                  <span className="mega-dest-cta">Explorer le Dagestan {ARROW_RIGHT}</span>
                </div>
              </Link>
              <Link href="/destinations/tchetchenie" className="mega-dest-card" aria-label="Explorer la Tchetchenie">
                <Image src="/images/environment/mosque-grozny.webp" alt="" className="mega-dest-img" fill sizes="(max-width: 768px) 100vw, 50vw" aria-hidden="true" />
                <div className="mega-dest-overlay" aria-hidden="true"/>
                <div className="mega-dest-content">
                  <span className="mega-dest-region">Caucase · Russie</span>
                  <h2 className="mega-dest-name">TCHETCHENIE</h2>
                  <p className="mega-dest-tagline">Grozny, le renouveau. Culture guerriere millenaire et salles de MMA parmi les mieux equipees.</p>
                  <span className="mega-dest-cta">Explorer la Tchetchenie {ARROW_RIGHT}</span>
                </div>
              </Link>
            </div>
            <div className="mega-dest-security" role="note">
              <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16" aria-hidden="true">
                <polygon points="9,1.5 16.5,5 16.5,13 9,16.5 1.5,13 1.5,5"/>
                <line x1="9" y1="8" x2="9" y2="12"/><circle cx="9" cy="6" r="0.5" fill="currentColor"/>
              </svg>
              <span className="mega-dest-security-text">
                Chaque destination inclut une section securite avec le niveau d&apos;alerte Quai d&apos;Orsay mis a jour.
              </span>
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
            <span className="mega-section-label">Informations et Ressources</span>
            <div className="mega-infos-grid">
              <div>
                <span className="mega-infos-col-label">Contenus</span>
                <ul className="mega-link-list" role="list">
                  <li><Link href="/galerie">{ARROW_SM} Galerie photos et videos</Link></li>
                  <li><Link href="/temoignages">{ARROW_SM} Temoignages athletes</Link></li>
                  <li><Link href="/blog">{ARROW_SM} Blog et articles</Link></li>
                  <li><Link href="/guide-dagestan">{ARROW_SM} Guide Dagestan PDF</Link></li>
                </ul>
              </div>
              <div>
                <span className="mega-infos-col-label">Pratique</span>
                <ul className="mega-link-list" role="list">
                  <li><Link href="/faq">{ARROW_SM} FAQ</Link></li>
                  <li><Link href="/a-propos">{ARROW_SM} A propos de MKR</Link></li>
                  <li><Link href="/contact">{ARROW_SM} Contact</Link></li>
                  <li><Link href="/inscription">{ARROW_SM} Inscription</Link></li>
                </ul>
              </div>
              <div className="mega-testi" aria-label="Temoignage athlete">
                <Image src="/images/testimonials/thomas-b.webp" alt="" className="mega-testi-avatar" width={40} height={40} aria-hidden="true" />
                <span className="mega-testi-quote-mark" aria-hidden="true">&ldquo;</span>
                <p className="mega-testi-quote">Deux semaines apres le retour, j&apos;ai remporte mon premier titre regional. Ce que j&apos;ai construit la-bas, aucun gym en France ne pouvait me le donner.</p>
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
            <Link href="/le-camp" className="mob-sub-link">Le Camp</Link>
            <Link href="/comment-ca-marche" className="mob-sub-link">Comment ca marche</Link>
            <Link href="/preparer-son-camp" className="mob-sub-link">Preparer son camp</Link>
            <Link href="/logistique" className="mob-sub-link">Logistique et visa</Link>
          </MobAccordion>
          <MobAccordion title="Programme" id="mob-prog">
            <Link href="/programme" className="mob-sub-link">Vue d&apos;ensemble</Link>
            <Link href="/programme/mma" className="mob-sub-link">MMA</Link>
            <Link href="/programme/lutte" className="mob-sub-link">Lutte</Link>
            <Link href="/coachs" className="mob-sub-link">Nos coachs</Link>
          </MobAccordion>
          <MobAccordion title="Destinations" id="mob-dest">
            <Link href="/destinations/dagestan" className="mob-sub-link">Dagestan</Link>
            <Link href="/destinations/tchetchenie" className="mob-sub-link">Tchetchenie</Link>
          </MobAccordion>
          <MobAccordion title="Informations" id="mob-infos">
            <Link href="/galerie" className="mob-sub-link">Galerie</Link>
            <Link href="/temoignages" className="mob-sub-link">Temoignages</Link>
            <Link href="/faq" className="mob-sub-link">FAQ</Link>
            <Link href="/blog" className="mob-sub-link">Blog</Link>
            <Link href="/a-propos" className="mob-sub-link">A propos</Link>
            <Link href="/contact" className="mob-sub-link">Contact</Link>
          </MobAccordion>
          <Link href="/sessions" className="mob-direct">Sessions 2026</Link>
          <div className="mob-cta-wrap">
            <Link href="/inscription" className="mob-cta">RESERVER MON CAMP</Link>
          </div>
        </div>
      </div>
    </>
  )
}
