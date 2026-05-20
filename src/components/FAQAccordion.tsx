'use client'

import { useState } from 'react'
import type { FAQItem } from '@/data/faq'
import Icon from './Icon'

export type { FAQItem }

interface FAQAccordionProps {
  items: FAQItem[]
  id?: string
}

export default function FAQAccordion({ items, id = 'faq' }: FAQAccordionProps) {
  const [open, setOpen] = useState<Set<number>>(new Set())

  function toggle(i: number) {
    setOpen(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <div className="faq-list">
      {items.map((item, i) => {
        const isOpen = open.has(i)
        return (
          <div key={i} className={`faq-item${isOpen ? ' is-open' : ''}`}>
            <button
              className="faq-question"
              aria-expanded={isOpen}
              aria-controls={`${id}-answer-${i}`}
              onClick={() => toggle(i)}
            >
              <span>{item.question}</span>
              <span className="faq-chevron">
                <Icon name="chevron-down" size={24} />
              </span>
            </button>
            <div
              id={`${id}-answer-${i}`}
              className="faq-answer"
              role="region"
              aria-hidden={!isOpen}
            >
              <p>{item.answer}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
