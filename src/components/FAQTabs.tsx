'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import FAQAccordion from './FAQAccordion'
import { getFaqCategories } from '@/data/faq'

export default function FAQTabs() {
  const tData = useTranslations('data.faq')
  const tSessions = useTranslations('data.sessions')
  const categories = getFaqCategories(tData as never, tSessions as never)
  const [activeTab, setActiveTab] = useState(categories[0]?.id ?? '')
  const activeCategory = categories.find(c => c.id === activeTab) ?? categories[0]

  if (!activeCategory) return null

  return (
    <section className="faq-page-section fx-grid fx-glow fx-glow-breathe fx-stack-1">
      <div className="fx-glow-orb fx-glow-orb--top" />
      <div className="inner">
        <div className="filter-tabs">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`filter-tab${activeTab === cat.id ? ' is-active' : ''}`}
              onClick={() => setActiveTab(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <FAQAccordion items={activeCategory.items} id={`faq-${activeCategory.id}`} />
      </div>
    </section>
  )
}
