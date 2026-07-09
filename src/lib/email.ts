import { Resend } from 'resend'

// Email helper Resend. Fire-and-forget : si RESEND_API_KEY absente,
// on no-op silencieusement (comme SLACK_WEBHOOK_URL). Ne JAMAIS bloquer
// le user — l'envoi mail est best-effort, la source de verite reste Supabase.

// From envoye depuis contact@mkrcamp.com via le compte Resend PROPRE a MKR
// (domaine mkrcamp.com verifie le 2026-07-09 : DKIM resend._domainkey + MX/SPF
// sur send.mkrcamp.com poses chez Infomaniak, DMARC p=reject passe via DKIM
// aligne). La mailbox contact@mkrcamp.com (Google Workspace) recoit les reponses.
// NB : ne PAS reutiliser la cle Resend DKDP ici — compte separe, domaine separe.
const FROM_DEFAULT = process.env.MKR_EMAIL_FROM || 'MKR Caucasian Camp <contact@mkrcamp.com>'
const TO_DEFAULT = process.env.MKR_EMAIL_TO || 'contact@mkrcamp.com'

let cached: Resend | null = null
function getClient(): Resend | null {
  if (cached) return cached
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  cached = new Resend(key)
  return cached
}

export interface SendMailAttachment {
  filename: string
  /** Contenu binaire. Encodé en base64 avant envoi (compat SDK Resend). */
  content: Buffer
}

export interface SendMailParams {
  subject: string
  html: string
  text?: string
  to?: string
  /** Copie cachée (ex : copie exacte du contrat à contact@mkrcamp.com). */
  bcc?: string
  replyTo?: string
  /** Pièces jointes (ex : contrat PDF). */
  attachments?: SendMailAttachment[]
  // Tag Resend pour filtrage analytics dashboard.
  tag?: 'contact' | 'inscription' | 'inscription-candidate' | 'guide-caucase' | 'guide-lead' | 'contract' | 'visio-reminder' | 'visio-reminder-auto' | 'payment-reminder' | 'predeparture' | 'digest-interne'
}

// Envoie un email via Resend. Retourne true si OK, false si KO ou no-op.
// Ne throw jamais — caller utilise toujours .catch() en defense en profondeur.
export async function sendMail(params: SendMailParams): Promise<boolean> {
  const client = getClient()
  if (!client) {
    // Pas de clef configuree : on log et on no-op.
    console.warn('[lib/email] RESEND_API_KEY missing — email not sent')
    return false
  }

  try {
    const { error } = await client.emails.send({
      from: FROM_DEFAULT,
      to: params.to || TO_DEFAULT,
      bcc: params.bcc,
      replyTo: params.replyTo,
      subject: params.subject,
      html: params.html,
      text: params.text,
      tags: params.tag ? [{ name: 'kind', value: params.tag }] : undefined,
      // base64 string plutôt que Buffer : stable à travers les versions du SDK.
      attachments: params.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content.toString('base64'),
      })),
    })
    if (error) {
      console.error('[lib/email] resend send failed', error)
      return false
    }
    return true
  } catch (err) {
    console.error('[lib/email] resend threw', err)
    return false
  }
}

// Helpers HTML : pas de framework, juste du markup minimal lisible en preview Gmail.
// Echappe ce qui vient de l'utilisateur pour eviter HTML injection dans le mail.
export function escapeHtml(s: string | null | undefined): string {
  if (!s) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function row(label: string, value: string | null | undefined): string {
  if (!value) return ''
  return `<tr><td style="padding:6px 12px;color:#94a3b8;font-size:13px;border-bottom:1px solid #1e293b">${escapeHtml(label)}</td><td style="padding:6px 12px;color:#e2e8f0;font-size:14px;border-bottom:1px solid #1e293b">${escapeHtml(value)}</td></tr>`
}

export function wrapEmail(title: string, bodyHtml: string, footerNote?: string): string {
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:24px;background:#0b1220;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<div style="max-width:640px;margin:0 auto;background:#0f172a;border:1px solid #1e293b;border-radius:8px;overflow:hidden">
<div style="padding:20px 24px;background:#020617;border-bottom:1px solid #1e293b">
<div style="color:#C0392B;font-weight:700;font-size:13px;letter-spacing:0.1em">MKR CAUCASIAN CAMP</div>
<h1 style="margin:6px 0 0;color:#f1f5f9;font-size:20px;font-weight:600">${escapeHtml(title)}</h1>
</div>
<div style="padding:24px">${bodyHtml}</div>
${footerNote ? `<div style="padding:16px 24px;background:#020617;border-top:1px solid #1e293b;color:#64748b;font-size:12px">${escapeHtml(footerNote)}</div>` : ''}
</div>
</body></html>`
}
