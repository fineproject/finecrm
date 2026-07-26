import AppShell from '@/components/layout/AppShell'
import { unreadCount } from '@/server/notifications'
import { auth } from '@/auth'
import { USER_ROLE } from '@/lib/labels'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // Veritabanı erişilemezse bile kabuk render olsun diye korumalı sorgu
  let unread = 0
  try {
    unread = await unreadCount()
  } catch {
    unread = 0
  }

  const user = session?.user
    ? {
        name: session.user.name ?? 'Kullanıcı',
        email: session.user.email ?? '',
        roleLabel: USER_ROLE[session.user.role].label,
        role: session.user.role,
      }
    : null

  return (
    <AppShell unreadCount={unread} user={user}>
      {children}
    </AppShell>
  )
}
