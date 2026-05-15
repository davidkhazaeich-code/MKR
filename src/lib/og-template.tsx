/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

export interface OgTemplateInput {
  /** Keywords en haut, uppercase, séparés par " · " (ex: "DAGHESTAN · LUTTE LIBRE · CAUCASE") */
  keywords?: string
  /** Petit label/eyebrow (mutuellement exclusif avec keywords) */
  label?: string
  /** Titre principal énorme (max ~36 chars pour un impact maximal) */
  title: string
  /** Sous-titre court sous le titre (max ~80 chars) */
  subtitle?: string
  /** Accent color (default: red) */
  accent?: 'red' | 'green' | 'orange' | 'gold'
}

const ACCENT_MAP: Record<NonNullable<OgTemplateInput['accent']>, string> = {
  red: '#C0392B',
  green: '#2E7D5C',
  orange: '#E67E22',
  gold: '#D4A24C',
}

async function readPublicAsset(relativePath: string): Promise<string> {
  const filePath = path.join(process.cwd(), 'public', relativePath.replace(/^\//, ''))
  const buffer = await readFile(filePath)
  const ext = path.extname(filePath).toLowerCase().slice(1)
  const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`
  return `data:${mime};base64,${buffer.toString('base64')}`
}

/**
 * Génère une OG image 1200×630 PNG ultra-impactante.
 *
 * Design : fond noir cinéma + halos accent + logo MKR en haut-gauche
 * (ratio préservé via base64) + KEYWORDS uppercase en top + TITRE énorme
 * (96-120px auto-scale) + subtitle court + footer tagline brand.
 *
 * Préférer un titre punchy de 1 à 5 mots (ex: "LA TERRE DE KHABIB") plutôt
 * qu'une phrase descriptive. Les mots clés vont dans `keywords` (haut), le
 * subtitle (bas) donne la preuve concrète (chiffres, marqueurs).
 */
export async function createOgImageResponse({
  keywords,
  label,
  title,
  subtitle,
  accent = 'red',
}: OgTemplateInput) {
  const logoDataUri = await readPublicAsset('/logo-white.png')
  const accentColor = ACCENT_MAP[accent]

  const TEXT = '#FFFFFF'
  const MUTED = '#C8C8C8'

  // Auto-scale du titre : plus court = plus gros
  const titleSize =
    title.length <= 14 ? 140 :
    title.length <= 22 ? 118 :
    title.length <= 32 ? 96 :
    title.length <= 44 ? 80 :
    title.length <= 60 ? 64 : 54

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#070707',
          backgroundImage: `radial-gradient(circle at 12% 18%, ${accentColor}22 0%, rgba(7,7,7,0) 50%), radial-gradient(circle at 88% 82%, ${accentColor}33 0%, rgba(7,7,7,0) 55%), radial-gradient(circle at 50% 50%, rgba(40,15,15,0.35) 0%, rgba(7,7,7,0) 70%)`,
          position: 'relative',
        }}
      >
        {/* Stripe accent gauche large pour impact */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 12,
            height: '100%',
            backgroundColor: accentColor,
            display: 'flex',
          }}
        />

        {/* Halo accent top-left subtil */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: '50%',
            backgroundColor: accentColor,
            opacity: 0.08,
            display: 'flex',
          }}
        />

        {/* Texture grain layer */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0) 1px)',
            backgroundSize: '4px 4px',
            opacity: 0.6,
            display: 'flex',
          }}
        />

        {/* Logo MKR top-left (ratio 1000:604 préservé : 200×120) */}
        <div
          style={{
            position: 'absolute',
            top: 56,
            left: 70,
            display: 'flex',
          }}
        >
          <img
            src={logoDataUri}
            alt="MKR Caucasian Camp"
            width={200}
            height={120}
          />
        </div>

        {/* KEYWORDS ou label en top-right */}
        {(keywords || label) && (
          <div
            style={{
              position: 'absolute',
              top: 78,
              right: 70,
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: '0.26em',
              color: accentColor,
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {keywords || label}
          </div>
        )}

        {/* Bloc central : titre énorme + subtitle */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingLeft: 80,
            paddingRight: 80,
            paddingTop: 50,
          }}
        >
          {/* Titre ENORME, uppercase, font-weight 900 */}
          <div
            style={{
              fontSize: titleSize,
              fontWeight: 900,
              color: TEXT,
              lineHeight: 0.95,
              letterSpacing: '-0.025em',
              textTransform: 'uppercase',
              maxWidth: 1040,
              display: 'flex',
            }}
          >
            {title}
          </div>

          {subtitle && (
            <div
              style={{
                fontSize: 30,
                fontWeight: 500,
                color: MUTED,
                marginTop: 32,
                lineHeight: 1.3,
                maxWidth: 1000,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  width: 36,
                  height: 3,
                  backgroundColor: accentColor,
                  marginRight: 18,
                  display: 'flex',
                  flexShrink: 0,
                }}
              />
              {subtitle}
            </div>
          )}
        </div>

        {/* Footer split : brand + tagline */}
        <div
          style={{
            position: 'absolute',
            bottom: 42,
            left: 80,
            right: 80,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: '0.18em',
              color: TEXT,
              textTransform: 'uppercase',
              display: 'flex',
            }}
          >
            mkrcamp.com
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '0.22em',
              color: accentColor,
              textTransform: 'uppercase',
              display: 'flex',
            }}
          >
            L&apos;immersion au milieu des champions
          </div>
        </div>
      </div>
    ),
    OG_SIZE
  )
}
