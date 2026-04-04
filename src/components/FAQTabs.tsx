'use client'

import { useState } from 'react'
import FAQAccordion from './FAQAccordion'
import { FAQ_CATEGORIES } from '@/data/faq'

export default function FAQTabs() {
  const [activeTab, setActiveTab] = useState(FAQ_CATEGORIES[0].id)
  const activeCategory = FAQ_CATEGORIES.find(c => c.id === activeTab) ?? FAQ_CATEGORIES[0]

  return (
    <section className="faq-page-section">
      <div className="inner">
        <div className="filter-tabs">
          {FAQ_CATEGORIES.map(cat => (
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
