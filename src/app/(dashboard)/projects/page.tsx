import ProjectsClient from '@/components/projects/ProjectsClient'
import { listProjects } from '@/server/projects'
import { companyOptions } from '@/server/companies'
import { getSessionUser } from '@/lib/authz'
import { hasRole } from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const [rows, companies, user] = await Promise.all([
    listProjects(),
    companyOptions(),
    getSessionUser(),
  ])
  return (
    <ProjectsClient rows={rows} companies={companies} canManage={hasRole(user?.role, 'MANAGER')} />
  )
}
