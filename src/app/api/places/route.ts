import { NextResponse } from 'next/server'
import { getAllSessionPlaces } from '@/lib/places'

// GET /api/places — public, agrege les places prises/restantes par session.
// Cache edge 60s + stale-while-revalidate 5min : on tient ~50 candidatures/jour
// sans surcharger la DB, et l'utilisateur voit l'info quasi-realtime.

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sessions = await getAllSessionPlaces()
    return NextResponse.json(
      { generated_at: new Date().toISOString(), sessions },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      },
    )
  } catch (err) {
    console.error('[api/places] failed', err)
    return NextResponse.json(
      { ok: false, error: 'Impossible de charger les places' },
      { status: 500 },
    )
  }
}
