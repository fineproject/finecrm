import { notFound } from 'next/navigation'
import TaskDetailView from '@/components/tasks/TaskDetailView'
import { getTaskDetail } from '@/server/tasks'

export const dynamic = 'force-dynamic'

export default async function TaskDetailPage({ params }: { params: { id: string } }) {
  const task = await getTaskDetail(params.id)
  if (!task) notFound()
  return <TaskDetailView task={task} />
}
