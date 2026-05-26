# Design — Intégration vidéo verticale "Antoine parcours" sur la page MMA

**Date** : 2026-05-26
**Projet** : MKR Caucasian Camp (mkrcamp.com)
**Surfaces touchées** : `/programme/mma`, `/temoignages`, `/` (homepage)
**Source vidéo** : `Images Ruslan/Testimonie/VIDEO - Antoine parcous.mp4` (1080×1914, 54s, 104 MB)

## 1. Objectif

Ajouter sur la page `/programme/mma` une vidéo verticale qui montre les moments forts de l'entraînement MMA d'Antoine Petit-Jean (un ancien MKR) lors de son camp à Grozny. La vidéo doit donner un aperçu authentique et immersif de ce que vit un participant sur place. Réutiliser le même composant sur la page `/temoignages` (en featured) et sur la homepage (section autonome) pour maximiser l'exposition de cette preuve sociale visuelle.

## 2. Décisions validées par David

| Décision | Choix |
|---|---|
| Position sur `/programme/mma` | Juste après le `<PageHero>`, avant `<TldrBox>` |
| Format de présentation | Split layout : vidéo 9:16 à gauche + bloc storytelling à droite |
| Contenu bloc texte | « Ce que tu vas vivre » — label + titre + liste 4-5 moments + CTA |
| Encodage cible | Premium 1080×1920, ~15-25 MB (H.264 + WebM en parallèle) |
| Comportement | Autoplay mute + loop + clic son (UX Instagram-like) + clic expand → VideoModal plein écran |
| Usage | Triple : `/programme/mma` (principal) + `/temoignages` (featured) + homepage (section autonome) |
| Niveau d'exécution | UX/UI MAX — frame premium, micro-anims, timeline interactive sync vidéo |

## 3. Architecture du composant

### 3.1 Nouveau composant `<VerticalVideoSplit />`

Client component dans `src/components/VerticalVideoSplit.tsx` (~250 lignes avec animations).

**Justifications du nouveau composant** :
- Triple usage = duplication interdite
- Comportement complexe (IntersectionObserver + timeline sync + son toggle + modal)
- Pas mutualisable avec `CinematicReveal.tsx` (orientation paysage + pas de player)
- Cohabite avec `VideoModal.tsx` (réutilisé pour le fullscreen)

### 3.2 API (props)

```ts
interface VerticalVideoSplitProps {
  // Sources vidéo
  src: string                  // ex: '/videos/testimonials/antoine-parcours.mp4'
  webmSrc?: string             // ex: '/videos/testimonials/antoine-parcours.webm'
  poster: string               // ex: '/videos/testimonials/antoine-parcours-poster.jpg'
  duration: string             // ex: '0:54' (affiché en badge timestamp)

  // Badge identité (coin bottom-left vidéo)
  identityLabel: string        // ex: 'ANTOINE · MKR DE LA SESSION ÉTÉ'

  // Bloc texte
  label: string                // ex: 'APERÇU DE TON CAMP'
  title: string                // ex: 'CE QUE TU VAS VIVRE EN TCHÉTCHÉNIE'
  intro: string                // 1-2 phrases d'introduction
  moments: Array<{
    timestamp: string          // ex: '00:18'
    timeSeconds: number        // ex: 18 (pour video.currentTime)
    text: string               // ex: 'Travail de pads avec un coach Grozny'
  }>

  // CTAs
  primaryCta: { href: string; label: string }
  secondaryCta?: { href: string; label: string }  // ghost, optionnel

  // Layout
  videoOnLeft?: boolean        // défaut true. Alternance possible si on duplique sur d'autres pages
  ariaLabel?: string           // override accessibilité
}
```

### 3.3 Structure JSX (haut niveau)

