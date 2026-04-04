'use client'

import { useState } from 'react'
import { FAQ_HOMEPAGE } from '@/data/faq'

const DELAY_STEP = 0.05

export default function FAQ() {
  const [openSet, setOpenSet] = useState<Set<number>>(new Set())

  const toggle = (i: number) => {
    setOpenSet(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  return (
    <section id="faq" aria-labelledby="faq-heading">
      <div className="faq-glow" aria-hidden="true" />
      <div className="inner">
        <div className="faq-header reveal">
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
            QUESTIONS FRÉQUENTES
          </span>
          <h2 id="faq-heading" className="faq-title">FAQ</h2>
        </div>

        <div className="faq-grid">
          <div className="faq-col">
            {FAQ_HOMEPAGE.filter((_, i) => i % 2 === 0).map((item, idx) => {
              const i = idx * 2
              return (
                <div key={i} className="faq-item reveal" style={{ transitionDelay: `${i * DELAY_STEP}s` }}>
                  <button className="faq-question" onClick={() => toggle(i)} aria-expanded={openSet.has(i)}>
                    {item.question}
                    <span className={`faq-question-icon${openSet.has(i) ? ' open' : ''}`}>+</span>
                  </button>
                  <div className={`faq-answer-wrap${openSet.has(i) ? ' open' : ''}`} aria-hidden={!openSet.has(i)}>
                    <p className="faq-answer">{item.answer}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="faq-col">
            {FAQ_HOMEPAGE.filter((_, i) => i % 2 === 1).map((item, idx) => {
              const i = idx * 2 + 1
              return (
                <div key={i} className="faq-item reveal" style={{ transitionDelay: `${i * DELAY_STEP}s` }}>
                  <button className="faq-question" onClick={() => toggle(i)} aria-expanded={openSet.has(i)}>
                    {item.question}
                    <span className={`faq-question-icon${openSet.has(i) ? ' open' : ''}`}>+</span>
                  </button>
                  <div className={`faq-answer-wrap${openSet.has(i) ? ' open' : ''}`} aria-hidden={!openSet.has(i)}>
                    <p className="faq-answer">{item.answer}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
