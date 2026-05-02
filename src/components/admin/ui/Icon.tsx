// SVG icons inline cohérentes (Lucide-like, stroke 2).
// Pas d'emojis pour les éléments fonctionnels.

type IconName =
  | 'search'
  | 'check'
  | 'x'
  | 'arrow-left'
  | 'phone'
  | 'mail'
  | 'whatsapp'
  | 'log-out'
  | 'inbox'
  | 'alert-triangle'
  | 'clock'
  | 'euro'
  | 'check-circle'
  | 'rotate-ccw'
  | 'pause'
  | 'sparkles'
  | 'history'
  | 'edit'

const PATHS: Record<IconName, React.ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3-3" />
    </>
  ),
  check: <path d="M5 13l4 4L19 7" />,
  x: (
    <>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </>
  ),
  'arrow-left': (
    <>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </>
  ),
  phone: (
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  ),
  mail: (
    <>
      <path d="M2 4h20v16H2z" />
      <path d="m22 6-10 7L2 6" />
    </>
  ),
  whatsapp: (
    <path d="M3.516 3.515a11.952 11.952 0 0 1 17.014 16.7l1.47 5.285-5.285-1.47A11.952 11.952 0 0 1 3.516 3.515zm5.06 5.215c-.13.298-.504.95-.504 1.62 0 .67.51 1.337.71 1.55a8 8 0 0 0 4.297 3.067c.595.166.992.156 1.36-.067.396-.225.62-.49.81-.79.19-.3.19-.59.13-.79-.06-.2-.27-.32-.55-.46-.28-.14-1.6-.79-1.85-.88-.25-.09-.43-.13-.61.13-.18.26-.7.88-.85 1.05-.16.18-.31.2-.59.07-.28-.13-1.18-.43-2.24-1.39-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.29-.34.43-.51.14-.17.18-.29.27-.48.09-.18.05-.34-.02-.48-.07-.13-.62-1.49-.85-2.04-.22-.53-.45-.46-.62-.46l-.53-.01c-.18 0-.49.07-.74.34-.25.27-.97.95-.97 2.31 0 1.36 1 2.68 1.13 2.86z" fillRule="evenodd" clipRule="evenodd" />
  ),
  'log-out': (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </>
  ),
  inbox: (
    <>
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </>
  ),
  'alert-triangle': (
    <>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z" />
      <line x1="12" x2="12" y1="9" y2="13" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </>
  ),
  euro: (
    <>
      <path d="M4 10h12" />
      <path d="M4 14h9" />
      <path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2" />
    </>
  ),
  'check-circle': (
    <>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </>
  ),
  'rotate-ccw': (
    <>
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </>
  ),
  pause: (
    <>
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3v18" />
      <path d="M3 12h18" />
      <path d="m18.36 5.64-12.72 12.72" />
      <path d="m5.64 5.64 12.72 12.72" />
    </>
  ),
  history: (
    <>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </>
  ),
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </>
  ),
}

interface Props {
  name: IconName
  size?: number
  strokeWidth?: number
  className?: string
}

export default function Icon({ name, size = 16, strokeWidth = 2, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}
