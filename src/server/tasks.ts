import { prisma } from '@/lib/prisma'
import type { Option, TaskRow } from '@/types/dto'
import type { TaskStatus } from '@prisma/client'

const include = {
  assignedUser: { select: { name: true } },
  cari: { select: { firstName: true, lastName: true } },
  project: { select: { name: true } },
}

type TaskWithRels = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate: Date | null
  assignedUserId: string | null
  cariId: string | null
  projectId: string | null
  createdAt: Date
  assignedUser: { name: string } | null
  cari: { firstName: string; lastName: string } | null
  project: { name: string } | null
}

function mapTask(t: TaskWithRels): TaskRow {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate?.toISOString() ?? null,
    assignedUserId: t.assignedUserId,
    assignedUserName: t.assignedUser?.name ?? null,
    cariId: t.cariId,
    cariName: t.cari ? `${t.cari.firstName} ${t.cari.lastName}` : null,
    projectId: t.projectId,
    projectName: t.project?.name ?? null,
    createdAt: t.createdAt.toISOString(),
  }
}

export async function listTasks(filter?: { status?: TaskStatus }): Promise<TaskRow[]> {
  const tasks = await prisma.task.findMany({
    where: { status: filter?.status || undefined },
    orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    include,
  })
  return tasks.map(mapTask)
}

export interface TaskDashboard {
  overdue: TaskRow[]
  today: TaskRow[]
  upcoming: TaskRow[]
  openCount: number
}

export async function getTaskDashboard(): Promise<TaskDashboard> {
  const now = new Date()
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const endOfToday = new Date(startOfToday)
  endOfToday.setDate(endOfToday.getDate() + 1)
  const in7 = new Date(startOfToday)
  in7.setDate(in7.getDate() + 8)

  const open = await prisma.task.findMany({
    where: { status: 'PENDING' },
    orderBy: { dueDate: 'asc' },
    include,
  })
  const mapped = open.map(mapTask)

  const overdue = mapped.filter((t) => t.dueDate && new Date(t.dueDate) < startOfToday)
  const today = mapped.filter(
    (t) => t.dueDate && new Date(t.dueDate) >= startOfToday && new Date(t.dueDate) < endOfToday,
  )
  const upcoming = mapped.filter(
    (t) => t.dueDate && new Date(t.dueDate) >= endOfToday && new Date(t.dueDate) < in7,
  )

  return { overdue, today, upcoming, openCount: mapped.length }
}

export async function userOptions(): Promise<Option[]> {
  const users = await prisma.user.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } })
  return users.map((u) => ({ id: u.id, label: u.name }))
}
