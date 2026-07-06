import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { pricePerAdult, formatEUR } from '@/data/pricing'
import { getNextSession } from '@/data/sessions'
import PlacesRestantes from './PlacesRestantes'

interface PriceAnchorProps {
  /** Filtre l'affichage des places live sur une discipline. Omis = les 2 (dual). */
  discipline?: 'lutte' | 'mma'
  /** Cible du CTA (pathname FR + query, localise par le Link i18n). */
  href: string
}

/**
 * Bandeau prix transparent des pages destination : prix d'appel derive de
 * data/pricing.ts (jamais de chiffre en dur), prochaine session dynamique,
 * places restantes live. La transparence prix est un des gaps concurrentiels
 * identifies (la plupart des camps concurrents cachent leurs tarifs).
 */
export default async function PriceAnchor({ discipline, href }: PriceAnchorProps) {
  const t = await getTranslations('common')
  const locale = await getLocale()
  const next = getNextSession()
  const solo = formatEUR(pricePerAdult(1, 1))
  const min = formatEUR(pricePerAdult(6, 1))
  const intl = locale === 'fr' ? 'fr-FR' : 'en-GB'
  const startFmt = new Intl.DateTimeFormat(intl, { day: 'numeric', month: 'long' })
  const endFmt = new Intl.DateTimeFormat(intl, { day: 'numeric', month: 'long', year: 'numeric' })
  const sessionDates = `${startFmt.format(new Date(`${next.startDate}T12:00:00Z`))} - ${endFmt.format(new Date(`${next.endDate}T12:00:00Z`))}`

  return (
    <section className="panchor fx-glow" aria-label={t('lp.price_anchor.kicker')}>
      <div className="fx-glow-orb fx-glow-orb--right" />
      <div className="inner">
        <div className="panchor-card fx-grain reveal">
          <div className="panchor-main">
            <span className="label-tag panchor-kicker">{t('lp.price_anchor.kicker')}</span>
            <p className="panchor-price">{t('lp.price_anchor.main', { solo })}</p>
            <p className="panchor-included">{t('lp.price_anchor.main_sub')}</p>
            <p className="panchor-degressive">{t('lp.price_anchor.degressive', { min })}</p>
          </div>
          <div className="panchor-side">
            <p className="panchor-session">
              <span className="panchor-session-label">{t('lp.price_anchor.next_session')}</span>
              <span className="panchor-session-dates">{sessionDates}</span>
            </p>
            <PlacesRestantes
              sessionId={next.id}
              discipline={discipline}
              variant={discipline ? 'inline' : 'dual'}
              fallbackMax={15}
              className="panchor-places"
            />
            <Link href={href as Parameters<typeof Link>[0]['href']} className="btn-primary panchor-cta">
              {t('lp.price_anchor.cta')}
            </Link>
            <p className="panchor-cta-sub">{t('lp.price_anchor.cta_sub')}</p>
            <a
              href="https://wa.me/33666177691"
              target="_blank"
              rel="noopener noreferrer"
              className="panchor-whatsapp"
            >
              {t('lp.price_anchor.whatsapp')}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
