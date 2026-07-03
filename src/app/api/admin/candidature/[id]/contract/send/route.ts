import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { buildContractPdf } from '@/lib/contract-pdf'
import {
  buildContractEmail,
  getFieldBlockers,
  getSendBlockers,
  loadContractRow,
  toPdfData,
} from '@/lib/contract-service'
import { sendMail } from '@/lib/email'

// POST /api/admin/candidature/[id]/contract/send
//
// Séquence : garde-fous → génère le PDF (sans filigrane) → archive la copie
// exacte dans le bucket privé `contracts` → email au candidat (PDF en pièce
// jointe, bcc contact@mkrcamp.com) → update candidature (sent_at, count++,
// pdf_path) + audit_log `contract_sent`.
//
// Si l'email échoue : AUCUNE mise à jour d'état (le fichier -vN uploadé reste
// orphelin, il sera écrasé au retry — upsert). Le bouton peut être re-cliqué.

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const CONTRACT_COPY_TO = process.env.MKR_EMAIL_TO || 'contact@mkrcamp.com'

export async function POST(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  if (!id || id.length < 32) {
    return NextResponse.json({ ok: false, error: 'id candidature invalide' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const row = await loadContractRow(supabase, id)
  if (!row) {
    return NextResponse.json({ ok: false, error: 'Candidature introuvable' }, { status: 404 })
  }

  const blockers = [...getFieldBlockers(row), ...getSendBlockers(row)]
  if (blockers.length > 0) {
    return NextResponse.json(
      { ok: false, error: `Envoi bloqué : ${blockers.join(' ')}` },
      { status: 400 },
    )
  }

  const issuedDate = new Date().toISOString().slice(0, 10)
  const data = toPdfData(row, issuedDate)

  // 1. Génération du PDF contractuel (sans filigrane)
  let pdf: Buffer
  try {
    pdf = await buildContractPdf(data, { preview: false })
  } catch (err) {
    console.error('[contract/send] génération PDF échouée', err)
    return NextResponse.json(
      { ok: false, error: 'Génération du PDF échouée — voir logs serveur.' },
      { status: 500 },
    )
  }

  // 2. Archive de la copie exacte AVANT envoi (bucket privé, versionnée)
  const nextCount = row.contract_sent_count + 1
  const pdfPath = `${row.id}/${data.contractNumber}-v${nextCount}.pdf`
  const { error: uploadError } = await supabase.storage
    .from('contracts')
    .upload(pdfPath, pdf, { contentType: 'application/pdf', upsert: true })
  if (uploadError) {
    console.error('[contract/send] upload Storage échoué', uploadError)
    return NextResponse.json(
      { ok: false, error: 'Archivage du PDF échoué (Storage) — envoi annulé.' },
      { status: 500 },
    )
  }

  // 3. Email au candidat, copie exacte en bcc
  const candidateEmail = row.candidate!.email
  const prenom = row.candidate!.prenom || (data.locale === 'fr' ? 'champion' : 'champ')
  const { subject, html, text } = buildContractEmail(data, prenom)
  const attachmentName =
    data.locale === 'fr' ? `${data.contractNumber}-contrat.pdf` : `${data.contractNumber}-agreement.pdf`

  const sent = await sendMail({
    subject,
    html,
    text,
    to: candidateEmail,
    bcc: CONTRACT_COPY_TO,
    replyTo: CONTRACT_COPY_TO,
    tag: 'contract',
    attachments: [{ filename: attachmentName, content: pdf }],
  })
  if (!sent) {
    return NextResponse.json(
      { ok: false, error: 'Envoi email échoué (Resend). Vérifie RESEND_API_KEY puis réessaye.' },
      { status: 502 },
    )
  }

  // 4. État + audit (après envoi réussi uniquement)
  const nowIso = new Date().toISOString()
  const { data: updated, error: updateError } = await supabase
    .from('candidatures')
    .update({
      contract_sent_at: nowIso,
      contract_sent_count: nextCount,
      contract_pdf_path: pdfPath,
    })
    .eq('id', id)
    .select('contract_sent_at, contract_sent_count, contract_pdf_path, contract_number')
    .single()

  if (updateError || !updated) {
    // L'email est parti : on log fort mais on ne présente pas ça comme un échec d'envoi.
    console.error('[contract/send] update candidature échoué APRÈS envoi email', updateError)
  }

  const { error: auditError } = await supabase.from('audit_log').insert({
    candidature_id: id,
    event: 'contract_sent',
    to_value: { contract_sent_at: nowIso, contract_sent_count: nextCount },
    data: {
      contract_number: data.contractNumber,
      to: candidateEmail,
      copy_bcc: CONTRACT_COPY_TO,
      locale: data.locale,
      amount_cents: data.amountCents,
      pdf_path: pdfPath,
    },
    actor_email: 'admin',
  })
  if (auditError) {
    console.error('[contract/send] audit insert échoué', auditError)
  }

  return NextResponse.json({
    ok: true,
    candidatureId: id,
    contract: updated ?? {
      contract_sent_at: nowIso,
      contract_sent_count: nextCount,
      contract_pdf_path: pdfPath,
      contract_number: row.contract_number,
    },
  })
}
