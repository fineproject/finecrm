import AppShell from '@/components/layout/AppShell'
import { unreadCount } from '@/server/notifications'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Veritabanı erişilemezse bile kabuk render olsun diye korumalı sorgu
  let unread = 0
  try {
    unread = await unreadCount()
  } catch {
    unread = 0
  }

  return <AppShell unreadCount={unread}>{children}</AppShell>
}
