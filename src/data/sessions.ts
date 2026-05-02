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
  destination: 'Dagestan'
}

export const SESSIONS: Session[] = [
  {
    id: 'aout-2026',
    season: 'Été',
    seasonLabel: 'Session Été · Août 2026',
    label: 'AOÛT 2026',
    name: 'CAMP DAGHESTANAIS',
    monthAbbr: 'AOÛ',
    dates: '17 Août - 5 Septembre',
    datesFull: '17 AOÛT · 5 SEPTEMBRE 2026',
    startDate: '2026-08-17',
    endDate: '2026-09-05',
    price: 2900,
    priceCurrency: 'EUR',
    maxCapacity: 15,
    spotsLabel: 'Places disponibles',
    status: 'open',
    intensity: 'Maximale',
    duration: '3 semaines',
    destination: 'Dagestan',
  },
]

export function formatPrice(session: Session): string {
  const symbol = session.priceCurrency === 'EUR' ? '€' : session.priceCurrency
  return `${session.price.toLocaleString('fr-FR')} ${symbol}`
}

export function sessionFormLabel(session: Session): string {
  return `${session.season} 2026 (${session.dates})`
}
