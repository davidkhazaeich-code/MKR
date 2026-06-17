/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

export interface OgTemplateInput {
  /** Keywords en top-right, uppercase, séparés par " · " (ex: "DAGHESTAN · LUTTE · CAUCASE") */
  keywords?: string
  /** Eyebrow label (alternative à keywords) */
  label?: string
  /** Titre principal énorme (4-30 chars idéal pour 110-140px) */
  title: string
  /** Sous-titre court avec preuves chiffrées (max ~85 chars) */
  subtitle?: string
  /** Accent color */
  accent?: 'red' | 'green' | 'orange' | 'gold'
  /** Background image PNG depuis /public/og-bg/. Affichée à opacité 0.18 par-dessus le noir */
  bgImage?: string
  /** Locale pour la tagline footer (fr par défaut). */
  locale?: 'fr' | 'en'
}

const ACCENT_MAP: Record<NonNullable<OgTemplateInput['accent']>, string> = {
  red: '#C0392B',
  green: '#2E7D5C',
  orange: '#E67E22',
  gold: '#D4A24C',
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

/**
 * Génère une OG image 1200×630 PNG selon les principes UX/UI pro :
 *
 * Typographie :
 *  - Title : font-weight 900, uppercase, auto-scale 70-140px selon longueur,
 *    line-height 1.0, tracking -0.022em
 *  - Keywords (top-right) : 22px / 800 / 0.24em tracking / accent color
 *  - Subtitle : 30px / 500 / line-height 1.4, préfixé d'une accent stripe 40×3
 *  - Footer brand : 22px / 800 + tagline 18px / 700 / 0.22em tracking
 *
 * Spacing (4/8/16/24/32/40/48/56/64/80px scale) :
 *  - Padding container : 80px gauche/droite, 56px top (logo)
 *  - Logo : 220×133 (ratio 1000:604)
 *  - Title vertical center, subtitle 36px sous title
 *  - Footer 44px du bottom
 *
 * Visual :
 *  - Stripe accent gauche 14px
 *  - Background photo PNG à 0.18 opacité avec gradient dark par-dessus
 *  - Halos radiaux multiples
 *  - Texture grain subtile
 *
 * Hiérarchie : 1 focal point unique = le titre énorme. Tout le reste support.
 */
export async function createOgImageResponse({
  keywords,
  label,
  title,
  subtitle,
  accent = 'red',
  bgImage,
  locale = 'fr',
}: OgTemplateInput) {
  const logoDataUri = await readPublicAsset('/logo-white.png')
  const bgDataUri = bgImage ? await readPublicAsset(bgImage) : null
  const accentColor = ACCENT_MAP[accent]
  const tagline = locale === 'en' ? 'Immersion among champions' : "L'immersion au milieu des champions"

  const TEXT = '#FFFFFF'
  const MUTED = '#D8D8D8'

  // Auto-scale du titre (plus court = plus gros)
  const titleSize =
    title.length <= 12 ? 148 :
    title.length <= 18 ? 130 :
    title.length <= 26 ? 110 :
    title.length <= 34 ? 92 :
    title.length <= 44 ? 78 :
    title.length <= 58 ? 64 : 54

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#050505',
          position: 'relative',
        }}
      >
        {/* Background image PNG très légère */}
        {bgDataUri && (
          <img
            src={bgDataUri}
            alt=""
            width={1200}
            height={630}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.22,
              filter: 'saturate(0.7) contrast(1.05)',
            }}
          />
        )}

        {/* Dark gradient overlay pour assurer le contraste du texte */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `linear-gradient(120deg, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.78) 35%, rgba(5,5,5,0.62) 65%, rgba(5,5,5,0.85) 100%)`,
            display: 'flex',
          }}
        />

        {/* Halo accent radial bottom-left (zone du titre) */}
        <div
          style={{
            position: 'absolute',
            bottom: -240,
            left: -180,
            width: 720,
            height: 720,
            borderRadius: '50%',
            backgroundColor: accentColor,
            opacity: 0.08,
            display: 'flex',
          }}
        />

        {/* Halo accent radial top-right (zone keywords) */}
        <div
          style={{
            position: 'absolute',
            top: -180,
            right: -180,
            width: 520,
            height: 520,
            borderRadius: '50%',
            backgroundColor: accentColor,
            opacity: 0.10,
            display: 'flex',
          }}
        />

        {/* Stripe accent gauche élargi */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 14,
            height: '100%',
            backgroundColor: accentColor,
            display: 'flex',
          }}
        />

        {/* Grain texture subtile */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.035) 1px, rgba(255,255,255,0) 1px)',
            backgroundSize: '5px 5px',
            opacity: 0.55,
            display: 'flex',
          }}
        />

        {/* Logo MKR top-left (ratio 1000:604 strict : 220×133) */}
        {logoDataUri && (
          <div
            style={{
              position: 'absolute',
              top: 60,
              left: 72,
              display: 'flex',
            }}
          >
            <img
              src={logoDataUri}
              alt="MKR Caucasian Camp"
              width={220}
              height={133}
            />
          </div>
        )}

        {/* Keywords/label en top-right (eyebrow positionné face au logo) */}
        {(keywords || label) && (
          <div
            style={{
              position: 'absolute',
              top: 92,
              right: 72,
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: '0.24em',
              color: accentColor,
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                width: 32,
                height: 2,
                backgroundColor: accentColor,
                marginRight: 16,
                display: 'flex',
                flexShrink: 0,
              }}
            />
            {keywords || label}
          </div>
        )}

        {/* Bloc central : TITRE ÉNORME + subtitle */}
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
            paddingTop: 30,
          }}
        >
          <div
            style={{
              fontSize: titleSize,
              fontWeight: 900,
              color: TEXT,
              lineHeight: 1.0,
              letterSpacing: '-0.022em',
              textTransform: 'uppercase',
              maxWidth: 1040,
              display: 'flex',
              textShadow: '0 2px 24px rgba(0,0,0,0.6)',
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
                marginTop: 36,
                lineHeight: 1.4,
                maxWidth: 1020,
                display: 'flex',
                alignItems: 'flex-start',
              }}
            >
              <span
                style={{
                  width: 40,
                  height: 3,
                  backgroundColor: accentColor,
                  marginRight: 20,
                  marginTop: 17,
                  display: 'flex',
                  flexShrink: 0,
                }}
              />
              <span style={{ display: 'flex', flexWrap: 'wrap' }}>{subtitle}</span>
            </div>
          )}
        </div>

        {/* Footer : brand + tagline */}
        <div
          style={{
            position: 'absolute',
            bottom: 44,
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
            {tagline}
          </div>
        </div>
      </div>
    ),
    OG_SIZE
  )
}
