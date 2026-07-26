import PageHeader from '@/components/common/PageHeader'
import CariFunnelReport from '@/components/reports/CariFunnelReport'
import CompanyBreakdown from '@/components/reports/CompanyBreakdown'
import ReportExport from '@/components/reports/ReportExport'
import ReportsClient from '@/components/reports/ReportsClient'
import { getReportData, listActivities } from '@/server/reports'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const [reportData, activities] = await Promise.all([getReportData(), listActivities()])
  return (
    <>
      <PageHeader
        title="Raporlar"
        subtitle="Satış hunisi, şirket kırılımı ve sistem hareketleri; PDF/CSV dışa aktarım"
        action={<ReportExport data={reportData} />}
      />
      <CariFunnelReport data={reportData.funnel} />
      <CompanyBreakdown rows={reportData.companies} />
      <ReportsClient rows={activities} />
    </>
  )
}
