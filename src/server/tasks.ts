import { prisma } from '@/lib/prisma'
import type { Option, TaskDetail, TaskRow } from '@/types/dto'
import type { Prisma, TaskStatus } from '@prisma/client'
import { getScope } from './access'
import { getSessionUser } from '@/lib/authz'

// Görev kapsamı: ADMIN tümünü; diğerleri erişilebilir projelerdeki veya
// kendisine atanmış görevleri görür.
export async function taskScopeWhere(): Promise<Prisma.TaskWhereInput> {
  const user = await getSessionUser()
  if (!user) return { id: '__none__' }
  if (user.role === 'ADMIN') return {}
  const scope = await getScope()
  return {
    OR: [
      { assignedUserId: user.id },
      { projectId: { in: scope.projectIds } },
      { cari: { projectId: { in: scope.projectIds } } },
    ],
  }
}

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
    where: { AND: [await taskScopeWhere(), { status: filter?.status || undefined }] },
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
    where: { AND: [await taskScopeWhere(), { status: 'PENDING' }] },
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

/**
 * Görev atanabilecek kullanıcılar:
 * - ADMIN: tüm kullanıcılar
 * - MANAGER: erişilebilir şirket/projelere bağlı satış temsilcileri (MEMBER) + kendisi
 * - MEMBER: yalnızca kendisi
 */
export async function assignableUsers(): Promise<Option[]> {
  const user = await getSessionUser()
  if (!user) return []

  if (user.role === 'ADMIN') {
    const all = await prisma.user.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } })
    return all.map((u) => ({ id: u.id, label: u.name }))
  }

  const selfOpt: Option = { id: user.id, label: `${user.name ?? user.email ?? 'Ben'} (ben)` }
  if (user.role === 'MEMBER') return [selfOpt]

  // MANAGER
  const scope = await getScope()
  const members = await prisma.user.findMany({
    where: {
      role: 'MEMBER',
      OR: [
        { accessCompanies: { some: { id: { in: scope.companyIds } } } },
        { accessProjects: { some: { id: { in: scope.projectIds } } } },
      ],
    },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })
  const opts = members.map((m) => ({ id: m.id, label: m.name }))
  if (!opts.some((o) => o.id === user.id)) opts.unshift(selfOpt)
  return opts
}

export async function getTaskDetail(id: string): Promise<TaskDetail | null> {
  const t = await prisma.task.findFirst({
    where: { AND: [await taskScopeWhere(), { id }] },
    include: {
      ...include,
      activityLogs: {
        where: { type: 'NOTE_ADDED' },
        orderBy: { createdAt: 'desc' },
        include: { actor: { select: { name: true } } },
      },
    },
  })
  if (!t) return null
  return {
    ...mapTask(t),
    notes: t.activityLogs.map((a) => ({
      id: a.id,
      message: a.message,
      actorName: a.actor?.name ?? null,
      createdAt: a.createdAt.toISOString(),
    })),
  }
}
