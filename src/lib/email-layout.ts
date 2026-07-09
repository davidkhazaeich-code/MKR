import { escapeHtml } from '@/lib/email'

// Layout partagé des emails candidat/lead MKR — source unique du shell HTML.
// Conventions (CLAUDE.md « Conventions emails ») : design sombre de marque FIXE
// (dark + light verrouillés), responsive 560px, photos JPEG absolues, jamais de
// tiret cadratin, FR accentué. Consommé par guide-email, payment-email,
// predeparture-email. buildVisioEmail reste sur son template historique.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://mkrcamp.com').replace(/\/$/, '')

export const EMAIL_COLORS = {
  bodyBg: '#000000',
  cardBg: '#111110',
  panelBg: '#1a1a18',
  border: '#2e2e2e',
  text: '#ffffff',
  muted: '#9a9a95',
  faint: '#6f6f6a',
  orange: '#C84B31',
} as const

const C = EMAIL_COLORS
const FONT = 'Arial,Helvetica,sans-serif'

export type EmailLocale = 'fr' | 'en'

export function renderHeroImage(fileName: string, alt: string, href?: string): string {
  const img = `<img src="${SITE_URL}/images/email/${fileName}" width="558" alt="${escapeHtml(alt)}" style="display:block;width:100%;height:auto">`
  return `<tr><td>${href ? `<a href="${href}" style="text-decoration:none">${img}</a>` : img}</td></tr>`
}

export function renderParagraph(html: string, opts?: { main?: boolean; padTop?: boolean }): string {
  const color = opts?.main ? C.text : C.muted
  const cls = opts?.main ? 't-main' : 't-muted mob-text'
  const size = opts?.main ? 16 : 14
  return `<tr><td class="mob-pad" style="padding:${opts?.padTop ? 26 : 0}px 32px 18px">
    <p class="${cls}" style="margin:0;color:${color};font-family:${FONT};font-size:${size}px;line-height:1.75">${html}</p>
  </td></tr>`
}

export function renderSectionTitle(label: string): string {
  return `<tr><td class="mob-pad" style="padding:4px 32px 12px">
    <p class="t-main" style="margin:0;color:${C.text};font-family:${FONT};font-size:14px;font-weight:700;letter-spacing:0.3px;text-transform:uppercase">${escapeHtml(label)}</p>
  </td></tr>`
}

export function renderButton(href: string, label: string, opts?: { primary?: boolean }): string {
  const primary = opts?.primary !== false
  const style = primary
    ? `background-color:${C.orange};color:#ffffff;font-weight:700;padding:14px 28px`
    : `color:#ffffff;font-weight:600;border:1px solid ${C.orange};padding:12px 24px`
  return `<tr><td class="mob-pad mob-btn" style="padding:0 32px 28px">
    <a href="${href}" style="display:inline-block;${style};font-family:${FONT};font-size:15px;text-decoration:none;border-radius:8px">${escapeHtml(label)}</a>
  </td></tr>`
}

/** Liste à puces point médian orange (même motif que le guide). */
export function renderBullets(items: string[]): string {
  const rows = items
    .map(
      (t) => `
      <tr>
        <td valign="top" style="width:18px;padding:0 0 12px;color:${C.orange};font-family:${FONT};font-size:15px;font-weight:700;line-height:1.6">&middot;</td>
        <td style="padding:0 0 12px;color:${C.muted};font-family:${FONT};font-size:14px;line-height:1.7" class="mob-text">${escapeHtml(t)}</td>
      </tr>`,
    )
    .join('')
  return `<tr><td class="mob-pad" style="padding:0 32px 14px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
  </td></tr>`
}

/** Panneau récapitulatif (lignes label/valeur), ex. montant + échéance d'un paiement. */
export function renderInfoPanel(rows: { label: string; value: string; highlight?: boolean }[]): string {
  const inner = rows
    .map(
      (r) => `
      <tr>
        <td style="padding:10px 16px;color:${C.faint};font-family:${FONT};font-size:13px;border-bottom:1px solid ${C.border}">${escapeHtml(r.label)}</td>
        <td align="right" style="padding:10px 16px;color:${r.highlight ? C.orange : C.text};font-family:${FONT};font-size:${r.highlight ? 16 : 14}px;font-weight:700;border-bottom:1px solid ${C.border}">${escapeHtml(r.value)}</td>
      </tr>`,
    )
    .join('')
  return `<tr><td class="mob-pad" style="padding:0 32px 26px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.panelBg};border:1px solid ${C.border};border-radius:10px" bgcolor="${C.panelBg}">${inner}</table>
  </td></tr>`
}

