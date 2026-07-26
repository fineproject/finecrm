import ProjectsClient from '@/components/projects/ProjectsClient'
import { listProjects } from '@/server/projects'
import { companyOptions } from '@/server/companies'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const [rows, companies] = await Promise.all([listProjects(), companyOptions()])
  return <ProjectsClient rows={rows} companies={companies} />
}
