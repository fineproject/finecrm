import PageHeader from '@/components/common/PageHeader'
import CariFunnelReport from '@/components/reports/CariFunnelReport'
import ReportsClient from '@/components/reports/ReportsClient'
import { getCariFunnelReport, listActivities } from '@/server/reports'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const [rows, funnel] = await Promise.all([listActivities(), getCariFunnelReport()])
  return (
    <>
      <PageHeader title="Raporlar" subtitle="Satış hunisi ve sistem hareketleri; dönemsel özetler" />
      <CariFunnelReport data={funnel} />
      <ReportsClient rows={rows} />
    </>
  )
}
