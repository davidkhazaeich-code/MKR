export type SessionStatus = 'open' | 'limited' | 'closed'

export interface Session {
  id: string
  season: string
  seasonLabel: string
  label: string
  name: string
  monthAbbr: string
  dates: string
  datesFull: string
  startDate: string
  endDate: string
  price: number
  priceCurrency: string
  maxCapacity: number
  spotsLabel: string
  status: SessionStatus
  intensity: string
  duration: string
  destination: 'Dagestan' | 'Tchétchénie'
}

export const SESSIONS: Session[] = [
  {
    id: 'printemps-2026',
    season: 'Printemps',
    seasonLabel: 'Session Printemps · Avril 2026',
    label: 'PRINTEMPS 2026',
    name: 'PRINTEMPS GÉORGIEN',
    monthAbbr: 'AVR',
    dates: '15 Avril - 6 Mai',
    datesFull: '15 AVRIL · 6 MAI 2026',
    startDate: '2026-04-15',
    endDate: '2026-05-06',
    price: 2900,
    priceCurrency: 'CHF',
    maxCapacity: 14,
    spotsLabel: '4 places restantes',
    status: 'open',
    intensity: 'Élevée',
    duration: '3 semaines',
    destination: 'Dagestan',
  },
  {
    id: 'ete-2026',
    season: 'Été',
    seasonLabel: 'Session Été · Juillet 2026',
    label: 'ÉTÉ 2026',
    name: "ASSAUT D'ÉTÉ",
    monthAbbr: 'JUL',
    dates: '8 Juillet - 29 Juillet',
    datesFull: '8 JUILLET · 29 JUILLET 2026',
    startDate: '2026-07-08',
    endDate: '2026-07-29',
    price: 3200,
    priceCurrency: 'CHF',
    maxCapacity: 12,
    spotsLabel: '12 places restantes',
    status: 'open',
    intensity: 'Maximale',
    duration: '3 semaines',
    destination: 'Tchétchénie',
  },
  {
    id: 'automne-2026',
    season: 'Automne',
    seasonLabel: 'Session Automne · Septembre 2026',
    label: 'AUTOMNE 2026',
    name: "SOMMET D'AUTOMNE",
    monthAbbr: 'SEP',
    dates: '16 Sept. - 7 Oct.',
    datesFull: '16 SEPT · 7 OCTOBRE 2026',
    startDate: '2026-09-16',
    endDate: '2026-10-07',
    price: 2750,
    priceCurrency: 'CHF',
    maxCapacity: 15,
    spotsLabel: 'Places limitées',
    status: 'limited',
    intensity: 'Élevée',
    duration: '3 semaines',
    destination: 'Dagestan',
  },
]

export function formatPrice(session: Session): string {
  return `${session.price.toLocaleString('fr-CH')} ${session.priceCurrency}`
}

export function sessionFormLabel(session: Session): string {
  return `${session.season} 2026 (${session.dates})`
}
