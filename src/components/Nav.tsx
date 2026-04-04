'use client'

import { useState, useEffect, useCallback } from 'react'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Scroll shrink
  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 80)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) closeMenu()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const openMenu = useCallback(() => setMenuOpen(true), [])
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const toggleMenu = useCallback(() => setMenuOpen(v => !v), [])

  // Smooth anchor scroll
  const handleAnchorClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      const targetId = href.replace('#', '')
      const target = document.getElementById(targetId)
      if (!target) return
      e.preventDefault()
      const nav = document.getElementById('nav')
      const offset = nav ? nav.offsetHeight : 64
      const top = target.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
      closeMenu()
    },
    [closeMenu]
  )

  const links = [
    { href: '#video-section', label: 'Camp' },
    { href: '#coaches', label: 'Coaches' },
    { href: '#sessions', label: 'Sessions' },
    { href: '#contact', label: 'Contact' },
  ]

  return (
    <>
      <nav id="nav" className={scrolled ? 'scrolled' : ''} aria-label="Navigation principale">
        <a
          href="/"
          className="nav-logo"
          aria-label="MKR Caucasian Camp · Accueil"
        >
          <span className="nav-logo-mkr">MKR</span>
          <span className="nav-logo-sub">Caucasian Camp</span>
        </a>

        <ul className="nav-links" role="list">
          {links.map(l => (
            <li key={l.href}>
              <a href={l.href} onClick={e => handleAnchorClick(e, l.href)}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="/inscription"
          className="nav-cta"
          aria-label="S'inscrire au camp"
        >
          S&apos;INSCRIRE
        </a>

        <button
          className={`nav-hamburger${menuOpen ? ' open' : ''}`}
          id="hamburger"
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* Mobile fullscreen menu */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-label="Menu principal"
        aria-hidden={!menuOpen}
        className={menuOpen ? 'open' : ''}
      >
        <ul className="mobile-menu-links" role="list">
          {links.map(l => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={e => handleAnchorClick(e, l.href)}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="/inscription"
          className="mobile-menu-cta"
        >
          S&apos;INSCRIRE
        </a>
      </div>
    </>
  )
}
