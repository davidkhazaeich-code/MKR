import { NextResponse, type NextRequest } from 'next/server'

// Protege /admin/* via cookie httpOnly 'mkr_admin'.
// Le cookie est pose par POST /api/admin/login apres verification du token.
// Si pas de cookie ou cookie invalide -> rewrite vers /admin/login (pas redirect, pas 404 :
//   le 404 cassait la nav back ; rewrite garde l'URL propre).
//
// Next 16+ : convention proxy.ts (anciennement middleware.ts). Runtime nodejs uniquement.

const COOKIE_NAME = 'mkr_admin'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // /admin/login est publique
  if (pathname === '/admin/login' || pathname === '/api/admin/login') {
    return NextResponse.next()
  }

  // Comparaison strict equality : le cookie est pose httpOnly + secure + sameSite=strict,
  // seul un user authentifie le possede. Pas de risque de timing leak via cookie.
  const expected = process.env.ADMIN_TOKEN
  const provided = request.cookies.get(COOKIE_NAME)?.value

  if (!expected || !provided || provided !== expected) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    url.search = ''
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
