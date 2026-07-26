import CompaniesClient from '@/components/companies/CompaniesClient'
import { listCompanies } from '@/server/companies'
import { getSessionUser } from '@/lib/authz'
import { hasRole } from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export default async function CompaniesPage() {
  const [rows, user] = await Promise.all([listCompanies(), getSessionUser()])
  return <CompaniesClient rows={rows} canManage={hasRole(user?.role, 'ADMIN')} />
}
