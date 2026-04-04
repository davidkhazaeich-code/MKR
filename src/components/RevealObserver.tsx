'use client'

import { useEffect } from 'react'

export default function RevealObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -36px 0px' }
    )

    function observeAll(root: ParentNode) {
      root.querySelectorAll<HTMLElement>('.reveal:not(.visible), .reveal-clip:not(.visible)').forEach(el => {
        io.observe(el)
      })
    }

    // Observe existing elements
    observeAll(document)

    // Watch for dynamically added elements (tab switches, filters, etc.)
    const mo = new MutationObserver(mutations => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node instanceof HTMLElement) {
            if (node.matches('.reveal, .reveal-clip')) io.observe(node)
            observeAll(node)
          }
        }
      }
    })

    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])

  return null
}
