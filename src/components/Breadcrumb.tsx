import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'

// Meme correctif que SectionCTA (2026-07-06) : le Link i18n localise le
// pathname (/programme -> /en/program). Avec le next/link brut, le fil
// d'Ariane des pages anglaises renvoyait vers les URL francaises, sur la
// douzaine de pages qui affichent un breadcrumb.
type LocalizedHref = Parameters<typeof Link>[0]['href']

interface BreadcrumbProps {
  items: { href: string; label: string }[]
}

export default async function Breadcrumb({ items }: BreadcrumbProps) {
  const t = await getTranslations('common.breadcrumb')
  return (
    <nav className="breadcrumb" aria-label={t('aria')}>
      <Link href="/">{t('home')}</Link>
      {items.map((item, i) => (
        <span key={i}>
          <span aria-hidden="true">/</span>
          {i === items.length - 1 ? (
            <span aria-current="page">{item.label}</span>
          ) : (
            <Link href={item.href as LocalizedHref}>{item.label}</Link>
          )}
        </span>
      ))}
    </nav>
  )
}
