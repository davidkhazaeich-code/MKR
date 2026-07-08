import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { buildVisioEmail, type VisioCampDiscipline } from '@/lib/visio-email'

// GET /api/admin/candidature/[id]/visio-reminder/preview
//
// Rend l'email de relance visio (HTML) dans un onglet, pour previsualisation avant
// envoi. Ne modifie AUCUN etat, n'envoie rien. Meme rendu que le POST (buildVisioEmail
// variante 'reminder') dans la langue du candidat.

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://mkrcamp.com').replace(/\/$/, '')

interface PreviewRow {
  submission_language: 'fr' | 'en' | null
  camp_discipline: VisioCampDiscipline | null
  duree_semaines: number | null
  cancel_token: string | null
  candidate:
    | { prenom: string | null }
    | { prenom: string | null }[]
    | null
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
      `submission_language, camp_discipline, duree_semaines, cancel_token,
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
  const locale: 'fr' | 'en' = row.submission_language === 'en' ? 'en' : 'fr'
  const cancelUrl = row.cancel_token
    ? `${SITE_URL}/api/cancel-place?c=${id}&t=${row.cancel_token}`
    : undefined
  const { html } = buildVisioEmail({
    prenom: firstPrenom(row.candidate),
    campDiscipline: row.camp_discipline ?? null,
    dureeSemaines: row.duree_semaines ?? null,
    locale,
    variant: 'reminder',
    cancelUrl,
  })

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}
