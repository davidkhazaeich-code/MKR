/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

export interface OgTemplateInput {
  /** Petit label en haut, uppercase, rouge accent (ex: "DESTINATION", "LE CAMP") */
  label: string
  /** Titre principal (max ~50 chars pour rester lisible) */
  title: string
  /** Sous-titre / tagline courte sous le titre (optionnel) */
  subtitle?: string
  /** Accent color override (default: MKR primary rouge) */
  accent?: 'red' | 'green' | 'orange'
}

const ACCENT_MAP: Record<NonNullable<OgTemplateInput['accent']>, string> = {
  red: '#C0392B',
  green: '#2E7D5C',
  orange: '#D97339',
}

async function readPublicAsset(relativePath: string): Promise<string> {
  const filePath = path.join(process.cwd(), 'public', relativePath.replace(/^\//, ''))
  const buffer = await readFile(filePath)
  const ext = path.extname(filePath).toLowerCase().slice(1)
  const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`
  return `data:${mime};base64,${buffer.toString('base64')}`
}

/**
 * Génère une OG image 1200×630 PNG.
 *
 * Design : fond noir cinéma + stripe accent gauche + logo MKR blanc en haut-gauche
 * (ratio préservé, JAMAIS déformé car embarqué en base64 + dimensions explicites)
 * + label uppercase coloré + titre blanc gros + sous-titre gris + footer tagline.
 *
 * Note : Satori (le moteur derrière ImageResponse) ne supporte pas les images WebP
 * en background. On reste sur un design minimaliste type plaque cinéma, qui est
 * de toute façon plus lisible en preview social (LinkedIn/WhatsApp/Instagram affichent
 * en petit ~300px de large, donc le texte doit primer sur la photo).
 */
export async function createOgImageResponse({ label, title, subtitle, accent = 'red' }: OgTemplateInput) {
  const logoDataUri = await readPublicAsset('/logo-white.png')
  const accentColor = ACCENT_MAP[accent]

  const TEXT = '#FFFFFF'
  const MUTED = '#BCBCBC'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0A0A0A',
          backgroundImage:
            'radial-gradient(circle at 18% 22%, rgba(192, 57, 43, 0.18) 0%, rgba(10, 10, 10, 0) 55%), radial-gradient(circle at 82% 78%, rgba(70, 30, 25, 0.35) 0%, rgba(10, 10, 10, 0) 60%)',
          position: 'relative',
        }}
      >
        {/* Accent stripe gauche */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 10,
            height: '100%',
            backgroundColor: accentColor,
            display: 'flex',
          }}
        />

        {/* Texture grain layer (subtle dot pattern via gradient) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.025) 1px, rgba(255,255,255,0) 1px)',
            backgroundSize: '4px 4px',
            opacity: 0.5,
            display: 'flex',
          }}
        />

        {/* Logo en haut-gauche, ratio 1000:604 préservé (200×120) */}
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: 70,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <img
            src={logoDataUri}
            alt="MKR Caucasian Camp"
            width={210}
            height={127}
          />
        </div>

        {/* Decorative accent line top right */}
        <div
          style={{
            position: 'absolute',
            top: 92,
            right: 70,
            width: 80,
            height: 3,
            backgroundColor: accentColor,
            display: 'flex',
          }}
        />

        {/* Content block centred-left */}
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
            paddingTop: 70,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '0.22em',
              color: accentColor,
              textTransform: 'uppercase',
              marginBottom: 28,
              display: 'flex',
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: title.length > 50 ? 56 : title.length > 30 ? 64 : 76,
              fontWeight: 800,
              color: TEXT,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              maxWidth: 1020,
              display: 'flex',
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 28,
                fontWeight: 500,
                color: MUTED,
                marginTop: 26,
                lineHeight: 1.32,
                maxWidth: 1000,
                display: 'flex',
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            left: 80,
            right: 80,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: '0.18em',
              color: '#FFFFFF',
              textTransform: 'uppercase',
              display: 'flex',
            }}
          >
            mkrcamp.com
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: '0.18em',
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