```tsx
<section className="vvs-section" aria-label={ariaLabel || `Aperçu vidéo : ${title}`}>
  <div className="vvs-glow-orb" aria-hidden />
  <div className="inner">
    <div className={`vvs-grid ${videoOnLeft ? '' : 'vvs-grid--reverse'}`}>
      <div className="vvs-media">
        <div className="vvs-frame">
          <video
            ref={videoRef}
            className="vvs-video"
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={ariaLabel}
          >
            {webmSrc && <source src={webmSrc} type="video/webm" />}
            <source src={src} type="video/mp4" />
          </video>

          {/* Watermark logo top-right */}
          <img src="/logo-white.webp" className="vvs-watermark" alt="" aria-hidden />

          {/* Badge timestamp top-left */}
          <span className="vvs-timestamp">
            <Icon name="video" size={12} /> {duration}
          </span>

          {/* Pill identité bottom-left */}
          <span className="vvs-identity">
            <span className="vvs-identity-dot" aria-hidden /> {identityLabel}
          </span>

          {/* Bouton son */}
          <button
            type="button"
            className={`vvs-sound-btn ${isMuted ? '' : 'is-active'}`}
            onClick={toggleMute}
            aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
          >
            <Icon name={isMuted ? 'volume-x' : 'volume-2'} size={20} />
          </button>

          {/* Bouton expand */}
          <button
            type="button"
            className="vvs-expand-btn"
            onClick={() => setModalOpen(true)}
            aria-label="Voir en plein écran"
          >
            <Icon name="maximize" size={18} />
          </button>

          {/* Hint son (apparait 2s puis fade 4s plus tard) */}
          {showSoundHint && (
            <div className="vvs-sound-hint" aria-hidden>
              <Icon name="volume-2" size={14} /> ACTIVER LE SON
            </div>
          )}
        </div>
      </div>

      <div className="vvs-content">
        <span className="vvs-label">{label}</span>
        <h2 className="vvs-title">{title}</h2>
        <p className="vvs-intro">{intro}</p>

        <ol className="vvs-moments">
          {moments.map((m, i) => (
            <li
              key={m.timestamp}
              className={`vvs-moment-item ${activeMomentIndex === i ? 'is-active' : ''}`}
            >
              <button
                type="button"
                className="vvs-moment-btn"
                onClick={() => seekTo(m.timeSeconds)}
              >
                <span className="vvs-moment-dot" aria-hidden />
                <span className="vvs-moment-time">{m.timestamp}</span>
                <span className="vvs-moment-text">{m.text}</span>
              </button>
            </li>
          ))}
        </ol>

        <div className="vvs-cta-row">
          <Link href={primaryCta.href} className="btn-primary">
            {primaryCta.label} <Icon name="arrow-right" size={16} />
          </Link>
          {secondaryCta && (
            <Link href={secondaryCta.href} className="btn-ghost">
              {secondaryCta.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  </div>

  {/* Modal fullscreen */}
  <VideoModal
    src={modalOpen ? src : null}
    poster={poster}
    title={identityLabel}
    subtitle={title}
    onClose={() => setModalOpen(false)}
  />
</section>
```

### 3.4 Logique runtime

**IntersectionObserver (autoplay smart)** :
- Threshold 0.5 (50% visible)
- `entry.isIntersecting && entry.intersectionRatio >= 0.5` → `video.play()`
- Sinon → `video.pause()`
- Cleanup au unmount

**Sync timeline ↔ vidéo** (active moment) :
- `video.addEventListener('timeupdate', ...)` (throttle à 250ms pour économiser)
- `activeMomentIndex` = index du dernier moment dont `timeSeconds <= video.currentTime`
- Highlight visuel sur la ligne active : background `var(--primary)/8`, dot orange plein, time orange
- Progress line entre les dots se remplit en orange jusqu'à l'item actif

