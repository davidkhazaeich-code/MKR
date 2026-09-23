import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getSessions } from '@/data/sessions'

// Cron quotidien (vercel.json, 00:05 UTC) : regenere le site le jour ou la
// fenetre des sessions tourne, et seulement ces jours-la.
//
// Les pages publiques sont statiques (cf. src/app/[locale]/(site)/layout.tsx).
// La fenetre glissante de data/sessions.ts ne change que quand un camp demarre,
// soit quatre fois par an. On compare donc la fenetre du jour a celle d'il y a
// CATCH_UP_DAYS jours : un run manque (panne, deploiement en cours) est rattrape
// le lendemain, au lieu de laisser en ligne un camp deja parti jusqu'au
// prochain deploiement. Cout : trois regenerations du site par bascule.
//
// `?force=1` regenere sans condition (meme secret), pour un controle manuel.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CATCH_UP_DAYS = 3
const DAY_MS = 86_400_000

function windowIds(now: Date): string {
  return getSessions(now).map(s => s.id).join(' ')
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const current = windowIds(now)
  const previous = windowIds(new Date(now.getTime() - CATCH_UP_DAYS * DAY_MS))
  const force = new URL(request.url).searchParams.get('force') === '1'

  if (current === previous && !force) {
    return NextResponse.json({ ok: true, revalidated: false, sessions: current })
  }

  // Layout racine : toutes les pages, FR et EN, regenerees a la visite suivante.
  revalidatePath('/', 'layout')
  console.log(`[cron/revalidate-sessions] site regenere (${force ? 'force' : 'bascule'}) : ${previous} -> ${current}`)
  return NextResponse.json({ ok: true, revalidated: true, force, previous, sessions: current })
}
