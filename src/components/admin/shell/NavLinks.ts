// Sections de l'admin et leur place dans la navigation :
// - barre laterale (>= 1024 px) : toutes, dans cet ordre ;
// - mobile (< 1024 px) : `bar` dans la barre du bas, `more` dans le panneau "Plus".
// Module neutre (ni serveur ni client) : lu par Sidebar, BottomNav et MoreSheet.

import type { IconName } from '@/components/admin/ui/Icon'

export type AdminSection = 'queue' | 'candidatures' | 'sessions' | 'partenaires' | 'leads'

export const NAV_ITEMS: { key: AdminSection; label: string; href: string; icon: IconName; mobile: 'bar' | 'more' }[] = [
  { key: 'queue', label: 'À faire', href: '/admin', icon: 'home', mobile: 'bar' },
  { key: 'candidatures', label: 'Candidatures', href: '/admin/inscriptions', icon: 'users', mobile: 'bar' },
  { key: 'sessions', label: 'Sessions', href: '/admin/sessions', icon: 'calendar-days', mobile: 'bar' },
  { key: 'partenaires', label: 'Partenaires', href: '/admin/referrals', icon: 'handshake', mobile: 'more' },
  { key: 'leads', label: 'Leads guide', href: '/admin/guide-leads', icon: 'download', mobile: 'more' },
]

export const BAR_ITEMS = NAV_ITEMS.filter((item) => item.mobile === 'bar')
export const MORE_ITEMS = NAV_ITEMS.filter((item) => item.mobile === 'more')
