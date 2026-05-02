import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'

export const dynamic = 'force-dynamic'

// Compare deux strings en temps constant. Si les longueurs diffferent,
// on compare quand meme contre un buffer de meme taille pour ne pas leak la longueur.
function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) {
    // Compare contre lui-meme pour egaliser le timing
    timingSafeEqual(aBuf, aBuf)
    return false
  }
  return timingSafeEqual(aBuf, bBuf)
}

export async function POST(request: Request) {
  const expected = process.env.ADMIN_TOKEN
  if (!expected) {
    return NextResponse.json({ ok: false, error: 'ADMIN_TOKEN non configure' }, { status: 500 })
  }

  const form = await request.formData()
  const provided = String(form.get('token') ?? '')
  const nextRaw = String(form.get('next') ?? '/admin/inscriptions')
  const next = nextRaw.startsWith('/admin') ? nextRaw : '/admin/inscriptions'

  if (!provided || !safeEqual(provided, expected)) {
    const url = new URL('/admin/login', request.url)
    url.searchParams.set('error', '1')
    url.searchParams.set('next', next)
    return NextResponse.redirect(url, { status: 303 })
  }

  const response = NextResponse.redirect(new URL(next, request.url), { status: 303 })
  response.cookies.set({
    name: 'mkr_admin',
    value: expected,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 8, // 8h
  })
  return response
}
