import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

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
            <Link href={item.href}>{item.label}</Link>
          )}
        </span>
      ))}
    </nav>
  )
}
