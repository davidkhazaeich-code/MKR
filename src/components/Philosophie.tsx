import { useTranslations } from 'next-intl'

export default function Philosophie() {
  const t = useTranslations('home.philosophie')
  return (
    <section id="philosophie" aria-labelledby="philosophie-heading">
      <div className="inner">
        <div className="bento-header reveal">
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
            {t('label')}
          </span>
          <h2 id="philosophie-heading" className="bento-title">
            {t('title_line1')}<br />{t('title_line2')}
          </h2>
          <div className="bento-title-line"></div>
        </div>

        <div className="bento-grid">
          {/* Card 1 -large */}
          <article className="bento-card bento-card--large reveal">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bento-img" src="/images/action/sparring-mma-wall.webp" alt="" aria-hidden="true" />
            <span className="bento-card-label">{t('card1.label')}</span>
            <h3 className="bento-card-title">{t('card1.title_line1')}<br />{t('card1.title_line2')}</h3>
            <p className="bento-card-body">
              {t('card1.body_part1_before_strong')}<strong>{t('card1.body_part1_strong')}</strong>{t('card1.body_part1_after_strong')}<strong>{t('card1.body_part1_strong2')}</strong>{t('card1.body_part1_after_strong2')}<br /><br />
              {t('card1.body_part2_before_strong')}<strong>{t('card1.body_part2_strong')}</strong>{t('card1.body_part2_after_strong')}<br /><br />
              {t('card1.body_part3_before_strong')}<strong>{t('card1.body_part3_strong')}</strong>
            </p>
          </article>

          {/* Card 2 -small top right */}
          <article className="bento-card bento-card--small reveal" style={{ transitionDelay: '0.1s' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bento-img" src="/images/environment/gym-interior.webp" alt="" aria-hidden="true" />
            <span className="bento-card-label">{t('card2.label')}</span>
            <h3 className="bento-card-title">{t('card2.title_line1')}<br />{t('card2.title_line2')}</h3>
            <p className="bento-card-body">
              {t('card2.body_before_strong')}<strong>{t('card2.body_strong')}</strong>{t('card2.body_after_strong')}
            </p>
          </article>

          {/* Card 3 -small bottom right */}
          <article className="bento-card bento-card--small reveal" style={{ transitionDelay: '0.2s' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bento-img" src="/images/action/shadowboxing-group.webp" alt="" aria-hidden="true" />
            <span className="bento-card-label">{t('card3.label')}</span>
            <h3 className="bento-card-title">{t('card3.title_line1')}<br />{t('card3.title_line2')}</h3>
            <p className="bento-card-body">
              {t('card3.body_before_strong')}<strong>{t('card3.body_strong')}</strong>{t('card3.body_after_strong')}
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
