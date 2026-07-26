import Alert from '@mui/material/Alert'
import PageHeader from '@/components/common/PageHeader'
import AuditClient from '@/components/audit/AuditClient'
import { listActivities } from '@/server/reports'
import { getSessionUser } from '@/lib/authz'
import { hasRole } from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export default async function AuditPage() {
  const user = await getSessionUser()
  if (!hasRole(user?.role, 'ADMIN')) {
    return (
      <>
        <PageHeader title="Denetim (Audit)" />
        <Alert severity="warning">Bu sayfayı görüntülemek için yönetici yetkisi gerekir.</Alert>
      </>
    )
  }
  const rows = await listActivities()
  return <AuditClient rows={rows} />
}
