'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import IconLutte from '@/components/icons/IconLutte'
import IconMMA from '@/components/icons/IconMMA'
import Icon from './Icon'
import LocaleSwitcher from './LocaleSwitcher'
import { SOCIALS, WHATSAPP } from '@/data/site'
import { getSessions, sessionYearRange } from '@/data/sessions'
import { hydrateSessions } from '@/lib/session-display'

const CHEVRON = <Icon name="chevron-down" size={10} className="nav-trigger-arrow" />
const ARROW_RIGHT = <Icon name="arrow-right" size={13} />
const ARROW_SM = <Icon name="chevron-right" size={10} />
const MOBILE_CHEVRON = <Icon name="chevron-down" size={18} />

/* ── Mobile & mega menu link icons ──
 * Wrapper React.ReactNode pour pouvoir mixer Icon Remix + composants métier
 * (IconLutte / IconMMA) sans casser le mapping existant Record<string, ReactNode>. */
const ICO: Record<string, React.ReactNode> = {
  home: <Icon name="home" size={18} />,
  camp: <Icon name="mountain" size={18} />,
  howItWorks: <Icon name="clock" size={18} />,
  prepare: <Icon name="book-open" size={18} />,
  logistics: <Icon name="taxi" size={18} />,
  dayType: <Icon name="sparkles" size={18} />,
  sessions: <Icon name="calendar-event" size={18} />,
  overview: <Icon name="filter" size={18} />,
  mma: <IconMMA className="nav-ico-discipline" />,
  lutte: <IconLutte className="nav-ico-discipline" />,
  coaches: <Icon name="user" size={18} />,
  dagestan: <Icon name="map-pin" size={18} />,
  gallery: <Icon name="image" size={18} />,
  testimonials: <Icon name="quote" size={18} />,
  faq: <Icon name="question" size={18} />,
  blog: <Icon name="edit" size={18} />,
  about: <Icon name="info" size={18} />,
  contact: <Icon name="mail" size={18} />,
  inscription: <Icon name="send" size={18} />,
  guide: <Icon name="book-open" size={18} />,
  calendar: <Icon name="calendar" size={18} />,
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
  const t = useTranslations('common.nav')
  const tSessions = useTranslations('data.sessions')
  // Les 4 entrees « sessions officielles » du menu suivent la fenetre glissante
  // (cf. data/sessions.ts) : aucune date en dur a maintenir dans les traductions.
  const navSessions = hydrateSessions(getSessions(), tSessions as never)
  const navSessionYears = sessionYearRange(navSessions)
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

  /* Scroll-lock body + <html> quand le drawer mobile/tablette est ouvert.
     `body.style.overflow = 'hidden'` seul ne suffit PAS sur iOS Safari :
     le contenu derrière continue de scroller au touch. On applique le
     pattern `position: fixed; top: -scrollY` (cf. VideoModal.tsx) qui fige
     vraiment le body et restaure la position de scroll à la fermeture.
     Couvre aussi `activePanel` au cas où un mega panel serait ouvert au
     touch sur tablette (boutons .nav-list visibles ≥1024px).

     IMPORTANT : on capture `lockedPath = pathname` à l'ouverture et on ne
     restaure window.scrollTo(0, scrollY) QUE si on est encore sur la
     meme page. Sinon le cleanup ecraserait le scrollTo(0,0) de
     RouteScrollReset quand l'utilisateur clique un lien dans le menu. */
  useEffect(() => {
    const locked = menuOpen || activePanel !== null
    if (!locked) return

    const scrollY = window.scrollY
    const lockedPath = pathname
    const body = document.body
    const html = document.documentElement
    const prev = {
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      bodyOverflow: body.style.overflow,
      htmlOverflow: html.style.overflow,
    }
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    body.style.overflow = 'hidden'
    html.style.overflow = 'hidden'

    return () => {
      body.style.position = prev.bodyPosition
      body.style.top = prev.bodyTop
      body.style.left = prev.bodyLeft
      body.style.right = prev.bodyRight
      body.style.width = prev.bodyWidth
      body.style.overflow = prev.bodyOverflow
      html.style.overflow = prev.htmlOverflow
      if (window.location.pathname === lockedPath) {
        window.scrollTo(0, scrollY)
      }
    }
  }, [menuOpen, activePanel, pathname])

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

  const triggerKey: Record<PanelId, 'le_camp' | 'programme' | 'destinations' | 'infos'> = {
    camp: 'le_camp',
    programme: 'programme',
    destinations: 'destinations',
    infos: 'infos',
  }

  return (
    <>
      <header id="site-header">
        <nav id="nav" className={scrolled ? 'is-scrolled' : ''} aria-label={t('main_aria')}>
          <div className="nav-inner">

            <Link href="/" className="nav-logo" aria-label={t('logo_home_aria')}>
              <Image src="/logo-white.webp" alt={t('logo_alt')} className="nav-logo-img" width={320} height={193} priority />
            </Link>

            <ul className="nav-list" role="list">
              <li>
                <Link
                  href="/"
                  className="nav-trigger nav-home"
                  aria-current={pathname === '/' ? 'page' : undefined}
                >
                  {ICO.home}
                  {t('home')}
                </Link>
              </li>
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
                    {t(`triggers.${triggerKey[id]}`)}
                    {CHEVRON}
                  </button>
                </li>
              ))}
              {/* Contact en acces direct : il n'existait que dans le mega panel
                  « Decouvrir » et dans le drawer mobile, donc a deux clics d'un
                  visiteur qui veut juste poser une question. */}
              <li>
                <Link
                  href="/contact"
                  className="nav-trigger nav-home"
                  aria-current={pathname === '/contact' ? 'page' : undefined}
                >
                  {ICO.contact}
                  {t('contact')}
                </Link>
              </li>
            </ul>

            <div className="nav-right">
              <LocaleSwitcher variant="desktop" />
              <a
                href={SOCIALS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-ig"
                aria-label={t('social_instagram_aria')}
              >
                <span className="nav-ig-icon" aria-hidden="true"><Icon name="instagram" size={18} /></span>
                <span className="nav-ig-handle">{t('social_instagram_handle')}</span>
              </a>
              <Link href="/inscription" className="nav-cta" aria-label={t('cta_apply_aria')}>{t('cta_apply')}</Link>
              <button
                className={`nav-hamburger${menuOpen ? ' open' : ''}`}
                aria-label={menuOpen ? t('menu_close') : t('menu_open')}
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
            <span className="mega-section-label">{t('panels.le_camp.section_label')}</span>
            <div className="mega-camp-grid">
              <div>
                <h2 className="mega-camp-feature-title">{t('panels.le_camp.feature_title_part1')}<br/>{t('panels.le_camp.feature_title_part2')}</h2>
                <p className="mega-camp-feature-body">{t('panels.le_camp.feature_body')}</p>
                <Link href="/sessions" className="mega-arrow-link">{t('panels.le_camp.feature_link')} {ARROW_RIGHT}</Link>
              </div>
              <div>
                <span className="mega-camp-links-label">{t('panels.le_camp.sessions_label', { years: navSessionYears })}</span>
                <ul className="mega-link-list" role="list">
                  {navSessions.map(s => (
                    <li key={s.id}>
                      <Link href={{ pathname: '/sessions', hash: s.id }}>{ICO.sessions} {s.short_label} {ARROW_SM}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="mega-camp-links-label">{t('panels.le_camp.formats_label')}</span>
                <ul className="mega-link-list" role="list">
                  <li><Link href="/sur-mesure">{ICO.calendar} {t('panels.le_camp.formats.sur_mesure')} {ARROW_SM}</Link></li>
                  <li><Link href="/familles">{ICO.coaches} {t('panels.le_camp.formats.famille')} {ARROW_SM}</Link></li>
                  <li><Link href="/clubs-groupes">{ICO.coaches} {t('panels.le_camp.formats.groupe')} {ARROW_SM}</Link></li>
                  <li><Link href="/comment-ca-marche">{ICO.howItWorks} {t('panels.le_camp.formats.comment_ca_marche')} {ARROW_SM}</Link></li>
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
            <span className="mega-section-label">{t('panels.programme.section_label')}</span>
            <div className="mega-prog-grid">
              <Link href="/programme/mma" className="mega-prog-card">
                <Image src="/images/action/sparring-mma-wall.webp" alt="" className="mega-prog-bg" fill sizes="(max-width: 768px) 100vw, 33vw" aria-hidden="true" />
                <div className="mega-prog-icon" aria-hidden="true">
                  <IconMMA />
                </div>
                <h3 className="mega-prog-title">{t('panels.programme.mma_title')}</h3>
                <p className="mega-prog-desc">{t('panels.programme.mma_desc')}</p>
                <span className="mega-arrow-link">{t('panels.programme.card_link')} {ARROW_RIGHT}</span>
              </Link>
              <Link href="/programme/lutte" className="mega-prog-card">
                <Image src="/images/action/takedown-wrestling.webp" alt="" className="mega-prog-bg" fill sizes="(max-width: 768px) 100vw, 33vw" aria-hidden="true" />
                <div className="mega-prog-icon" aria-hidden="true">
                  <IconLutte />
                </div>
                <h3 className="mega-prog-title">{t('panels.programme.lutte_title')}</h3>
                <p className="mega-prog-desc">{t('panels.programme.lutte_desc')}</p>
                <span className="mega-arrow-link">{t('panels.programme.card_link')} {ARROW_RIGHT}</span>
              </Link>
              <Link href="/programme/lutte-enfants" className="mega-prog-card">
                <Image src="/images/ruslan/lutte/kids-briefing.webp" alt="" className="mega-prog-bg" fill sizes="(max-width: 768px) 100vw, 33vw" aria-hidden="true" />
                <div className="mega-prog-icon" aria-hidden="true">
                  <IconLutte />
                </div>
                <h3 className="mega-prog-title">{t('panels.programme.jeunesse_title')}</h3>
                <p className="mega-prog-desc">{t('panels.programme.jeunesse_desc')}</p>
                <span className="mega-arrow-link">{t('panels.programme.card_link')} {ARROW_RIGHT}</span>
              </Link>
            </div>
            <div className="mega-prog-secondary">
              <Link href="/programme" className="mega-prog-secondary-link">{ICO.overview} {t('panels.programme.secondary.overview')} {ARROW_SM}</Link>
              <Link href="/temoignages" className="mega-prog-secondary-link">{ICO.testimonials} {t('panels.programme.secondary.temoignages')} {ARROW_SM}</Link>
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
            <span className="mega-section-label">{t('panels.destinations.section_label')}</span>
            <div className="mega-dest-layout mega-dest-layout--dual">
              <Link href="/destinations/dagestan" className="mega-dest-card mega-dest-card--dual" aria-label={t('panels.destinations.dagestan_aria')}>
                <Image src="/images/environment/dagestan-panorama.webp" alt="" className="mega-dest-img" fill sizes="(max-width: 768px) 100vw, 40vw" aria-hidden="true" />
                <div className="mega-dest-overlay" aria-hidden="true"/>
                <div className="mega-dest-content">
                  <span className="mega-dest-region">{t('panels.destinations.dagestan_region')}</span>
                  <h2 className="mega-dest-name">{t('panels.destinations.dagestan_name')}</h2>
                  <p className="mega-dest-tagline">{t('panels.destinations.dagestan_tagline')}</p>
                  <span className="mega-dest-cta">{t('panels.destinations.dagestan_cta')} {ARROW_RIGHT}</span>
                </div>
              </Link>
              <Link href="/destinations/tchetchenie" className="mega-dest-card mega-dest-card--dual" aria-label={t('panels.destinations.tchetchenie_aria')}>
                <Image src="/images/environment/dagestan-panorama.webp" alt="" className="mega-dest-img" fill sizes="(max-width: 768px) 100vw, 40vw" aria-hidden="true" />
                <div className="mega-dest-overlay" aria-hidden="true"/>
                <div className="mega-dest-content">
                  <span className="mega-dest-region">{t('panels.destinations.tchetchenie_region')}</span>
                  <h2 className="mega-dest-name">{t('panels.destinations.tchetchenie_name')}</h2>
                  <p className="mega-dest-tagline">{t('panels.destinations.tchetchenie_tagline')}</p>
                  <span className="mega-dest-cta">{t('panels.destinations.tchetchenie_cta')} {ARROW_RIGHT}</span>
                </div>
              </Link>
              <div className="mega-dest-aside">
                <span className="mega-camp-links-label">{t('panels.destinations.aside_label')}</span>
                <ul className="mega-link-list" role="list">
                  <li><Link href="/destinations">{ICO.dagestan} {t('panels.destinations.aside.overview')} {ARROW_SM}</Link></li>
                  <li><Link href="/logistique">{ICO.logistics} {t('panels.destinations.aside.logistique')} {ARROW_SM}</Link></li>
                  <li><Link href="/guide-caucase">{ICO.guide} {t('panels.destinations.aside.guide')} {ARROW_SM}</Link></li>
                </ul>
                <div className="mega-dest-security" role="note">
                  <Icon name="alert" size={16} />
                  <span className="mega-dest-security-text">
                    {t('panels.destinations.combo_note')}
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
            <span className="mega-section-label">{t('panels.infos.section_label')}</span>
            <div className="mega-infos-grid">
              <div>
                <span className="mega-infos-col-label">{t('panels.infos.col_see_label')}</span>
                <ul className="mega-link-list" role="list">
                  <li><Link href="/galerie">{ICO.gallery} {t('panels.infos.col_see.galerie')} {ARROW_SM}</Link></li>
                  <li><Link href="/temoignages">{ICO.testimonials} {t('panels.infos.col_see.temoignages')} {ARROW_SM}</Link></li>
                  <li><Link href="/blog">{ICO.blog} {t('panels.infos.col_see.blog')} {ARROW_SM}</Link></li>
                </ul>
              </div>
              <div>
                <span className="mega-infos-col-label">{t('panels.infos.col_understand_label')}</span>
                <ul className="mega-link-list" role="list">
                  <li><Link href="/faq">{ICO.faq} {t('panels.infos.col_understand.faq')} {ARROW_SM}</Link></li>
                  <li><Link href="/a-propos">{ICO.about} {t('panels.infos.col_understand.a_propos')} {ARROW_SM}</Link></li>
                  <li><Link href="/contact">{ICO.contact} {t('panels.infos.col_understand.contact')} {ARROW_SM}</Link></li>
                </ul>
              </div>
              <div className="mega-testi" aria-label={t('panels.infos.testi_aria')}>
                <Image src="/images/testimonials/thomas-b.webp" alt="" className="mega-testi-avatar" width={40} height={40} aria-hidden="true" />
                <span className="mega-testi-quote-mark" aria-hidden="true">&ldquo;</span>
                <p className="mega-testi-quote">{t('panels.infos.testi_quote')}</p>
                <span className="mega-testi-name">{t('panels.infos.testi_name')}</span>
                <span className="mega-testi-meta">{t('panels.infos.testi_meta')}</span>
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
        aria-label={t('mobile_menu_aria')}
        aria-hidden={!menuOpen}
        className={menuOpen ? 'is-open' : ''}
      >
        <div className="mobile-inner">
          <LocaleSwitcher variant="mobile" />
          <div className="mob-acc">
            <Link
              href="/"
              className="mob-home-link"
              aria-current={pathname === '/' ? 'page' : undefined}
            >
              {t('home')}
            </Link>
          </div>
          <MobAccordion title={t('mobile.le_camp_title')} id="mob-camp">
            <span className="mob-sub-label">{t('mobile.sessions_label', { years: navSessionYears })}</span>
            {navSessions.map(s => (
              <Link key={s.id} href={{ pathname: '/sessions', hash: s.id }} className="mob-sub-link">{ICO.sessions} {s.short_label}</Link>
            ))}
            <span className="mob-sub-label">{t('mobile.formats_label')}</span>
            <Link href="/sur-mesure" className="mob-sub-link">{ICO.calendar} {t('panels.le_camp.formats.sur_mesure')}</Link>
            <Link href="/familles" className="mob-sub-link">{ICO.coaches} {t('panels.le_camp.formats.famille')}</Link>
            <Link href="/clubs-groupes" className="mob-sub-link">{ICO.coaches} {t('panels.le_camp.formats.groupe')}</Link>
            <Link href="/sessions" className="mob-sub-link">{ICO.sessions} {t('mobile.see_all_prices')}</Link>
            <span className="mob-sub-label">{t('mobile.prepare_label')}</span>
            <Link href="/le-camp" className="mob-sub-link">{ICO.camp} {t('mobile.prepare.le_camp')}</Link>
            <Link href="/comment-ca-marche" className="mob-sub-link">{ICO.howItWorks} {t('mobile.prepare.comment_ca_marche')}</Link>
            <Link href="/preparer-son-camp" className="mob-sub-link">{ICO.prepare} {t('mobile.prepare.preparer_son_camp')}</Link>
          </MobAccordion>
          <MobAccordion title={t('mobile.programme_title')} id="mob-prog">
            <Link href="/programme" className="mob-sub-link">{ICO.overview} {t('mobile.programme.overview')}</Link>
            <Link href="/programme/mma" className="mob-sub-link">{ICO.mma} {t('mobile.programme.mma')}</Link>
            <Link href="/programme/lutte" className="mob-sub-link">{ICO.lutte} {t('mobile.programme.lutte_adultes')}</Link>
            <Link href="/programme/lutte-enfants" className="mob-sub-link">{ICO.lutte} {t('mobile.programme.jeunesse')}</Link>
          </MobAccordion>
          <MobAccordion title={t('mobile.destinations_title')} id="mob-dest">
            <span className="mob-sub-label">{t('mobile.destinations.label_by_discipline')}</span>
            <Link href="/destinations/dagestan" className="mob-sub-link">{ICO.dagestan} {t('mobile.destinations.dagestan')}</Link>
            <Link href="/destinations/tchetchenie" className="mob-sub-link">{ICO.dagestan} {t('mobile.destinations.tchetchenie')}</Link>
            <Link href="/destinations" className="mob-sub-link">{ICO.overview} {t('mobile.destinations.overview')}</Link>
            <span className="mob-sub-label">{t('mobile.destinations.label_prepare')}</span>
            <Link href="/logistique" className="mob-sub-link">{ICO.logistics} {t('mobile.destinations.logistique')}</Link>
            <Link href="/guide-caucase" className="mob-sub-link">{ICO.guide} {t('mobile.destinations.guide')}</Link>
          </MobAccordion>
          <MobAccordion title={t('mobile.infos_title')} id="mob-decouvrir">
            <Link href="/galerie" className="mob-sub-link">{ICO.gallery} {t('mobile.infos.galerie')}</Link>
            <Link href="/temoignages" className="mob-sub-link">{ICO.testimonials} {t('mobile.infos.temoignages')}</Link>
            <Link href="/blog" className="mob-sub-link">{ICO.blog} {t('mobile.infos.blog')}</Link>
            <Link href="/faq" className="mob-sub-link">{ICO.faq} {t('mobile.infos.faq')}</Link>
            <Link href="/a-propos" className="mob-sub-link">{ICO.about} {t('mobile.infos.a_propos')}</Link>
            <Link href="/contact" className="mob-sub-link">{ICO.contact} {t('mobile.infos.contact')}</Link>
          </MobAccordion>
          {/* Contact en acces direct, en dernier, comme dans la barre desktop.
              Il n'existait ici que dans l'accordeon « Decouvrir », donc a deux
              gestes. On le garde AUSSI dans l'accordeon : le desktop fait
              pareil, la barre et le mega panel « Decouvrir » le portent tous
              les deux. */}
          <div className="mob-acc">
            <Link
              href="/contact"
              className="mob-home-link"
              aria-current={pathname === '/contact' ? 'page' : undefined}
            >
              {t('contact')}
            </Link>
          </div>
          <div className="mob-cta-wrap">
            <a
              href={SOCIALS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mob-instagram"
              aria-label={t('social_instagram_aria')}
            >
              <Icon name="instagram" size={20} />
              {t('mobile.cta_instagram')}
            </a>
            <a
              href={WHATSAPP.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mob-whatsapp"
              aria-label={t('mobile.cta_whatsapp_aria')}
            >
              <Icon name="whatsapp" size={20} />
              {t('mobile.cta_whatsapp')}
            </a>
            <Link href="/inscription" className="mob-cta">{t('mobile.cta_apply')}</Link>
          </div>
        </div>
      </div>
    </>
  )
}
