import { useTranslations } from 'next-intl'
import Icon from './Icon'

export default function Timeline() {
  const t = useTranslations('home.timeline')
  return (
    <section id="timeline" aria-labelledby="timeline-heading">
      <div className="inner">
        <div className="timeline-header reveal">
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
            {t('label')}
          </span>
          <h2 id="timeline-heading" className="timeline-title">
            {t('title_line1')}<br />{t('title_line2')}
          </h2>
        </div>

        <div className="timeline-track">

          {/* Step 1 -Candidature (GAUCHE : image à l'extérieur, texte vers la ligne) */}
          <div className="timeline-step reveal">
            <div className="timeline-panel">
              <div className="timeline-step-img reveal-clip">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="timeline-step-photo" src="/images/action/solo-readiness.webp" alt={t('steps.01.img_alt')} />
                <div className="timeline-step-img-inner"></div>
              </div>
              <div className="timeline-text">
                <div className="timeline-step-icon" aria-hidden="true" style={{ color: 'var(--primary)' }}>
                  <Icon name="edit" size={32} />
                </div>
                <div className="timeline-num">{t('steps.01.num')}</div>
                <h3 className="timeline-step-title">{t('steps.01.title')}</h3>
                <p className="timeline-step-body">{t('steps.01.body')}</p>
              </div>
            </div>
            <div className="timeline-dot-wrap">
              <div className="timeline-dot"></div>
            </div>
            <div className="timeline-empty"></div>
          </div>

          {/* Step 2 -Entretien (DROITE : texte vers la ligne, image à l'extérieur) */}
          <div className="timeline-step timeline-step--reversed reveal" style={{ transitionDelay: '0.1s' }}>
            <div className="timeline-empty"></div>
            <div className="timeline-dot-wrap">
              <div className="timeline-dot"></div>
            </div>
            <div className="timeline-panel">
              <div className="timeline-text">
                <div className="timeline-step-icon" aria-hidden="true" style={{ color: 'var(--primary)' }}>
                  <Icon name="chat" size={32} />
                </div>
                <div className="timeline-num">{t('steps.02.num')}</div>
                <h3 className="timeline-step-title">{t('steps.02.title')}</h3>
                <p className="timeline-step-body">{t('steps.02.body')}</p>
              </div>
              <div className="timeline-step-img reveal-clip">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="timeline-step-photo" src="/images/action/candidate-interview.webp" alt={t('steps.02.img_alt')} />
                <div className="timeline-step-img-inner"></div>
              </div>
            </div>
          </div>

          {/* Step 3 -Confirmation (GAUCHE : image à l'extérieur, texte vers la ligne) */}
          <div className="timeline-step reveal" style={{ transitionDelay: '0.2s' }}>
            <div className="timeline-panel">
              <div className="timeline-step-img reveal-clip">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="timeline-step-photo" src="/images/action/hand-wraps.webp" alt={t('steps.03.img_alt')} />
                <div className="timeline-step-img-inner"></div>
              </div>
              <div className="timeline-text">
                <div className="timeline-step-icon" aria-hidden="true" style={{ color: 'var(--primary)' }}>
                  <Icon name="shield-check" size={32} />
                </div>
                <div className="timeline-num">{t('steps.03.num')}</div>
                <h3 className="timeline-step-title">{t('steps.03.title')}</h3>
                <p className="timeline-step-body">{t('steps.03.body')}</p>
              </div>
            </div>
            <div className="timeline-dot-wrap">
              <div className="timeline-dot"></div>
            </div>
            <div className="timeline-empty"></div>
          </div>

          {/* Step 4 -Préparation (DROITE : texte vers la ligne, image à l'extérieur) */}
          <div className="timeline-step timeline-step--reversed reveal" style={{ transitionDelay: '0.3s' }}>
            <div className="timeline-empty"></div>
            <div className="timeline-dot-wrap">
              <div className="timeline-dot"></div>
            </div>
            <div className="timeline-panel">
              <div className="timeline-text">
                <div className="timeline-step-icon" aria-hidden="true" style={{ color: 'var(--primary)' }}>
                  <Icon name="fire" size={32} />
                </div>
                <div className="timeline-num">{t('steps.04.num')}</div>
                <h3 className="timeline-step-title">{t('steps.04.title')}</h3>
                <p className="timeline-step-body">{t('steps.04.body')}</p>
              </div>
              <div className="timeline-step-img reveal-clip">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="timeline-step-photo" src="/images/action/conditioning-rope.webp" alt={t('steps.04.img_alt')} />
                <div className="timeline-step-img-inner"></div>
              </div>
            </div>
          </div>

          {/* Step 5 -Immersion (GAUCHE : image à l'extérieur, texte vers la ligne) */}
          <div className="timeline-step reveal" style={{ transitionDelay: '0.4s' }}>
            <div className="timeline-panel">
              <div className="timeline-step-img reveal-clip">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="timeline-step-photo" src="/images/environment/mountain-road.webp" alt={t('steps.05.img_alt')} />
                <div className="timeline-step-img-inner"></div>
              </div>
              <div className="timeline-text">
                <div className="timeline-step-icon" aria-hidden="true" style={{ color: 'var(--cta)' }}>
                  <Icon name="mountain" size={32} />
                </div>
                <div className="timeline-num" style={{ color: 'var(--cta)' }}>{t('steps.05.num')}</div>
                <h3 className="timeline-step-title">{t('steps.05.title')}</h3>
                <p className="timeline-step-body">{t('steps.05.body')}</p>
              </div>
            </div>
            <div className="timeline-dot-wrap">
              <div className="timeline-dot" style={{ background: 'var(--cta)' }}></div>
            </div>
            <div className="timeline-empty"></div>
          </div>

        </div>
      </div>
    </section>
  )
}
