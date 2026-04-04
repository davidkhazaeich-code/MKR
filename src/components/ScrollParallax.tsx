'use client'

import { useEffect } from 'react'

export default function ScrollParallax() {
  useEffect(() => {
    let ctx: ReturnType<typeof import('gsap')['gsap']['context']> | undefined

    async function init() {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      ctx = gsap.context(() => {
        const mm = gsap.matchMedia()

        mm.add(
          '(min-width: 769px) and (prefers-reduced-motion: no-preference)',
          () => {
            /* ── Section content parallax ── */
            const sections = gsap.utils.toArray<HTMLElement>(
              '#video-section, #philosophie, #coaches, #sessions, #timeline, #testimonials, #contact, #faq, #cta-final',
            )

            sections.forEach((section, i) => {
              const content = section.querySelector<HTMLElement>(
                '.inner, .testi-layout, .cta-inner',
              )
              if (!content) return

              // Alternate intensity between adjacent sections for depth
              const shift = i % 2 === 0 ? 30 : 20

              gsap.fromTo(
                content,
                { y: shift },
                {
                  y: -shift,
                  ease: 'none',
                  scrollTrigger: {
                    trigger: section,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0.6,
                  },
                },
              )
            })

            /* ── Glow / decorative element parallax (slower) ── */
            const glows = gsap.utils.toArray<HTMLElement>(
              '.video-glow, .testimonials-glow, .cta-glow, .summit-glow, .coaches-glow, .contact-glow, .faq-glow',
            )

            glows.forEach((el) => {
              gsap.to(el, {
                y: -50,
                ease: 'none',
                scrollTrigger: {
                  trigger: el.closest('section') || el.parentElement,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 1.2,
                },
              })
            })

            /* ── Coach cards stagger parallax ── */
            const coachCards = gsap.utils.toArray<HTMLElement>('.coach-card')
            coachCards.forEach((card, i) => {
              gsap.fromTo(
                card,
                { y: 15 + i * 5 },
                {
                  y: -(10 + i * 3),
                  ease: 'none',
                  scrollTrigger: {
                    trigger: '#coaches',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0.8,
                  },
                },
              )
            })

            /* ── Session cards stagger parallax ── */
            const sessionCards = gsap.utils.toArray<HTMLElement>('.session-card')
            sessionCards.forEach((card, i) => {
              gsap.fromTo(
                card,
                { y: 12 + i * 4 },
                {
                  y: -(8 + i * 3),
                  ease: 'none',
                  scrollTrigger: {
                    trigger: '#sessions',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0.8,
                  },
                },
              )
            })

            /* ── Bento cards depth parallax ── */
            const bentoCards = gsap.utils.toArray<HTMLElement>('.bento-card')
            bentoCards.forEach((card, i) => {
              gsap.fromTo(
                card,
                { y: 20 },
                {
                  y: -(10 + i * 5),
                  ease: 'none',
                  scrollTrigger: {
                    trigger: '#philosophie',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0.7,
                  },
                },
              )
            })
          },
        )
      })
    }

    init()
    return () => { ctx?.revert() }
  }, [])

  return null
}
