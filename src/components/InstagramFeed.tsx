import { getTranslations } from 'next-intl/server'
import Icon from './Icon'
import { SOCIALS } from '@/data/site'
import TrustindexFeed from './TrustindexFeed'

/* Section "Suivez le camp" (homepage, juste avant le footer).
 *
 * En-tete de section aux couleurs MKR (rust + dark) + widget feed Instagram
 * Trustindex (@mkrcamp), charge cote client via <TrustindexFeed />. L'origine
 * cdn.trustindex.io / *.trustindex.io doit etre autorisee dans la CSP
 * (next.config.ts), sinon le widget ne se charge pas.
 *
 * i18n : namespace home.instagram_feed.* (FR + EN). Voir SITEMAP.md.
 */

export default async function InstagramFeed() {
  const t = await getTranslations('home')

  return (
    <section className="ig-feed" aria-labelledby="ig-feed-title">
      <div className="inner">
        <div className="ig-feed-head">
          <div className="ig-feed-intro">
            <span className="label-tag ig-feed-eyebrow" style={{ color: 'var(--primary)' }}>
              {t('instagram_feed.eyebrow')}
            </span>
            <h2 id="ig-feed-title" className="ig-feed-title">{t('instagram_feed.title')}</h2>
            <p className="ig-feed-sub">{t('instagram_feed.subtitle')}</p>
          </div>
          <a
            href={SOCIALS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="ig-feed-cta"
          >
            <Icon name="instagram" size={18} />
            {t('instagram_feed.cta')}
          </a>
        </div>

        <TrustindexFeed />
      </div>
    </section>
  )
}
