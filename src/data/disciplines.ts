export const DISCIPLINES = [
  'MMA',
  'Lutte Libre',
  'Lutte Gréco-Romaine',
  'Boxe Anglaise',
  'Kickboxing / K-1',
  'Muay Thaï',
  'Grappling / No-Gi',
  'Sambo',
  'Jiu-Jitsu Brésilien',
  'Judo',
  'Autre',
] as const

export type Discipline = (typeof DISCIPLINES)[number]
