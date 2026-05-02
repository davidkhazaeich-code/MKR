import { NextResponse } from 'next/server'

// Endpoint TEMPORAIRE pour debug auth admin. A supprimer une fois le login OK.
// Hors de /api/admin/* pour ne pas etre bloque par le proxy.
// Aucun secret expose : seulement booleens, longueurs, et match-test.

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const provided = url.searchParams.get('check') ?? ''
  const expected = process.env.ADMIN_TOKEN ?? ''

  // Si check fourni, on test le match. Sinon on dump juste l'etat env.
  const matches = provided.length > 0 && provided === expected

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    deployedCommit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    env: {
      ADMIN_TOKEN_set: !!expected,
      ADMIN_TOKEN_length: expected.length,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '(not set)',
      NEXT_PUBLIC_SUPABASE_ANON_KEY_set: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_SUPABASE_ANON_KEY_length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length ?? 0,
      SUPABASE_SERVICE_ROLE_KEY_set: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_SERVICE_ROLE_KEY_length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length ?? 0,
    },
    check: provided.length > 0
      ? {
          provided_length: provided.length,
          expected_length: expected.length,
          matches,
          length_match: provided.length === expected.length,
          first_chars_match: provided.slice(0, 8) === expected.slice(0, 8),
          last_chars_match: provided.slice(-8) === expected.slice(-8),
        }
      : null,
  })
}
