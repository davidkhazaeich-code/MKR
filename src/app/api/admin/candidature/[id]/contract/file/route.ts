import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// GET /api/admin/candidature/[id]/contract/file
// Redirige vers une URL signée (60 s) de la DERNIÈRE copie envoyée du contrat
// (bucket privé `contracts`). Sert de preuve : c'est le PDF exact reçu par le
// candidat, pas une re-génération.

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  if (!id || id.length < 32) {
    return NextResponse.json({ ok: false, error: 'id candidature invalide' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { data: row, error } = await supabase
    .from('candidatures')
    .select('contract_pdf_path')
    .eq('id', id)
    .maybeSingle()

  if (error || !row) {
    return NextResponse.json({ ok: false, error: 'Candidature introuvable' }, { status: 404 })
  }
  if (!row.contract_pdf_path) {
    return NextResponse.json({ ok: false, error: 'Aucun contrat envoyé pour ce dossier.' }, { status: 404 })
  }

  const { data: signed, error: signError } = await supabase.storage
    .from('contracts')
    .createSignedUrl(row.contract_pdf_path, 60)

  if (signError || !signed?.signedUrl) {
    console.error('[contract/file] signed URL échouée', signError)
    return NextResponse.json({ ok: false, error: 'Impossible de générer le lien.' }, { status: 500 })
  }

  return NextResponse.redirect(signed.signedUrl, 302)
}
