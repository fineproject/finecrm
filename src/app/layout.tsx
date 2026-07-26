import type { Metadata } from 'next'
import ThemeRegistry from '@/theme/ThemeRegistry'
import './globals.css'

export const metadata: Metadata = {
  title: 'FineCRM — Şirket, Proje & Cari Yönetimi',
  description:
    'Next.js + MUI + Prisma ile şirket, proje, cari ve aşama takibi; raporlama ve bildirim altyapısı.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  )
}
