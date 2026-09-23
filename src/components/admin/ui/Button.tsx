// Systeme de boutons unique de l'admin (classes .adm-btn* de admin.css).
// - primary : rust, porte l'icone de son action ; un seul par zone d'action ;
// - secondary : contour, sans icone ;
// - ghost : action tertiaire (effacer les filtres) ;
// - danger : confirmation de suppression seulement ;
// - whatsapp : vert, logo WhatsApp (icone par defaut) ;
// - call : secondaire avec l'icone telephone (icone par defaut).
// Icone seule (iconOnly) : carre de 44 px ; nom accessible obligatoire, par
// aria-label ou par les enfants (rendus alors en texte masque).
// Pas de 'use client' : utilisable dans les composants serveur (sans onClick).

import Link from 'next/link'
import Icon, { type IconName } from './Icon'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'whatsapp' | 'call'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  icon?: IconName
  size?: 'md' | 'sm'
  iconOnly?: boolean
  loading?: boolean
  ref?: React.Ref<HTMLButtonElement>
}

export interface ButtonLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  variant?: ButtonVariant
  icon?: IconName
  size?: 'md' | 'sm'
  iconOnly?: boolean
  external?: boolean
  ref?: React.Ref<HTMLAnchorElement>
}

const DEFAULT_ICON: Partial<Record<ButtonVariant, IconName>> = {
  whatsapp: 'whatsapp',
  call: 'phone',
}

function buttonClass(
  variant: ButtonVariant,
  size: 'md' | 'sm',
  iconOnly: boolean,
  extra: string | undefined,
): string {
  const cls = ['adm-btn', `adm-btn--${variant}`]
  if (size === 'sm') cls.push('adm-btn--sm')
  if (iconOnly) cls.push('adm-btn--icon')
  if (extra) cls.push(extra)
  return cls.join(' ')
}

function warnMissingName(iconOnly: boolean, props: { children?: React.ReactNode; 'aria-label'?: string; 'aria-labelledby'?: string }) {
  if (process.env.NODE_ENV === 'production' || !iconOnly) return
  if (props['aria-label'] || props['aria-labelledby'] || props.children) return
  console.warn('[admin/Button] bouton icone seule sans nom accessible (aria-label ou enfants)')
}

function Content({
  icon,
  iconOnly,
  loading,
  children,
}: {
  icon: IconName | undefined
  iconOnly: boolean
  loading?: boolean
  children: React.ReactNode
}) {
  return (
    <>
      {loading ? (
        <span className="adm-btn-spinner" aria-hidden="true" />
      ) : icon ? (
        <Icon name={icon} size={18} />
      ) : null}
      {iconOnly ? children ? <span className="adm-sr-only">{children}</span> : null : children}
    </>
  )
}

export default function Button({
  variant = 'secondary',
  icon,
  size = 'md',
  iconOnly = false,
  loading = false,
  type = 'button',
  className,
  children,
  onClick,
  ref,
  ...rest
}: ButtonProps) {
  warnMissingName(iconOnly, { children, ...rest })
  const shownIcon = icon ?? DEFAULT_ICON[variant]
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={buttonClass(variant, size, iconOnly, className)}
      // Pendant le chargement le bouton garde le focus (pas de disabled) mais
      // ignore les clics : pas de double envoi.
      aria-busy={loading || rest['aria-busy'] || undefined}
      aria-disabled={loading || rest['aria-disabled'] || undefined}
      onClick={loading ? (e) => e.preventDefault() : onClick}
    >
      <Content icon={shownIcon} iconOnly={iconOnly} loading={loading}>
        {children}
      </Content>
    </button>
  )
}

/** Lien habille en bouton : next/link pour les pages /admin, <a> sinon (tel:, mailto:, wa.me, API). */
export function ButtonLink({
  href,
  variant = 'secondary',
  icon,
  size = 'md',
  iconOnly = false,
  external = false,
  className,
  children,
  ref,
  ...rest
}: ButtonLinkProps) {
  warnMissingName(iconOnly, { children, ...rest })
  const cls = buttonClass(variant, size, iconOnly, className)
  const content = (
    <Content icon={icon ?? DEFAULT_ICON[variant]} iconOnly={iconOnly}>
      {children}
    </Content>
  )
  if (!external && href.startsWith('/admin')) {
    return (
      <Link {...rest} ref={ref} href={href} className={cls}>
        {content}
      </Link>
    )
  }
  return (
    <a
      {...rest}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      ref={ref}
      href={href}
      className={cls}
    >
      {content}
    </a>
  )
}
