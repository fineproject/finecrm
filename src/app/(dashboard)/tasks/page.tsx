import TasksClient from '@/components/tasks/TasksClient'
import { listTasks, userOptions } from '@/server/tasks'
import { projectOptions } from '@/server/projects'
import { cariOptions } from '@/server/cariler'

export const dynamic = 'force-dynamic'

export default async function TasksPage() {
  const [rows, users, projects, cariler] = await Promise.all([
    listTasks(),
    userOptions(),
    projectOptions(),
    cariOptions(),
  ])
  return <TasksClient rows={rows} users={users} projects={projects} cariler={cariler} />
}
