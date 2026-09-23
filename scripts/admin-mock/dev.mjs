#!/usr/bin/env node
// Lance le faux backend (server.mjs) puis `next dev -p 3100` avec les variables
// d'env qui pointent l'admin dessus. Ctrl+C arrete proprement les deux.
//
// Les valeurs ci-dessous ECRASENT `.env.local` (Next ne remplace jamais une
// variable deja definie dans process.env au moment ou il demarre) : on les
// passe dans le `env` du sous-processus `next dev`, pas dans le shell parent.

import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')

const MOCK_HOST = '127.0.0.1'
const MOCK_PORT = 54321
const NEXT_PORT = 3100

const ENV_OVERRIDES = {
  NEXT_PUBLIC_SUPABASE_URL: `http://${MOCK_HOST}:${MOCK_PORT}`,
  SUPABASE_SERVICE_ROLE_KEY: 'mock-service-role',
  ADMIN_TOKEN: 'local-admin-token',
  RESEND_API_KEY: 're_mock',
  RESEND_BASE_URL: `http://${MOCK_HOST}:${MOCK_PORT}/resend`,
  SLACK_WEBHOOK_URL: '',
  CAL_WEBHOOK_SECRET: 'mock-cal-secret',
  NEXT_PUBLIC_SITE_URL: `http://localhost:${NEXT_PORT}`,
  // Pas dans le brief mais necessaires : sans cal-a-vide, le calendrier public
  // (hors admin) tenterait un vrai appel Cal.com ; CRON_SECRET vide desactive
  // la verification de secret des routes cron (aucun cron ne tourne en local).
  CAL_API_KEY: '',
  CRON_SECRET: '',
}

function checkPortFree(port, host) {
  return new Promise((resolve) => {
    const tester = createServer()
    tester.once('error', () => resolve(false))
    tester.once('listening', () => tester.close(() => resolve(true)))
    tester.listen(port, host)
  })
}

function waitForMock(timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs
  return new Promise((resolve, reject) => {
    const attempt = () => {
      fetch(`http://${MOCK_HOST}:${MOCK_PORT}/__state`)
        .then((res) => (res.ok ? resolve() : retry()))
        .catch(retry)
    }
    const retry = () => {
      if (Date.now() > deadline) return reject(new Error(`faux backend indisponible apres ${timeoutMs}ms`))
      setTimeout(attempt, 200)
    }
    attempt()
  })
}

async function main() {
  const [mockFree, nextFree] = await Promise.all([
    checkPortFree(MOCK_PORT, MOCK_HOST),
    checkPortFree(NEXT_PORT, '0.0.0.0'),
  ])
  if (!mockFree) {
    console.error(`[dev] Port ${MOCK_PORT} deja occupe (faux backend). Identifie le process avec :`)
    console.error(`      lsof -tiTCP:${MOCK_PORT} -sTCP:LISTEN`)
    process.exit(1)
  }
  if (!nextFree) {
    console.error(`[dev] Port ${NEXT_PORT} deja occupe (next dev). Identifie le process avec :`)
    console.error(`      lsof -tiTCP:${NEXT_PORT} -sTCP:LISTEN`)
    process.exit(1)
  }

  console.log(`[dev] Demarrage du faux backend sur http://${MOCK_HOST}:${MOCK_PORT} ...`)
  const mock = spawn(process.execPath, [join(__dirname, 'server.mjs')], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
  })

  let shuttingDown = false
  let next = null
  const shutdown = (code) => {
    if (shuttingDown) return
    shuttingDown = true
    console.log('\n[dev] Arret...')
    next?.kill('SIGTERM')
    mock.kill('SIGTERM')
    if (typeof code === 'number') process.exitCode = code
  }
  process.on('SIGINT', () => shutdown(0))
  process.on('SIGTERM', () => shutdown(0))

  mock.on('exit', (code) => {
    if (shuttingDown) return
    console.error(`[dev] Le faux backend s'est arrete de lui-meme (code ${code}).`)
    shutdown(1)
  })

  try {
    await waitForMock()
  } catch (err) {
    console.error(`[dev] ${err.message}`)
    shutdown(1)
    return
  }
  console.log('[dev] Faux backend pret.')

  console.log(`[dev] Demarrage de next dev sur le port ${NEXT_PORT} (variables mock injectees)...`)
  next = spawn('npx', ['next', 'dev', '-p', String(NEXT_PORT)], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    env: { ...process.env, ...ENV_OVERRIDES },
  })
  next.on('exit', (code) => {
    if (shuttingDown) return
    console.error(`[dev] next dev s'est arrete (code ${code}).`)
    shutdown(code ?? 1)
  })
}

main().catch((err) => {
  console.error('[dev] erreur inattendue :', err)
  process.exit(1)
})