**Seek to moment** :
- `video.currentTime = timeSeconds`
- `video.play()` (au cas où l'utilisateur a cliqué pendant pause)
- Si vidéo encore muted : on garde mute (ne pas surprendre l'utilisateur avec du son non sollicité)

**Toggle son** :
- `video.muted = !video.muted`
- `setIsMuted(video.muted)`
- Si on active le son et `prefers-reduced-motion` actif, ne pas lancer la pulse animation

**Hint son (auto-disparait)** :
- Apparait 2s après le mount si `isMuted === true`
- Disparait 4s plus tard, OU au premier hover/clic sur la zone vidéo, OU si le son est activé
- N'apparait jamais si `prefers-reduced-motion` est actif

**Modal fullscreen** :
- État local `modalOpen`
- Réutilise `VideoModal.tsx` existant (déjà géré scroll-lock, ESC, focus)
- Pendant que le modal est ouvert, la vidéo de fond reste pause (évite la double lecture)

**Reduced motion** :
- Pas d'animation d'entrée (clip-path, stagger)
- Pas d'autoplay → poster + bouton play central visible (variant `is-reduced`)
- Pas de hint son animé
- Boutons : pas de scale/glow hover, juste opacity

## 4. Assets vidéo à produire

### 4.1 Fichiers cibles dans `nextjs/public/videos/testimonials/`

| Fichier | Format | Specs | Poids cible |
|---|---|---|---|
| `antoine-parcours.mp4` | H.264 baseline | 1080×1920, CRF 24, AAC 128k, faststart | ~18-22 MB |
| `antoine-parcours.webm` | VP9 | 1080×1920, CRF 32, Opus 96k | ~12-16 MB |
| `antoine-parcours-poster.jpg` | JPEG | 1080×1920, q85, frame à 1s | ~80-150 KB |

### 4.2 Commandes ffmpeg

```bash
SRC="/Users/davidkhazaei/Documents/Client/DKDP.ch/CLAUDE RESSOURCES/DEV SPACE/clients Claude/MKR caucasian camp/Images Ruslan/Testimonie/VIDEO - Antoine parcous.mp4"
DST="/Users/davidkhazaei/Documents/Client/DKDP.ch/CLAUDE RESSOURCES/DEV SPACE/clients Claude/MKR caucasian camp/nextjs/public/videos/testimonials"

# MP4 H.264 (Safari/iOS principalement)
ffmpeg -i "$SRC" -vf "crop=1080:1920" -c:v libx264 -preset slow -crf 24 \
  -c:a aac -b:a 128k -movflags +faststart "$DST/antoine-parcours.mp4"

# WebM VP9 (Chrome/Firefox principalement)
ffmpeg -i "$SRC" -vf "crop=1080:1920" -c:v libvpx-vp9 -crf 32 -b:v 0 \
  -c:a libopus -b:a 96k "$DST/antoine-parcours.webm"

# Poster JPG (frame à 1s)
ffmpeg -ss 1 -i "$SRC" -vframes 1 -vf "crop=1080:1920" -q:v 4 \
  "$DST/antoine-parcours-poster.jpg"
```

**Note crop** : source 1080×1914, crop centré vers 1080×1920 perd 3px haut + 3px bas (invisible). Le filtre `crop=1080:1920` peut générer une erreur si la source est plus petite que la cible. Si c'est le cas, fallback : `pad=1080:1920:0:3:black` (padding noir 3px haut/bas, imperceptible).

### 4.3 Validation à faire après encodage

1. Tailles fichiers dans la cible (>30 MB = rejet)
2. Visionner le poster : aucune information critique coupée par le crop
3. Compatibilité : tester lecture sur Safari macOS, Chrome desktop, iOS Safari (autoplay mute crucial)
4. Tester avec connexion throttlée Slow 4G dans Chrome DevTools : la vidéo doit start dans ≤3s

## 5. Intégrations sur les 3 surfaces

### 5.1 `/programme/mma` (placement principal)

Fichier : `src/app/(site)/programme/mma/page.tsx`

Insertion entre `<PageHero>` et `<div className="inner"><TldrBox ... /></div>` :

```tsx
<VerticalVideoSplit
  src="/videos/testimonials/antoine-parcours.mp4"
  webmSrc="/videos/testimonials/antoine-parcours.webm"
  poster="/videos/testimonials/antoine-parcours-poster.jpg"
  duration="0:54"
  identityLabel="ANTOINE · MKR DE LA SESSION ÉTÉ"
  label="APERÇU DE TON CAMP"
  title="CE QUE TU VAS VIVRE EN TCHÉTCHÉNIE"
  intro="Antoine, MKR de la session précédente, a filmé ses moments forts à Grozny. 54 secondes pour comprendre ce qu'est un camp MMA dans l'écurie Akhmat."
  moments={[
    { timestamp: '00:06', timeSeconds: 6,  text: 'Sparring avec un combattant Akhmat' },
    { timestamp: '00:18', timeSeconds: 18, text: 'Travail de pads avec un coach Grozny' },
    { timestamp: '00:31', timeSeconds: 31, text: 'Drills clinch dans la salle principale' },
    { timestamp: '00:42', timeSeconds: 42, text: 'Débrief technique individuel' },
    { timestamp: '00:50', timeSeconds: 50, text: 'Vie au camp · hors tapis' },
  ]}
  primaryCta={{ href: '/inscription?type=session', label: 'POSTULER · MMA TCHÉTCHÉNIE' }}
/>
```

**Note timestamps** : les valeurs 06/18/31/42/50 sont indicatives. À ajuster après avoir visionné la vidéo encodée pour matcher les moments réels du montage.

### 5.2 `/temoignages` (featured au-dessus de la grid)

Fichier : `src/app/(site)/temoignages/page.tsx`

Insertion avant le `<VideoTestimonialsGrid />` existant (qui reste, mais devient une section secondaire) :

```tsx
<VerticalVideoSplit
  src="/videos/testimonials/antoine-parcours.mp4"
  webmSrc="/videos/testimonials/antoine-parcours.webm"
  poster="/videos/testimonials/antoine-parcours-poster.jpg"
  duration="0:54"
  identityLabel="ANTOINE · MKR DE LA SESSION ÉTÉ"
  label="EN VIDÉO"
  title="LE CAMP D'ANTOINE EN 54 SECONDES"
  intro="Antoine a filmé ses moments forts en Tchétchénie. Sparring, technique, débrief, vie au camp."
  moments={[ /* mêmes que mma */ ]}
  primaryCta={{ href: '/inscription?type=session', label: 'POSTULER À UN CAMP' }}
  secondaryCta={{ href: '/programme/mma', label: 'VOIR LE PROGRAMME MMA' }}
/>
```

Puis ajouter un séparateur visuel + label "AUTRES TÉMOIGNAGES" avant la grid existante (interview Antoine + LAMP), pour bien distinguer le featured (montage cinématique) des testimonials parlés (interviews).

### 5.3 Homepage (section autonome)

Fichier : `src/app/(site)/page.tsx`

Insertion entre `<Testimonials />` et `<VoyageReveal />` (sous le carousel de témoignages, avant le voyage). Même copy que `/temoignages` (LE CAMP D'ANTOINE EN 54 SECONDES) avec CTA secondaire `/programme/mma`.

Dynamic import pour éviter d'alourdir le first paint :

```tsx
const VerticalVideoSplit = dynamic(() => import('@/components/VerticalVideoSplit'), {
  loading: () => <div style={{ minHeight: 600 }} />,
})
```

Pas dans le carousel `Testimonials.tsx` (incompatible avec le format split).

## 6. UX/UI MAX — Détails d'exécution

### 6.1 Frame vidéo (composition premium)

- Border-radius : `16px` desktop / `12px` mobile
- Border : `1px solid rgba(255, 255, 255, 0.08)`
- Box-shadow 3 couches :
  ```css
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.25),                      /* ambient */
    0 24px 48px -12px rgba(0, 0, 0, 0.55),              /* key */
    0 0 80px -20px var(--primary);                      /* spot orange MKR */
  ```
- Overlay gradient top + bottom : `rgba(0, 0, 0, 0.35)` 0% → `transparent` 25% (ancre les overlays sans assombrir l'action)
- Halo orange backdrop : élément `.vvs-glow-orb` en `position: absolute`, `filter: blur(80px)`, `opacity: 0.18`, `background: var(--primary)`, pulse 6s `ease-in-out infinite alternate`. Pas affiché sur mobile (perf).

### 6.2 Overlays vidéo

**Watermark logo MKR** (top-right) :
- `<img src="/logo-white.webp">` 28×28, `opacity: 0.55`, `mix-blend-mode: screen`
- Aucune action, decoratif

**Timestamp badge** (top-left) :
- Background `rgba(0, 0, 0, 0.55)`, `backdrop-filter: blur(8px)`
- Border-radius `8px`, padding `4px 8px`
- Font monospace, `0.75rem`, `letter-spacing: 0.05em`, blanc
- Icône `video` 12px

**Pill identité** (bottom-left) :
- Background `rgba(0, 0, 0, 0.55)`, `backdrop-filter: blur(8px)`
- Border-radius `999px`, padding `6px 12px`
- Font `0.7rem`, `letter-spacing: 0.15em`, uppercase, blanc
- Dot rouge 6px avec animation `pulse-dot` 1.5s `ease-in-out infinite`

**Bouton son** (bottom-right) :
- Diamètre 48px desktop, 44px mobile
- Glassmorphism : `backdrop-filter: blur(14px)`, `background: rgba(20, 20, 20, 0.45)`, `border: 1px solid rgba(255, 255, 255, 0.12)`
- Hover desktop : `scale(1.08)`, `box-shadow: 0 0 24px var(--primary)`, transition 0.25s `cubic-bezier(0.4, 0, 0.2, 1)`
- State `is-active` (son ON) : `background: var(--primary)`, icône blanche, micro-pulse 2s infinite
- Tooltip au hover desktop : "Activer le son" / "Couper le son", fade-in 0.15s, position au-dessus

**Bouton expand** (top-right, sous le watermark) :
- Mêmes styles que sound button, taille 44px desktop / 40px mobile
- Tooltip "Voir en plein écran"

**Hint son** (badge animé bottom-center, conditionnel) :
- Apparait 2s après le mount, disparait 4s après l'apparition (ou interaction)
- Slide-up + fade-in 0.4s `cubic-bezier(0.16, 1, 0.3, 1)`
- Background `var(--primary)`, `color: #fff`, padding `8px 14px`, border-radius `999px`
- Font `0.7rem`, `letter-spacing: 0.12em`, uppercase, semi-bold
- Icône volume-2 14px à gauche
- N'apparait jamais si `prefers-reduced-motion` ou si son déjà activé

### 6.3 Animations d'entrée (IntersectionObserver à 30%)

Séquence orchestrée :
1. **Frame vidéo** : `clip-path: inset(8% 8% 8% 8%)` → `inset(0)`, 0.9s `cubic-bezier(0.65, 0, 0.35, 1)`
2. **Halo orange** : `opacity: 0` → `0.18`, 1.5s, delay 0.4s
3. **Bloc texte** : 5 éléments en stagger 80ms (label → titre → intro → moments → cta), `translateY(16px) opacity: 0` → `translateY(0) opacity: 1`, 0.55s chacun

Toutes les animations désactivées si `prefers-reduced-motion: reduce`.

### 6.4 Timeline interactive moments

Layout vertical desktop :

```
●─── 00:06   Sparring avec un combattant Akhmat
│
●─── 00:18   Travail de pads avec un coach Grozny
│
●─── 00:31   Drills clinch dans la salle principale
│
●─── 00:42   Débrief technique individuel
│
●─── 00:50   Vie au camp · hors tapis
```

- Chaque ligne est un `<button>` accessible (focus visible, keyboard nav)
- Dot 10px : `border: 2px solid var(--border)`, state inactive
- Dot active : `background: var(--primary)`, glow halo 4px
- Ligne verticale entre dots : `var(--border)`, qui se remplit en orange jusqu'au moment courant (gradient computed via `--progress` CSS variable)
- Timestamp : font monospace, 0.85rem, color `var(--text-muted)`. Active = `var(--primary)`
- Texte moment : sans-serif 1rem, color `var(--text-secondary)`. Active = `var(--text-primary)` + weight 600
- Hover : background `rgba(255, 255, 255, 0.03)`, transition 0.2s

Mobile (≤880px) :
- Conversion en row de chips horizontaux scrollables (`overflow-x: auto`, `scroll-snap-type: x mandatory`)
- Chaque chip : `padding: 8px 14px`, border-radius `999px`, border `var(--border)`
- Active : `background: var(--primary)`, color `#fff`

### 6.5 Typographie côté texte

- **Label** : `letter-spacing: 0.2em`, `font-size: 0.75rem`, `color: var(--primary)`, `text-transform: uppercase`. Souligné par un trait 24px sous le label : `::after { content: ''; display: block; width: 24px; height: 2px; background: var(--primary); margin-top: 8px; }`
- **Titre h2** : `font-size: clamp(1.75rem, 3.5vw, 2.5rem)`, `text-wrap: balance`, `line-height: 1.05`, `font-weight: 800`, `text-transform: uppercase`, `letter-spacing: -0.01em`. Mots "EN TCHÉTCHÉNIE" en italique fine (effet éditorial)
- **Intro** : `font-size: 1.05rem`, `color: var(--text-secondary)`, `max-width: 42ch`, `line-height: 1.55`
- **CTA primary** : pas full-width, largeur naturelle. Icône `arrow-right` après le label, micro-translation `translateX(4px)` au hover
- **CTA secondary** : `btn-ghost`, sous le primary sur desktop ou à côté selon largeur

### 6.6 Fond & couleurs section

- Section background : `var(--surface-lowest)` (jamais noir pur — respecte la règle globale "no black bg")
- Frame vidéo backdrop subtil : gradient `var(--surface-low)` → `var(--surface-lowest)` 45°
- Contraste vient du framing et du halo orange, pas d'une couleur de fond agressive

### 6.7 Fallbacks & edge cases

**Erreur de chargement vidéo** : event `error` sur `<video>` → switch sur state `videoError`, affiche poster + bouton play central qui ouvre directement la `VideoModal` plein écran.

**Loading >300ms** : skeleton shimmer sur le frame (gradient diagonal qui balaie en 1.4s loop), pas un spinner standard.

**Autoplay bloqué** (rare, mais possible si user a désactivé autoplay dans les settings navigateur) : event `play()` rejected → on affiche le poster + bouton play central comme en mode reduced-motion.

**Première interaction utilisateur** : si l'utilisateur clique n'importe où dans la zone vidéo (hors bouton expand), on toggle simplement le son (raccourci UX intuitif). Le bouton son reste visible et fonctionnel comme alternative explicite.

### 6.8 Mobile (≤880px)

- Grid passe en 1 col (vidéo en haut, texte en bas)
- Vidéo `max-height: 70vh`, `max-width: 100%`, conserve l'aspect 9:16
- Pas de halo orange (perf + propreté)
- Pas de scroll hint
- Boutons overlay légèrement plus gros (44px → zone tactile WCAG)
- Timeline moments en chips horizontaux scrollables (cf. 6.4)
- Tooltips désactivées (pas pertinent en touch)

## 7. CSS — Architecture

Tout dans `src/app/globals.css` sous une nouvelle section commentée :

```css
/* ============================================================
   Vertical Video Split (composant /components/VerticalVideoSplit.tsx)
   Utilisé sur /programme/mma, /temoignages, et homepage
   ============================================================ */
```

Classes (toutes préfixées `vvs-` pour éviter les collisions) :
- Structure : `.vvs-section`, `.vvs-grid`, `.vvs-grid--reverse`, `.vvs-media`, `.vvs-frame`, `.vvs-content`
- Overlays : `.vvs-watermark`, `.vvs-timestamp`, `.vvs-identity`, `.vvs-identity-dot`, `.vvs-sound-btn`, `.vvs-expand-btn`, `.vvs-sound-hint`, `.vvs-glow-orb`
- Texte : `.vvs-label`, `.vvs-title`, `.vvs-intro`, `.vvs-cta-row`
- Timeline : `.vvs-moments`, `.vvs-moment-item`, `.vvs-moment-btn`, `.vvs-moment-dot`, `.vvs-moment-time`, `.vvs-moment-text`, `is-active`
- États : `.is-active`, `.is-reduced`, `.is-loading`, `.has-error`
- Keyframes : `@keyframes vvs-pulse-dot`, `vvs-pulse-sound`, `vvs-glow-pulse`, `vvs-shimmer`, `vvs-reveal-frame`

## 8. Propagation SITEMAP.md

Mise à jour de `nextjs/SITEMAP.md` :

1. **Section "🥊 `/programme/mma`"** → ajout du `<VerticalVideoSplit>` dans la liste des sections (position 2, juste après PageHero, avant TldrBox)
2. **Section "💬 `/temoignages`"** → mention featured video au-dessus de la grid
3. **Section "🏠 `/` Homepage"** → ajout de `<VerticalVideoSplit>` entre Testimonials et VoyageReveal dans l'ordre des sections (devient section #6 sur 13)
4. **§6 "Où changer X ?"** → nouvelle ligne :
   > **Vidéo Antoine parcours** | `src/components/VerticalVideoSplit.tsx` (composant) + `src/app/(site)/programme/mma/page.tsx` + `src/app/(site)/temoignages/page.tsx` + `src/app/(site)/page.tsx` (props sur 3 surfaces) + `public/videos/testimonials/antoine-parcours.{mp4,webm,jpg}` (assets)
5. **§6bis Propagation Map** → nouvelle sous-section :
   > **Vidéo Antoine parcours (54s, vertical 9:16)** — Composant `VerticalVideoSplit.tsx` utilisé sur 3 surfaces. Si on change la copy (label/titre/intro/moments), modifier les 3 endroits.

## 9. Tests d'acceptance

Avant de marquer l'implémentation comme complete :

1. **Autoplay iOS Safari** : la vidéo se lance bien autoplay mute sur iPhone (test physique ou simulateur)
2. **Toggle son** : 1 clic suffit pour activer le son, pas de double-tap requis
3. **IntersectionObserver pause** : scroll hors viewport pause la vidéo, scroll back relance (vérifier dans DevTools Performance que `play/pause` events firent bien)
4. **Sync timeline** : clic sur un moment → vidéo jump au bon timestamp + le moment correspondant est highlighted
5. **Modal fullscreen** : clic expand ouvre VideoModal, scroll-lock OK, ESC ferme, focus revient au bouton expand
6. **Lighthouse mobile Slow-4G** sur `/programme/mma` : score perf médiane 3 runs ≥85 (ne pas régresser, baseline actuelle à mesurer en pre-impl)
7. **`prefers-reduced-motion: reduce`** : aucune animation (pas de clip-path reveal, pas de stagger, pas de pulse, pas de hint), juste fade opacity sur les états
8. **Accessibilité keyboard** : Tab navigue sur sound → expand → moments → CTAs. Espace/Enter active les boutons. Focus visible (outline 2px blanc)
9. **Fallback erreur vidéo** : couper temporairement les sources dans DevTools → poster + bouton play central visible, clic ouvre modal directement
10. **3 surfaces validées** : la vidéo se comporte identiquement sur `/programme/mma`, `/temoignages`, et `/` (mais avec copy différente)

## 10. Liste de fichiers touchés

### Création
- `src/components/VerticalVideoSplit.tsx` (~250 lignes)
- `public/videos/testimonials/antoine-parcours.mp4`
- `public/videos/testimonials/antoine-parcours.webm`
- `public/videos/testimonials/antoine-parcours-poster.jpg`

### Modification
- `src/app/(site)/programme/mma/page.tsx` (insertion après PageHero)
- `src/app/(site)/temoignages/page.tsx` (insertion featured avant grid existante)
- `src/app/(site)/page.tsx` (insertion entre Testimonials et VoyageReveal)
- `src/app/globals.css` (~200 lignes CSS dans nouvelle section)
- `SITEMAP.md` (4 mises à jour : 2 sections + §6 + §6bis)

### Pas modifié
- `src/components/VideoModal.tsx` : réutilisé tel quel (props compatibles)
- `src/components/Icon.tsx` : on vérifie juste que les icônes `video`, `volume-x`, `volume-2`, `maximize`, `arrow-right` sont dispo

## 11. Hors scope (à reconsidérer plus tard)

- Sous-titres WebVTT FR/EN (la vidéo n'a pas de paroles dans cette version)
- Analytics (events tracking play/sound-on/expand/moment-click) — à ajouter si Plausible/Umami branché
- Schema.org `VideoObject` JSON-LD (pertinent pour SEO YouTube-like, mais peut être ajouté en V2 avec thumbnailUrl + uploadDate + duration ISO8601)
- Préchargement intelligent : `<link rel="preload" as="video">` sur la home si la vidéo est below the fold (non, on garde lazy)
- Variation "video on right" pour alternance visuelle si on en ajoute d'autres
- Version compacte (vidéo + juste un titre + bouton, sans timeline) si on veut un format plus dense ailleurs
