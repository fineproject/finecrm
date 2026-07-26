import NotificationsClient from '@/components/notifications/NotificationsClient'
import { listNotifications } from '@/server/notifications'

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const rows = await listNotifications()
  return <NotificationsClient rows={rows} />
}
