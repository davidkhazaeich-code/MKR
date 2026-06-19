'use client'

import { useEffect } from 'react'
import Cal, { getCalApi } from '@calcom/embed-react'
import { useTranslations } from 'next-intl'

// Lien Cal.com de Ruslan (event "15min" = visio de selection). Surchargeable via
// NEXT_PUBLIC_CAL_LINK pour pouvoir changer l'event sans toucher au code.
const CAL_LINK = process.env.NEXT_PUBLIC_CAL_LINK || 'ruslan-mukhtarov-mkr/15min'
const CAL_NAMESPACE = '15min'
// URL publique de repli si l'embed ne charge pas (reseau bloque, adblock...).
const CAL_FALLBACK_URL = `https://cal.com/${CAL_LINK}`

type Props = {
  prenom: string
  nom: string
  email: string
}

/**
 * Calendrier Cal.com inline affiche sur l'ecran de confirmation de candidature.
 * Le candidat reserve sa visio de selection avec Ruslan ; Cal.com envoie alors
 * nativement l'invitation iCal (.ics) au candidat et a Ruslan. Pre-rempli avec
 * le nom + email deja saisis dans le formulaire.
 */
export default function VisioBooking({ prenom, nom, email }: Props) {
  const t = useTranslations('inscription.success.booking')

  useEffect(() => {
    ;(async () => {
      try {
        const cal = await getCalApi({ namespace: CAL_NAMESPACE })
        // Theme sombre force pour matcher l'ecran de succes MKR (fond #0E0E0E) + accent
        // marque (--primary). cssVarsPerTheme exige les 2 cles (dark + light) cote types.
        cal('ui', {
          hideEventTypeDetails: false,
          layout: 'month_view',
          theme: 'dark',
          cssVarsPerTheme: {
            dark: { 'cal-brand': '#C84B31' },
            light: { 'cal-brand': '#C84B31' },
          },
        })
      } catch {
        // L'embed n'a pas pu s'initialiser : on garde le lien de repli visible.
      }
    })()
  }, [])

  const fullName = `${prenom} ${nom}`.trim()

  return (
    <section className="visio-booking" aria-labelledby="visio-booking-title">
      <span className="label-tag visio-booking-step" style={{ color: 'var(--primary)' }}>
        {t('step')}
      </span>
      <h3 id="visio-booking-title" className="visio-booking-title">
        {t('title')}
      </h3>
      <p className="visio-booking-sub">{t('subtitle')}</p>

      <div className="visio-booking-embed">
        <Cal
          namespace={CAL_NAMESPACE}
          calLink={CAL_LINK}
          // height auto : on laisse Cal dimensionner l'iframe selon son contenu (sinon
          // le mois empile sur mobile (~1015px) est coupe par un conteneur a hauteur fixe).
          style={{ width: '100%', height: 'auto' }}
          config={{
            layout: 'month_view',
            // theme dans le config (= param d'URL de l'iframe) sinon il n'est pas applique :
            // le passer uniquement via cal('ui') est trop tardif, l'URL est deja construite.
            theme: 'dark',
            // vue creneaux dediee sur petit ecran : evite l'empilement vertical qui deborde.
            useSlotsViewOnSmallScreen: 'true',
            name: fullName,
            email,
          }}
        />
      </div>

      <p className="visio-booking-fallback">
        {t('fallback_prefix')}{' '}
        <a href={CAL_FALLBACK_URL} target="_blank" rel="noopener noreferrer">
          {t('fallback_link')}
        </a>
      </p>
    </section>
  )
}
