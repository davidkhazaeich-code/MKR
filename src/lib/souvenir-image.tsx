/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

// Image souvenir portrait (1080x1350, ratio 4:5 optimal Instagram) generee cote
// serveur avec Satori (next/og) et envoyee au candidat a la validation de son
// dossier. Reutilise les polices de marque + fonds PNG deja eprouves par les OG.
// Renvoie le PNG en Buffer, pret a etre attache a un email (cf. souvenir-notify).

export const SOUVENIR_SIZE = { width: 1080, height: 1350 }

export type SouvenirDiscipline = 'lutte' | 'mma' | 'combo_quote'

interface SouvenirOptions {
  prenom: string
  campDiscipline?: SouvenirDiscipline | '' | null
  session?: string | null
  locale?: 'fr' | 'en'
}

// Fonds PNG (Satori ne decode pas le webp de maniere fiable → on prend les PNG
// deja utilises par les OG, garantis compatibles).
const PRESETS: Record<SouvenirDiscipline, { bg: string; fr: string; en: string }> = {
  lutte: { bg: '/og-bg/dagestan-panorama.png', fr: 'LUTTE · DAGHESTAN', en: 'WRESTLING · DAGESTAN' },
  mma: { bg: '/og-bg/sparring-mma-wall.png', fr: 'MMA · TCHÉTCHÉNIE', en: 'MMA · CHECHNYA' },
  combo_quote: { bg: '/og-bg/takedown-wrestling.png', fr: 'LUTTE + MMA · CAUCASE', en: 'WRESTLING + MMA · CAUCASUS' },
}

async function readPublicAsset(relativePath: string): Promise<string | null> {
  try {
    const filePath = path.join(process.cwd(), 'public', relativePath.replace(/^\//, ''))
    const buffer = await readFile(filePath)
    const ext = path.extname(filePath).toLowerCase().slice(1)
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`
    return `data:${mime};base64,${buffer.toString('base64')}`
  } catch {
    return null
  }
}

type Font = { name: string; data: Buffer; weight: 500 | 600 | 700; style: 'normal' }
let fontCache: Font[] | null = null
async function loadFonts(): Promise<Font[]> {
  if (fontCache) return fontCache
  try {
    const dir = path.join(process.cwd(), 'public', 'og-fonts')
    const [teko, barlowCondensed, barlow] = await Promise.all([
      readFile(path.join(dir, 'Teko-Bold.ttf')),
      readFile(path.join(dir, 'BarlowCondensed-SemiBold.ttf')),
      readFile(path.join(dir, 'Barlow-Medium.ttf')),
    ])
    fontCache = [
      { name: 'Teko', data: teko, weight: 700, style: 'normal' },
      { name: 'Barlow Condensed', data: barlowCondensed, weight: 600, style: 'normal' },
      { name: 'Barlow', data: barlow, weight: 500, style: 'normal' },
    ]
    return fontCache
  } catch {
    return []
  }
}

/** Genere le PNG de l'image souvenir. Ne throw pas d'erreur de contenu (fallbacks). */
export async function renderSouvenirPng(opts: SouvenirOptions): Promise<Buffer> {
  const en = opts.locale === 'en'
  const key: SouvenirDiscipline =
    opts.campDiscipline === 'mma' || opts.campDiscipline === 'combo_quote' ? opts.campDiscipline : 'lutte'
  const preset = PRESETS[key]
  const prenom = (opts.prenom || (en ? 'Champion' : 'Champion')).trim().toUpperCase().slice(0, 18)
  const disciplineLabel = en ? preset.en : preset.fr
  const eyebrow = en ? 'APPLICATION CONFIRMED' : 'DOSSIER VALIDÉ'
  const joinLine = en ? 'JOINS MKR CAUCASIAN CAMP' : 'REJOINT LE MKR CAUCASIAN CAMP'
  const tagline = en ? 'IMMERSION AMONG CHAMPIONS' : "L'IMMERSION AU MILIEU DES CHAMPIONS"
  const session = (opts.session || '').trim()

  const [logo, bg, fonts] = await Promise.all([
    readPublicAsset('/logo-white.png'),
    readPublicAsset(preset.bg),
    loadFonts(),
  ])

  const ACCENT = '#C84B31'
  // Auto-scale du prenom (Teko condense).
  const pl = prenom.length
  const nameSize = pl <= 7 ? 210 : pl <= 10 ? 176 : pl <= 13 ? 146 : 118

  const el = (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        backgroundColor: '#0E0E0E',
        fontFamily: 'Barlow',
      }}
    >
      {/* Fond photo + voile sombre pour le contraste */}
      {bg && (
        <img
          src={bg}
          width={SOUVENIR_SIZE.width}
          height={SOUVENIR_SIZE.height}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.34 }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'linear-gradient(180deg, rgba(14,14,14,0.7) 0%, rgba(14,14,14,0.35) 40%, rgba(14,14,14,0.88) 100%)',
        }}
      />

      {/* Header : logo */}
      <div style={{ display: 'flex', padding: '64px 72px 0', zIndex: 1 }}>
        {logo && <img src={logo} width={220} height={70} style={{ width: 220, height: 70, objectFit: 'contain' }} />}
      </div>

      {/* Bloc central */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '0 72px',
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            fontFamily: 'Barlow Condensed',
            fontWeight: 600,
            fontSize: 34,
            letterSpacing: 6,
            color: ACCENT,
            marginBottom: 8,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            display: 'flex',
            fontFamily: 'Teko',
            fontWeight: 700,
            fontSize: nameSize,
            lineHeight: 0.92,
            color: '#FFFFFF',
            letterSpacing: 1,
          }}
        >
          {prenom}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 18,
            paddingLeft: 20,
            borderLeft: `6px solid ${ACCENT}`,
            fontFamily: 'Barlow Condensed',
            fontWeight: 600,
            fontSize: 46,
            letterSpacing: 2,
            color: '#F2F2F0',
          }}
        >
          {disciplineLabel}
        </div>
        {session && (
          <div style={{ display: 'flex', marginTop: 14, paddingLeft: 26, fontFamily: 'Barlow', fontWeight: 500, fontSize: 30, color: '#C9C9C4' }}>
            {session}
          </div>
        )}
      </div>

      {/* Footer : rejoint le camp + tagline */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '0 72px 64px',
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', fontFamily: 'Barlow Condensed', fontWeight: 600, fontSize: 30, letterSpacing: 3, color: '#FFFFFF' }}>
          {joinLine}
        </div>
        <div style={{ display: 'flex', marginTop: 10, fontFamily: 'Barlow', fontWeight: 500, fontSize: 22, letterSpacing: 1, color: '#8A8A84' }}>
          {tagline} · @mkrcamp
        </div>
      </div>
    </div>
  )

  const res = new ImageResponse(el, {
    width: SOUVENIR_SIZE.width,
    height: SOUVENIR_SIZE.height,
    fonts: fonts.length
      ? fonts.map((f) => ({ name: f.name, data: f.data, weight: f.weight, style: f.style }))
      : undefined,
  })
  const arr = await res.arrayBuffer()
  return Buffer.from(arr)
}
