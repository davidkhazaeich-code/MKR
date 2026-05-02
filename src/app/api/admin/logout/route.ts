import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/admin/login', request.url), { status: 303 })
  // path explicite pour matcher le cookie pose par /api/admin/login (path: '/').
  // Sinon le navigateur garde le cookie original et l'utilisateur reste connecte.
  response.cookies.set({ name: 'mkr_admin', value: '', path: '/', maxAge: 0 })
  return response
}
