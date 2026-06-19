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
  /** Titre principal énorme (4-30 chars idéal pour 110-150px) */
  title: string
  /** Sous-titre court avec preuves chiffrées (max ~85 chars) */
  subtitle?: string
  /** Accent color */
  accent?: 'red' | 'green' | 'orange' | 'gold'
  /** Background image PNG depuis /public/og-bg/. Affichée à opacité ~0.22 par-dessus le noir */
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
 * Polices de marque MKR chargées dans Satori (next/og ne lit que TTF/OTF, pas woff2).
 *  - Teko 700 (titres display, condensé, c'est LA police des H1 du site)
 *  - Barlow Condensed 600 (eyebrow keywords, brand footer, tagline)
 *  - Barlow 500 (sous-titre / corps)
 *
 * Fichiers dans public/og-fonts/ (servis statiquement, OFL libre de redistribution),
 * lus via fs comme le logo et les bgImage. En cas d'échec (fichier absent en prod),
 * fallback gracieux sur la police par défaut au lieu d'un crash de rendu.
 */
type OgFont = { name: string; data: Buffer; weight: 500 | 600 | 700; style: 'normal' }
let fontCache: OgFont[] | null = null

async function loadFonts(): Promise<OgFont[]> {
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

/**
 * Génère une OG image 1200×630 PNG selon les principes UX/UI pro :
 *
 * Layout robuste en COLONNE FLEX (jamais d'absolu pour le contenu) :
 *  - Header (logo gauche + keywords droite) : hauteur fixe
 *  - Main (flex:1, centré) : titre énorme + sous-titre
 *  - Footer (brand + tagline) : hauteur fixe
 *  → le titre ne PEUT structurellement pas chevaucher le logo ni le footer,
 *    quelle que soit sa longueur (corrige le bug de superposition).
 *
 * Typographie de marque :
 *  - Title : Teko 700, uppercase, auto-scale 56-150px, line-height 1.0
 *  - Keywords / footer : Barlow Condensed 600, uppercase, tracking large
 *  - Subtitle : Barlow 500, line-height 1.4, préfixé d'une accent stripe
 *
 * Visual : photo de fond ~0.22, gradient sombre pour le contraste, halos accent,
 * stripe accent gauche, grain subtil. Hiérarchie : 1 focal point = le titre.
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
  const [logoDataUri, bgDataUri, fonts] = await Promise.all([
    readPublicAsset('/logo-white.png'),
    bgImage ? readPublicAsset(bgImage) : Promise.resolve(null),
    loadFonts(),
  ])
  const accentColor = ACCENT_MAP[accent]
  const tagline = locale === 'en' ? 'Immersion among champions' : "L'immersion au milieu des champions"

  const TEXT = '#FFFFFF'
  const MUTED = '#E4E4E4'

  // Auto-scale du titre tuné pour Teko (condensé → plus de chars par ligne)
  const len = title.length
  const titleSize =
    len <= 14 ? 150 :
    len <= 22 ? 126 :
    len <= 30 ? 106 :
    len <= 40 ? 90 :
    len <= 52 ? 76 :
    len <= 66 ? 64 : 56

  const eyebrow = keywords || label

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: '#050505',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'Barlow',
        }}
      >
        {/* --- Couches décoratives (absolues, derrière le contenu) --- */}
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
            backgroundImage: `linear-gradient(120deg, rgba(5,5,5,0.93) 0%, rgba(5,5,5,0.80) 38%, rgba(5,5,5,0.64) 66%, rgba(5,5,5,0.86) 100%)`,
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
            opacity: 0.1,
            display: 'flex',
          }}
        />

        {/* Stripe accent gauche */}
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

        {/* --- Contenu en colonne flex (au-dessus des décorations) --- */}
        <div
          style={{
            position: 'relative',
            zIndex: 20,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            paddingTop: 52,
            paddingBottom: 48,
            paddingLeft: 78,
            paddingRight: 80,
          }}
        >
          {/* Header : logo gauche + keywords droite */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {logoDataUri ? (
              <img src={logoDataUri} alt="MKR Caucasian Camp" width={194} height={117} />
            ) : (
              <div style={{ display: 'flex' }} />
            )}

            {eyebrow && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontFamily: 'Barlow Condensed',
                  fontWeight: 600,
                  fontSize: 23,
                  letterSpacing: '0.22em',
                  color: accentColor,
                  textTransform: 'uppercase',
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 2,
                    backgroundColor: accentColor,
                    marginRight: 14,
                    flexShrink: 0,
                    display: 'flex',
                  }}
                />
                {eyebrow}
              </div>
            )}
          </div>

          {/* Main : titre énorme + sous-titre, centré dans l'espace restant */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                fontFamily: 'Teko',
                fontWeight: 700,
                fontSize: titleSize,
                color: TEXT,
                lineHeight: 1.0,
                letterSpacing: '0.005em',
                textTransform: 'uppercase',
                maxWidth: 1040,
                textShadow: '0 2px 26px rgba(0,0,0,0.55)',
              }}
            >
              {title}
            </div>

            {subtitle && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginTop: 28,
                  maxWidth: 1000,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 3,
                    backgroundColor: accentColor,
                    marginRight: 20,
                    marginTop: 17,
                    flexShrink: 0,
                    display: 'flex',
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    fontFamily: 'Barlow',
                    fontWeight: 500,
                    fontSize: 28,
                    color: MUTED,
                    lineHeight: 1.4,
                  }}
                >
                  {subtitle}
                </div>
              </div>
            )}
          </div>

          {/* Footer : brand + tagline */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontFamily: 'Barlow Condensed',
                fontWeight: 600,
                fontSize: 23,
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
                fontFamily: 'Barlow Condensed',
                fontWeight: 600,
                fontSize: 18,
                letterSpacing: '0.2em',
                color: accentColor,
                textTransform: 'uppercase',
                display: 'flex',
              }}
            >
              {tagline}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts }
  )
}