export function renderSignature(locale: EmailLocale, signoff?: string): string {
  const so = signoff ?? (locale === 'en' ? 'See you soon,' : 'À bientôt,')
  const role = locale === 'en' ? 'Founder · MKR Caucasian Camp' : 'Fondateur · MKR Caucasian Camp'
  return `<tr><td class="mob-pad" style="padding:0 32px 30px">
    <table role="presentation" cellpadding="0" cellspacing="0" style="border-top:1px solid ${C.border};width:100%">
      <tr>
        <td style="padding:22px 14px 0 0;width:56px">
          <img src="${SITE_URL}/images/ruslan/ruslan-portrait-chemise-noire.jpg" width="56" height="56" alt="Ruslan Mukhtarov" style="display:block;width:56px;height:56px;border-radius:50%;border:2px solid ${C.orange}">
        </td>
        <td style="padding:22px 0 0">
          <p class="t-faint" style="margin:0 0 2px;color:${C.faint};font-family:${FONT};font-size:13px">${escapeHtml(so)}</p>
          <p class="t-main" style="margin:0;color:${C.text};font-family:${FONT};font-size:14px;font-weight:700">Ruslan Mukhtarov</p>
          <p class="t-muted" style="margin:2px 0 0;color:${C.muted};font-family:${FONT};font-size:12px">${escapeHtml(role)}</p>
        </td>
      </tr>
    </table>
  </td></tr>`
}

export interface EmailShellInput {
  locale: EmailLocale
  title: string
  preheader: string
  /** Lignes <tr> du contenu de la carte (utiliser les helpers render*). */
  contentRows: string
  footer: string
}

export function renderEmailShell(input: EmailShellInput): string {
  return `<!DOCTYPE html>
<html lang="${input.locale}" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark light">
  <meta name="supported-color-schemes" content="dark light">
  <title>${escapeHtml(input.title)}</title>
  <style>
    :root { color-scheme: dark light; supported-color-schemes: dark light; }
    body { margin: 0; padding: 0; }
    img { border: 0; outline: none; text-decoration: none; }
    @media (prefers-color-scheme: dark) {
      .bg-body { background-color: ${C.bodyBg} !important; }
      .bg-card { background-color: ${C.cardBg} !important; }
      .t-main { color: ${C.text} !important; }
      .t-muted { color: ${C.muted} !important; }
      .t-faint { color: ${C.faint} !important; }
    }
    @media (prefers-color-scheme: light) {
      .bg-body { background-color: ${C.bodyBg} !important; }
      .bg-card { background-color: ${C.cardBg} !important; }
      .t-main { color: ${C.text} !important; }
      .t-muted { color: ${C.muted} !important; }
      .t-faint { color: ${C.faint} !important; }
    }
    @media only screen and (max-width: 480px) {
      .container { width: 100% !important; }
      .mob-pad { padding-left: 20px !important; padding-right: 20px !important; }
      .mob-text { font-size: 15px !important; }
      .mob-btn a { display: block !important; text-align: center !important; }
    }
  </style>
</head>
<body class="bg-body" style="margin:0;padding:0;background-color:${C.bodyBg}" bgcolor="${C.bodyBg}">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${escapeHtml(input.preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg-body" style="background-color:${C.bodyBg}" bgcolor="${C.bodyBg}">
    <tr><td align="center" style="padding:28px 12px">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" class="container" style="max-width:560px;width:100%">
        <tr><td style="padding:0 4px 22px">
          <img src="${SITE_URL}/logo-dark.png" width="140" alt="MKR Caucasian Camp" style="display:block;width:140px;height:auto">
        </td></tr>
        <tr><td class="bg-card" style="background-color:${C.cardBg};border:1px solid ${C.border};border-radius:12px;overflow:hidden" bgcolor="${C.cardBg}">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${input.contentRows}
          </table>
        </td></tr>
        <tr><td style="padding:18px 8px 0">
          <p class="t-faint" style="margin:0;color:${C.faint};font-family:${FONT};font-size:12px;line-height:1.6">${escapeHtml(input.footer)}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// --- Helpers de formatage ----------------------------------------------------

export function formatEuros(cents: number | null, locale: EmailLocale): string {
  if (cents == null) return locale === 'en' ? 'see your agreement' : 'voir ton contrat'
  const euros = Math.round(cents / 100)
  return locale === 'en'
    ? `€${euros.toLocaleString('en-GB')}`
    : `${euros.toLocaleString('fr-CH')} €`
}

/** dateIso YYYY-MM-DD -> affichage local (15.07.2026 / 15 July 2026). */
export function formatDateLocale(dateIso: string, locale: EmailLocale): string {
  const [y, m, d] = dateIso.split('-').map(Number)
  if (!y || !m || !d) return dateIso
  if (locale === 'fr') return `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${y}`
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return `${d} ${months[m - 1]} ${y}`
}
