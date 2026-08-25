import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { buildRebookingEmail, type RebookingDiscipline } from '@/lib/rebooking-email'

// GET /api/admin/candidature/[id]/rebooking/preview
//
// Rend l'email de repositionnement dans un onglet, avant envoi. Ne modifie
// AUCUN etat, n'envoie rien. Meme rendu que le POST, dans la langue du candidat
// et avec la variante liee a son statut.

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface PreviewRow {
  status: string
  submission_language: 'fr' | 'en' | null
  camp_discipline: RebookingDiscipline | null
  duree_semaines: number | null
  tunnel_type: 'session' | 'custom' | 'famille' | 'groupe'
  session_id: string | null
  candidate: { prenom: string | null } | { prenom: string | null }[] | null
}

function firstPrenom(c: PreviewRow['candidate']): string | null {
  if (!c) return null
  const obj = Array.isArray(c) ? (c[0] ?? null) : c
  return obj?.prenom ?? null
}

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  if (!id || id.length < 32) {
    return NextResponse.json({ ok: false, error: 'id candidature invalide' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('candidatures')
    .select(
      `status, submission_language, camp_discipline, duree_semaines, tunnel_type, session_id,
       candidate:candidates ( prenom )`,
    )
    .eq('id', id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ ok: false, error: 'Erreur base de données' }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ ok: false, error: 'Candidature introuvable' }, { status: 404 })
  }

  const row = data as unknown as PreviewRow
  const { html } = buildRebookingEmail({
    locale: row.submission_language === 'en' ? 'en' : 'fr',
    prenom: firstPrenom(row.candidate),
    variant: row.status === 'validee' ? 'validee' : 'recue',
    missedSessionId: row.session_id,
    campDiscipline: row.camp_discipline,
    dureeSemaines: row.duree_semaines,
    tunnel: row.tunnel_type,
  })

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}
