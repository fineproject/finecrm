import CompaniesClient from '@/components/companies/CompaniesClient'
import { listCompanies } from '@/server/companies'

export const dynamic = 'force-dynamic'

export default async function CompaniesPage() {
  const rows = await listCompanies()
  return <CompaniesClient rows={rows} />
}
