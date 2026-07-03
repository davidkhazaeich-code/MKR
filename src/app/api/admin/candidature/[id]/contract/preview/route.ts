import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { buildContractPdf } from '@/lib/contract-pdf'
import { getFieldBlockers, loadContractRow, toPdfData } from '@/lib/contract-service'

// GET /api/admin/candidature/[id]/contract/preview
// Rend le contrat PDF inline (nouvel onglet) avec filigrane « APERÇU ».
// Ne stocke rien, n'incrémente rien : la copie légale est celle de /send.
// Protégé par le proxy (cookie httpOnly mkr_admin), comme tout /api/admin/*.

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  if (!id || id.length < 32) {
    return NextResponse.json({ ok: false, error: 'id candidature invalide' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const row = await loadContractRow(supabase, id)
  if (!row) {
    return NextResponse.json({ ok: false, error: 'Candidature introuvable' }, { status: 404 })
  }

  const blockers = getFieldBlockers(row)
  if (blockers.length > 0) {
    return NextResponse.json(
      { ok: false, error: `Aperçu impossible : ${blockers.join(' ')}` },
      { status: 400 },
    )
  }

  try {
    const issuedDate = new Date().toISOString().slice(0, 10)
    const data = toPdfData(row, issuedDate)
    const pdf = await buildContractPdf(data, { preview: true })
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${data.contractNumber}-apercu.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[contract/preview] génération PDF échouée', err)
    return NextResponse.json(
      { ok: false, error: 'Génération du PDF échouée — voir logs serveur.' },
      { status: 500 },
    )
  }
}
