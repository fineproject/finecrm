import CarilerClient from '@/components/cariler/CarilerClient'
import { listCariler, milestoneOptionsByProject } from '@/server/cariler'
import { projectOptions } from '@/server/projects'

export const dynamic = 'force-dynamic'

export default async function CarilerPage() {
  const [rows, projects, milestonesByProject] = await Promise.all([
    listCariler(),
    projectOptions(),
    milestoneOptionsByProject(),
  ])
  return (
    <CarilerClient rows={rows} projects={projects} milestonesByProject={milestonesByProject} />
  )
}
