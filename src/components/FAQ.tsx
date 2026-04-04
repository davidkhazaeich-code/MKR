'use client'

import { useState } from 'react'

const faqData = [
  {
    q: 'Quel niveau est requis ?',
    a: "Le camp est ouvert aux pratiquants intermédiaires et avancés. Une pratique régulière d'au moins 2 ans en MMA, lutte ou art martial de combat est requise. Le niveau est évalué lors de l'entretien vidéo.",
    delay: '0s',
  },
  {
    q: 'Le visa est-il nécessaire pour la Géorgie ?',
    a: "Les ressortissants de l'UE, Suisse, France et Canada n'ont pas besoin de visa pour la Géorgie pour des séjours inférieurs à 365 jours. L'entrée se fait avec le passeport.",
    delay: '0.05s',
  },
  {
    q: "Qu'est-ce qui est inclus dans le prix ?",
    a: "Le tarif comprend l'hébergement en logement de camp, les repas (3 repas/jour), les séances d'entraînement biquotidiennes, les transferts aéroport-camp, et le suivi préparatoire à distance. Le vol international n'est pas inclus.",
    delay: '0.1s',
  },
  {
    q: "Quelle est la langue d'entraînement ?",
    a: "Les entraînements se déroulent principalement en géorgien et en russe. Un interprète est présent pour le français et l'anglais. L'immersion linguistique fait partie de l'expérience.",
    delay: '0.15s',
  },
  {
    q: 'Quel équipement dois-je apporter ?',
    a: "Kimono (si tu pratiques la lutte), gants de boxe (16 oz), protège-tibias, protège-dents et coquille. Un guide complet de préparation est envoyé après confirmation de ta candidature.",
    delay: '0.2s',
  },
  {
    q: 'Combien de participants par session ?',
    a: "Maximum 15 participants par session pour garantir un suivi individualisé. Les places sont limitées volontairement. La sélection est réelle.",
    delay: '0.25s',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (i: number) => {
    setOpenIndex(prev => (prev === i ? null : i))
  }

  return (
    <section id="faq" aria-labelledby="faq-heading">
      <div className="inner">
        <div className="faq-header reveal">
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
            QUESTIONS FRÉQUENTES
          </span>
          <h2 id="faq-heading" className="faq-title">FAQ</h2>
        </div>

        <div className="faq-grid">
          {[0, 1].map(col => (
            <div key={col} className="faq-col">
              {faqData
                .map((item, i) => ({ item, i }))
                .filter(({ i }) => i % 2 === col)
                .map(({ item, i }) => (
                  <div
                    key={i}
                    className="faq-item reveal"
                    style={{ transitionDelay: item.delay }}
                  >
                    <button
                      className="faq-question"
                      onClick={() => toggle(i)}
                      aria-expanded={openIndex === i}
                    >
                      {item.q}
                      <span className={`faq-question-icon${openIndex === i ? ' open' : ''}`}>
                        +
                      </span>
                    </button>
                    {openIndex === i && (
                      <div className="faq-answer-wrap">
                        <p className="faq-answer">{item.a}</p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
