import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import Icon from './Icon'
import { WHATSAPP } from '@/data/site'

export default function Contact() {
  const t = useTranslations('home.contact')
  return (
    <section id="contact" aria-labelledby="contact-heading">
      <div className="contact-glow" aria-hidden="true" />
      <div className="inner">
        <div className="contact-layout">

          <div className="contact-left reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              {t('label')}
            </span>
            <h2 id="contact-heading" className="cand-title">
              {t('title_line1')}<br />{t('title_line2')}<br />{t('title_line3')}
            </h2>
            <p className="cand-subtitle">
              {t('subtitle')}
            </p>
            <Link href="/inscription" className="contact-cta-btn">
              {t('cta')}
            </Link>
          </div>

          <div className="contact-right reveal" style={{ transitionDelay: '0.1s' }}>
            <div className="contact-info-card">
              <h3 className="contact-info-title">{t('info_title')}</h3>

              <div className="contact-info-row">
                <Icon name="mail" />
                <div>
                  <span className="contact-info-label">{t('info_form_label')}</span>
                  <Link href="/contact" className="contact-info-value">
                    {t('info_form_value')}
                  </Link>
                </div>
              </div>

              <div className="contact-info-row">
                <Icon name="whatsapp" />
                <div>
                  <span className="contact-info-label">{t('info_whatsapp_label')}</span>
                  <a href={WHATSAPP.url} target="_blank" rel="noopener noreferrer" className="contact-info-value">
                    {t('info_whatsapp_value')}
                  </a>
                </div>
              </div>

              <div className="contact-info-row">
                <Icon name="instagram" />
                <div>
                  <span className="contact-info-label">{t('info_instagram_label')}</span>
                  <a href="https://instagram.com/mkrcamp" target="_blank" rel="noopener noreferrer" className="contact-info-value">
                    @mkrcamp
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Processus de candidature */}
        <div className="contact-process reveal" style={{ transitionDelay: '0.15s' }}>
          <h3 className="contact-process-title">{t('process_title')}</h3>
          <div className="contact-process-steps">
            <div className="contact-step">
              <span className="contact-step-num">{t('process_steps.01.num')}</span>
              <h4 className="contact-step-label">{t('process_steps.01.title')}</h4>
              <p className="contact-step-desc">{t('process_steps.01.desc')}</p>
            </div>
            <div className="contact-step">
              <span className="contact-step-num">{t('process_steps.02.num')}</span>
              <h4 className="contact-step-label">{t('process_steps.02.title')}</h4>
              <p className="contact-step-desc">{t('process_steps.02.desc')}</p>
            </div>
            <div className="contact-step">
              <span className="contact-step-num">{t('process_steps.03.num')}</span>
              <h4 className="contact-step-label">{t('process_steps.03.title')}</h4>
              <p className="contact-step-desc">{t('process_steps.03.desc')}</p>
            </div>
            <div className="contact-step">
              <span className="contact-step-num">{t('process_steps.04.num')}</span>
              <h4 className="contact-step-label">{t('process_steps.04.title')}</h4>
              <p className="contact-step-desc">{t('process_steps.04.desc')}</p>
            </div>
          </div>
        </div>

        {/* Badges de reassurance */}
        <div className="contact-badges reveal" style={{ transitionDelay: '0.2s' }}>
          <div className="contact-badge">
            <Icon name="star" />
            <span>{t('badges.selection')}</span>
          </div>
          <div className="contact-badge">
            <Icon name="check-circle" />
            <span>{t('badges.capacity')}</span>
          </div>
          <div className="contact-badge">
            <Icon name="calendar" />
            <span>{t('badges.response')}</span>
          </div>
          <div className="contact-badge">
            <Icon name="shield" />
            <span>{t('badges.transfers')}</span>
          </div>
        </div>

      </div>
    </section>
  )
}
