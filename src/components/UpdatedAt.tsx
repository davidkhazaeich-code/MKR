import { getLocale, getTranslations } from 'next-intl/server'

interface UpdatedAtProps {
  /** Date ISO (YYYY-MM-DD) de derniere mise a jour editoriale de la page. */
  date: string
  className?: string
}

/**
 * Datestamp visible (signal de fraicheur SEO/GEO releve manquant par
 * l'audit 2026-05-14). Mettre a jour la prop `date` a chaque revision
 * editoriale substantielle de la page.
 */
export default async function UpdatedAt({ date, className }: UpdatedAtProps) {
  const t = await getTranslations('common')
  const locale = await getLocale()
  const formatted = new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00Z`))

  return (
    <p className={`updated-at${className ? ` ${className}` : ''}`}>
      <time dateTime={date}>{t('lp.updated_at', { date: formatted })}</time>
    </p>
  )
}
