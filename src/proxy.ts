import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { findReferralCode } from './data/referral-codes';

// Proxy combine deux roles :
// 1) Guard admin : protege /admin/* et /api/admin/* via cookie httpOnly 'mkr_admin'.
//    Le cookie est pose par POST /api/admin/login apres verification du token.
//    Si pas de cookie ou cookie invalide -> rewrite vers /admin/login.
// 2) i18n routing : detection Accept-Language + slugs traduits FR/EN via next-intl.
//    Admin reste 100% FR : on bloque /en/admin/* en redirigeant vers /admin/*.
//
// Next 16+ : convention proxy.ts (anciennement middleware.ts). Runtime nodejs uniquement.

const COOKIE_NAME = 'mkr_admin';
const REF_COOKIE_NAME = 'mkr_ref';
const REF_COOKIE_MAX_AGE = 60 * 60 * 24 * 60; // 60 jours en secondes

const intlMiddleware = createMiddleware(routing);

function handleAdminGuard(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  // Tentative d'acces /en/admin/* ou /en/api/admin/* -> redirect vers FR (admin reste FR)
  if (pathname.startsWith('/en/admin') || pathname.startsWith('/en/api/admin')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/en/, '');
    return NextResponse.redirect(url);
  }

  // Routes admin (FR uniquement)
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (pathname === '/admin/login' || pathname === '/api/admin/login') {
      return NextResponse.next();
    }

    // Comparaison strict equality : le cookie est pose httpOnly + secure + sameSite=strict,
    // seul un user authentifie le possede. Pas de risque de timing leak via cookie.
    const expected = process.env.ADMIN_TOKEN;
    const provided = request.cookies.get(COOKIE_NAME)?.value;

    if (!expected || !provided || provided !== expected) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.search = '';
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  return null;
}

// Si l'URL contient ?ref=<code> et que le code est valide + actif, pose le cookie
// d'attribution mkr_ref (60j, lisible JS, SameSite=Lax) sur la réponse fournie.
// Un ?ref inconnu/inactif est ignoré silencieusement (pas de fausse attribution).
function applyReferralCapture(request: NextRequest, response: NextResponse): NextResponse {
  const ref = request.nextUrl.searchParams.get('ref');
  if (!ref) return response;
  const matched = findReferralCode(ref);
  if (!matched) return response;
  response.cookies.set(REF_COOKIE_NAME, matched.code, {
    maxAge: REF_COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    httpOnly: false, // lu par le formulaire client pour pré-remplir le code
    secure: process.env.NODE_ENV === 'production', // HTTPS en prod, http en dev local
  });
  return response;
}

export function proxy(request: NextRequest) {
  const adminResponse = handleAdminGuard(request);
  if (adminResponse) return adminResponse;

  // API routes publiques non localisees
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // i18n routing pour toutes les pages publiques + capture éventuelle du ?ref d'affiliation.
  const intlResponse = intlMiddleware(request);
  return applyReferralCapture(request, intlResponse);
}

export const config = {
  matcher: [
    // Match toutes les routes SAUF :
    // - _next (assets Next.js)
    // - _vercel (preview)
    // - fichiers statiques (.ext)
    '/((?!_next|_vercel|.*\\..*).*)',
  ],
};
