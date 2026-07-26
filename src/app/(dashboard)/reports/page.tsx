import ReportsClient from '@/components/reports/ReportsClient'
import { listActivities } from '@/server/reports'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const rows = await listActivities()
  return <ReportsClient rows={rows} />
}
