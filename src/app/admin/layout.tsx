import type { Metadata, Viewport } from 'next'
import { ToastProvider } from '@/components/admin/ui/Toast'
import './admin.css'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0a0b',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="adm-root">
      <ToastProvider>{children}</ToastProvider>
    </div>
  )
}
