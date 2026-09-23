#!/usr/bin/env node
// Fumee contre l'admin ACTUEL (avant toute refonte), lance par dev.mjs dans un
// autre terminal. Se connecte, puis verifie 5 pages. Sort en code 1 des le
// premier echec (voir brief task-1, Step 4/5).
//
// Le prealable de connexion n'est pas compte dans le "N/5" : ce sont les 5
// verifications de pages qui le composent (4 pages "200 + contenu fixture" +
// 1 page "404 + Dossier introuvable").

const BASE = `http://localhost:${process.env.ADMIN_NEXT_PORT ?? 3100}`
const TOTAL = 5
let passed = 0

function fail(label, detail) {
  console.error(`\nFAIL ${label} : ${detail}`)
  process.exit(1)
}

function setCookiesOf(res) {
  if (typeof res.headers.getSetCookie === 'function') return res.headers.getSetCookie()
  const single = res.headers.get('set-cookie')
  return single ? [single] : []
}

async function login() {
  console.log('-- connexion (POST /api/admin/login) --')
  let res
  try {
    res = await fetch(`${BASE}/api/admin/login`, {
      method: 'POST',
      redirect: 'manual',
      body: new URLSearchParams({ token: 'local-admin-token', next: '/admin/inscriptions' }),
    })
  } catch (err) {
    fail('login', `requete impossible (${err.message}). dev.mjs tourne-t-il sur http://localhost:3100 ?`)
  }
  if (res.status !== 303) fail('login', `attendu 303, recu ${res.status} — ADMIN_TOKEN cote next dev vaut-il bien "local-admin-token" ?`)

  const cookie = setCookiesOf(res).map((c) => c.split(';')[0]).find((c) => c.startsWith('mkr_admin='))
  if (!cookie) fail('login', `cookie mkr_admin absent (Set-Cookie recus : ${JSON.stringify(setCookiesOf(res))})`)

  const location = new URL(res.headers.get('location') || '/admin/inscriptions', BASE).pathname
  console.log(`OK connexion (cookie recupere, redirection 303 vers ${location})`)
  return { cookie, location }
}

// React SSR insere des commentaires HTML vides (`<!-- -->`) entre une valeur
// dynamique et le texte litteral qui la suit (marqueurs de frontiere pour
// l'hydratation) : "6<!-- --> candidatures" au lieu de "6 candidatures". Sans
// ce nettoyage, un texte compose (nombre + mot) peut sembler absent alors
// qu'il est bien affiche (verifie a l'oeil dans un navigateur reel).
function stripHydrationComments(html) {
  return html.replace(/<!--\s*-->/g, '')
}

async function check(cookie, label, path, { mustContain, mustNotContain, expectStatus = 200 } = {}) {
  const res = await fetch(`${BASE}${path}`, { headers: { Cookie: cookie } })
  if (expectStatus !== null && res.status !== expectStatus) {
    fail(label, `${path} -> ${res.status} (attendu ${expectStatus})`)
  }
  const html = stripHydrationComments(await res.text())
  if (mustContain && !html.includes(mustContain)) {
    fail(label, `${path} (status ${res.status}) : texte "${mustContain}" absent de la reponse`)
  }
  if (mustNotContain && html.includes(mustNotContain)) {
    fail(label, `${path} : texte "${mustNotContain}" ne devrait pas apparaitre`)
  }
  passed++
  console.log(`OK [${passed}/${TOTAL}] ${label} (${path})`)
}

async function main() {
  const { cookie, location } = await login()

  // La cible du 303 EST /admin/inscriptions : ce fetch sert a la fois a "suivre
  // le 303" et de check 1/5 (liste des candidatures, nom fictif visible).
  await check(cookie, 'inscriptions (liste)', location, { mustContain: 'Lucas' })

  await check(cookie, 'dossier #1', '/admin/inscriptions/00000000-0000-4000-8000-000000000001', { mustContain: 'Lucas' })

  // La page referrals n'affiche jamais de nom de candidat (elle agrege par
  // partenaire) : le signal fixture-specifique est le compte de candidatures
  // rattachees a un code (6 dans fixtures.mts : due/paid/pending x3/invalide).
  await check(cookie, 'referrals', '/admin/referrals', { mustContain: '6 candidature', mustNotContain: 'Erreur Supabase' })

  await check(cookie, 'guide-leads', '/admin/guide-leads', { mustContain: 'lead1@example.com' })

  // notFound() renvoie une vraie 404 : on ne verifie que le texte affiche, pas le status.
  await check(cookie, 'dossier introuvable', '/admin/inscriptions/00000000-0000-4000-8000-00000000ffff', {
    mustContain: 'Dossier introuvable',
    expectStatus: null,
  })

  console.log(`\nSMOKE OK (${passed}/${TOTAL})`)
}

main().catch((err) => fail('inattendu', err.stack || err.message))
