import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { localizedMetadata } from '@/lib/i18n-helpers'
import type { Locale } from '@/i18n/routing'
import { FAMILY_PRICING, formatEUR } from '@/data/pricing'
import {
  DUO_ONE_LINE_BARE,
  TRIO_ONE_LINE_BARE,
  CLUB_ONE_LINE_BARE,
  FAMILY_BASE_PROSE,
  FAMILY_EXTRA_CHILD_FULL,
} from '@/lib/pricing-copy'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'cgv' })
  return localizedMetadata('/cgv', locale as Locale, t('meta.title'), t('meta.description'))
}

export default async function CGVPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('cgv')
  const article4Items = t.raw('articles.article4.items') as string[]
  const article10Items = t.raw('articles.article10.items') as string[]

  return (
    <section className="legal-page">
      <div className="inner">
        <h1 className="legal-title">{t('title')}</h1>
        <div className="legal-content">
          <h2>{t('articles.article1.title')}</h2>
          <p>{t('articles.article1.body')}</p>

          <h2>{t('articles.article2.title')}</h2>
          <p>{t('articles.article2.body')}</p>

          <h2>{t('articles.article3.title')}</h2>
          <p>{t('articles.article3.intro')}</p>
          <ul>
            <li>
              <strong>{t('articles.article3.items.duo.strong')}</strong>{t('articles.article3.items.duo.middle')}{DUO_ONE_LINE_BARE}{t('articles.article3.items.duo.suffix')}
            </li>
            <li>
              <strong>{t('articles.article3.items.trio.strong')}</strong>{t('articles.article3.items.trio.middle')}{TRIO_ONE_LINE_BARE}{t('articles.article3.items.trio.suffix')}
            </li>
            <li>
              <strong>{t('articles.article3.items.club.strong')}</strong>{t('articles.article3.items.club.middle')}{CLUB_ONE_LINE_BARE}{t('articles.article3.items.club.suffix')}
            </li>
            <li>
              <strong>{t('articles.article3.items.salle.strong')}</strong>{t('articles.article3.items.salle.middle')}
            </li>
            <li>
              <strong>{t('articles.article3.items.famille.strong')}</strong>{t('articles.article3.items.famille.middle')}{FAMILY_BASE_PROSE}{t('articles.article3.items.famille.after_base')}{FAMILY_EXTRA_CHILD_FULL}{t('articles.article3.items.famille.suffix')}
            </li>
            <li>
              <strong>{t('articles.article3.items.famille_2_parents.strong')}</strong>{t('articles.article3.items.famille_2_parents.middle')}{formatEUR(FAMILY_PRICING.additionalPerson)}{t('articles.article3.items.famille_2_parents.suffix')}
            </li>
          </ul>
          <p>{t('articles.article3.payment_p1')}</p>
          <p>{t('articles.article3.payment_p2')}</p>

          <h2>{t('articles.article4.title')}</h2>
          <ul>
            {article4Items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <p>{t('articles.article4.outro')}</p>

          <h2>{t('articles.article5.title')}</h2>
          <p>{t('articles.article5.intro')}</p>
          <ul>
            <li>
              <strong>{t('articles.article5.items.visa.strong')}</strong>{t('articles.article5.items.visa.body')}
            </li>
            <li>
              <strong>{t('articles.article5.items.flight.strong')}</strong>{t('articles.article5.items.flight.body')}
            </li>
            <li>{t('articles.article5.items.transfers')}</li>
            <li>{t('articles.article5.items.accommodation')}</li>
            <li>{t('articles.article5.items.meals')}</li>
            <li>{t('articles.article5.items.sessions')}</li>
            <li>{t('articles.article5.items.excursions')}</li>
            <li>{t('articles.article5.items.prep')}</li>
          </ul>

          <h2>{t('articles.article6.title')}</h2>
          <ul>
            <li>
              <strong>{t('articles.article6.items.intl_flight.strong')}</strong>{t('articles.article6.items.intl_flight.body')}
            </li>
            <li>{t('articles.article6.items.insurance')}</li>
            <li>{t('articles.article6.items.gear')}</li>
            <li>{t('articles.article6.items.personal')}</li>
            <li>{t('articles.article6.items.passport')}</li>
          </ul>

          <h2>{t('articles.article6bis.title')}</h2>
          <p>{t('articles.article6bis.p1')}</p>
          <p>{t('articles.article6bis.p2')}</p>
          <p>{t('articles.article6bis.p3')}</p>

          <h2>{t('articles.article7.title')}</h2>
          <p>{t('articles.article7.body')}</p>

          <h2>{t('articles.article8.title')}</h2>
          <p>{t('articles.article8.body')}</p>

          <h2>{t('articles.article9.title')}</h2>
          <p>{t('articles.article9.body')}</p>

          <h2>{t('articles.article10.title')}</h2>
          <p>
            {t('articles.article10.p1_prefix')}<strong>{t('articles.article10.p1_strong')}</strong>{t('articles.article10.p1_suffix')}
          </p>
          <p>{t('articles.article10.p2')}</p>
          <ul>
            {article10Items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <p>{t('articles.article10.p3')}</p>

          <h2>{t('articles.article11.title')}</h2>
          <p>{t('articles.article11.p1')}</p>
          <p>
            {t('articles.article11.p2_prefix')}<Link href="/contact">{t('articles.article11.p2_link')}</Link>{t('articles.article11.p2_suffix')}
          </p>
          <p>
            {t('articles.article11.p3_prefix')}<Link href="/contact">{t('articles.article11.p3_contact_link')}</Link>{t('articles.article11.p3_middle')}<a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">{t('articles.article11.p3_odr_link')}</a>{t('articles.article11.p3_suffix')}
          </p>
          <p>{t('articles.article11.p4')}</p>

          <p style={{ marginTop: '2rem', fontStyle: 'italic' }}>{t('updated')}</p>
        </div>
      </div>
    </section>
  )
}
