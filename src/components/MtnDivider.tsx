interface Props {
  fillColor: string
  bgColor: string
  viewBox?: string
  points?: string
}

// bgColor  = background of the PRECEDING section (fills the area above the peaks)
// fillColor = background of the FOLLOWING section (the mountain polygon color)
export default function MtnDivider({ fillColor, bgColor, viewBox, points }: Props) {
  const vb = viewBox ?? '0 0 1440 80'
  const pts =
    points ??
    '0,80 0,55 55,42 120,56 195,34 265,50 330,24 385,42 435,14 480,32 520,8 552,26 578,4 600,20 622,0 645,16 668,2 692,18 718,6 745,22 775,8 812,28 855,12 905,34 960,18 1020,40 1080,24 1140,46 1200,32 1260,52 1325,38 1390,58 1440,46 1440,80'

  return (
    <div className="mtn-divider" aria-hidden="true" style={{ background: bgColor }}>
      <svg
        viewBox={vb}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon fill={fillColor} points={pts} />
      </svg>
    </div>
  )
}
