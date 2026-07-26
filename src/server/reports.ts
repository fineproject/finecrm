import { prisma } from '@/lib/prisma'
import type { ActivityRow } from '@/types/dto'
import type { ActivityType, CariStage, ProjectStatus } from '@prisma/client'
import { ACTIVITY_TYPE, CARI_STAGE, PROJECT_STATUS } from '@/lib/labels'
import {
  activityWhere,
  cariWhere,
  companyWhere,
  getScope,
  projectWhere,
  type Scope,
} from './access'

// ---- Tarih yardımcıları ----
function startOfDay(d = new Date()) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
function daysAgo(n: number) {
  const x = startOfDay()
  x.setDate(x.getDate() - n)
  return x
}

export type ReportPeriod = 'day' | 'week' | 'month' | 'all'

function periodStart(period: ReportPeriod): Date | undefined {
  switch (period) {
    case 'day':
      return startOfDay()
    case 'week':
      return daysAgo(7)
    case 'month':
      return daysAgo(30)
    default:
      return undefined
  }
}

const CARI_ACTIVITY_TYPES: ActivityType[] = [
  'CARI_CREATED',
  'CARI_UPDATED',
  'CARI_STAGE_CHANGED',
]

export interface PeriodSummary {
  key: ReportPeriod
  label: string
  newProjects: number
  completedMilestones: number
  cariActivities: number
}

export interface DashboardStats {
  totals: {
    companies: number
    projects: number
    cariler: number
    activeProjects: number
    totalBudget: number
  }
  projectStatus: { status: ProjectStatus; count: number }[]
  cariStage: { stage: CariStage; count: number }[]
  periods: PeriodSummary[]
  activityTrend: { date: string; count: number }[]
  recent: ActivityRow[]
}

async function periodSummary(
  key: ReportPeriod,
  label: string,
  scope: Scope,
): Promise<PeriodSummary> {
  const gte = periodStart(key)
  const base = gte ? [activityWhere(scope), { createdAt: { gte } }] : [activityWhere(scope)]
  const [newProjects, completedMilestones, cariActivities] = await Promise.all([
    prisma.activityLog.count({ where: { AND: [...base, { type: 'PROJECT_CREATED' }] } }),
    prisma.activityLog.count({ where: { AND: [...base, { type: 'MILESTONE_COMPLETED' }] } }),
    prisma.activityLog.count({ where: { AND: [...base, { type: { in: CARI_ACTIVITY_TYPES } }] } }),
  ])
  return { key, label, newProjects, completedMilestones, cariActivities }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const scope = await getScope()
  const [
    companies,
    projects,
    cariler,
    activeProjects,
    budgetAgg,
    projectGroups,
    cariGroups,
    trendLogs,
    recentLogs,
  ] = await Promise.all([
    prisma.company.count({ where: companyWhere(scope) }),
    prisma.project.count({ where: projectWhere(scope) }),
    prisma.cari.count({ where: cariWhere(scope) }),
    prisma.project.count({ where: { AND: [projectWhere(scope), { status: 'IN_PROGRESS' }] } }),
    prisma.project.aggregate({ _sum: { budget: true }, where: projectWhere(scope) }),
    prisma.project.groupBy({ by: ['status'], _count: { _all: true }, where: projectWhere(scope) }),
    prisma.cari.groupBy({ by: ['stage'], _count: { _all: true }, where: cariWhere(scope) }),
    prisma.activityLog.findMany({
      where: { AND: [activityWhere(scope), { createdAt: { gte: daysAgo(13) } }] },
      select: { createdAt: true },
    }),
    prisma.activityLog.findMany({
      where: activityWhere(scope),
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        company: { select: { name: true } },
        project: { select: { name: true } },
        cari: { select: { firstName: true, lastName: true } },
      },
    }),
  ])

  const [day, week, month] = await Promise.all([
    periodSummary('day', 'Günlük', scope),
    periodSummary('week', 'Haftalık', scope),
    periodSummary('month', 'Aylık', scope),
  ])

  // Son 14 günün günlük hareket sayısı (grafik için)
  const buckets = new Map<string, number>()
  for (let i = 13; i >= 0; i--) {
    buckets.set(daysAgo(i).toISOString().slice(0, 10), 0)
  }
  for (const log of trendLogs) {
    const key = log.createdAt.toISOString().slice(0, 10)
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1)
  }

  return {
    totals: {
      companies,
      projects,
      cariler,
      activeProjects,
      totalBudget: budgetAgg._sum.budget ? Number(budgetAgg._sum.budget) : 0,
    },
    projectStatus: projectGroups.map((g) => ({ status: g.status, count: g._count._all })),
    cariStage: cariGroups.map((g) => ({ stage: g.stage, count: g._count._all })),
    periods: [day, week, month],
    activityTrend: Array.from(buckets, ([date, count]) => ({ date, count })),
    recent: recentLogs.map(mapActivity),
  }
}

// Cari satış hunisi raporu: dönemsel (günlük/haftalık/aylık) metrikler.
// "Gelen" = yeni kayıt, sonraki adımlar aşama geçişlerinden (CARI_STAGE_CHANGED) sayılır.
export interface FunnelMetric {
  key: string
  label: string
  day: number
  week: number
  month: number
}

export async function getCariFunnelReport(scope?: Scope): Promise<FunnelMetric[]> {
  const s = scope ?? (await getScope())
  const bounds = { day: startOfDay(), week: daysAgo(7), month: daysAgo(30) }

  const created = (gte: Date) =>
    prisma.activityLog.count({
      where: { AND: [activityWhere(s), { type: 'CARI_CREATED', createdAt: { gte } }] },
    })

  const toStage = (stage: string, gte: Date) =>
    prisma.activityLog.count({
      where: {
        AND: [
          activityWhere(s),
          { type: 'CARI_STAGE_CHANGED', metadata: { path: ['to'], equals: stage }, createdAt: { gte } },
        ],
      },
    })

  const defs: { key: string; label: string; fn: (gte: Date) => Promise<number> }[] = [
    { key: 'incoming', label: 'Gelen (Yeni Kayıt)', fn: created },
    { key: 'informed', label: 'Bilgi Verilenler', fn: (g) => toStage('INFO_GIVEN', g) },
    { key: 'callbacks', label: 'Dönüş Yapılanlar', fn: (g) => toStage('CALLED_AGAIN', g) },
    { key: 'converted', label: 'Potansiyele Dönüşenler', fn: (g) => toStage('INVITED', g) },
  ]

  return Promise.all(
    defs.map(async (d) => {
      const [day, week, month] = await Promise.all([
        d.fn(bounds.day),
        d.fn(bounds.week),
        d.fn(bounds.month),
      ])
      return { key: d.key, label: d.label, day, week, month }
    }),
  )
}

// Tek seferde tüm rapor bölümlerini (özet, kırılımlar, huni) toplar.
// PDF/CSV dışa aktarımı ve rapor sayfası bu veriyi kullanır.
export interface ReportData {
  totals: {
    companies: number
    projects: number
    activeProjects: number
    completedProjects: number
    cariler: number
    totalBudget: number
  }
  projectStatus: { label: string; count: number }[]
  cariStage: { label: string; count: number }[]
  funnel: FunnelMetric[]
  companies: { name: string; projectCount: number; cariCount: number; budget: number }[]
  recent: { createdAt: string; type: string; message: string; context: string }[]
}

export async function getReportData(): Promise<ReportData> {
  const scope = await getScope()
  const [
    companiesCount,
    projects,
    activeProjects,
    completedProjects,
    cariler,
    budgetAgg,
    projectGroups,
    cariGroups,
    funnel,
    companyRows,
    recentLogs,
  ] = await Promise.all([
    prisma.company.count({ where: companyWhere(scope) }),
    prisma.project.count({ where: projectWhere(scope) }),
    prisma.project.count({ where: { AND: [projectWhere(scope), { status: 'IN_PROGRESS' }] } }),
    prisma.project.count({ where: { AND: [projectWhere(scope), { status: 'COMPLETED' }] } }),
    prisma.cari.count({ where: cariWhere(scope) }),
    prisma.project.aggregate({ _sum: { budget: true }, where: projectWhere(scope) }),
    prisma.project.groupBy({ by: ['status'], _count: { _all: true }, where: projectWhere(scope) }),
    prisma.cari.groupBy({ by: ['stage'], _count: { _all: true }, where: cariWhere(scope) }),
    getCariFunnelReport(scope),
    prisma.company.findMany({
      where: companyWhere(scope),
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { projects: true } },
        projects: { select: { budget: true, _count: { select: { cariler: true } } } },
      },
    }),
    prisma.activityLog.findMany({
      where: activityWhere(scope),
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        company: { select: { name: true } },
        project: { select: { name: true } },
        cari: { select: { firstName: true, lastName: true } },
      },
    }),
  ])

  return {
    totals: {
      companies: companiesCount,
      projects,
      activeProjects,
      completedProjects,
      cariler,
      totalBudget: budgetAgg._sum.budget ? Number(budgetAgg._sum.budget) : 0,
    },
    projectStatus: projectGroups.map((g) => ({
      label: PROJECT_STATUS[g.status].label,
      count: g._count._all,
    })),
    cariStage: cariGroups.map((g) => ({
      label: CARI_STAGE[g.stage].label,
      count: g._count._all,
    })),
    funnel,
    companies: companyRows.map((c) => ({
      name: c.name,
      projectCount: c._count.projects,
      cariCount: c.projects.reduce((s, p) => s + p._count.cariler, 0),
      budget: c.projects.reduce((s, p) => s + (p.budget ? Number(p.budget) : 0), 0),
    })),
    recent: recentLogs.map((log) => ({
      createdAt: log.createdAt.toISOString(),
      type: ACTIVITY_TYPE[log.type],
      message: log.message,
      context: log.project?.name ?? log.company?.name ?? (log.cari ? `${log.cari.firstName} ${log.cari.lastName}` : '—'),
    })),
  }
}

export async function listActivities(opts?: {
  type?: ActivityType
  period?: ReportPeriod
  scoped?: boolean // audit gibi yerlerde false ile tüm kayıtlar
}): Promise<ActivityRow[]> {
  const gte = opts?.period ? periodStart(opts.period) : undefined
  const scope = opts?.scoped === false ? { all: true, companyIds: [], projectIds: [] } : await getScope()
  const logs = await prisma.activityLog.findMany({
    where: {
      AND: [
        activityWhere(scope),
        { type: opts?.type || undefined, createdAt: gte ? { gte } : undefined },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 300,
    include: {
      actor: { select: { name: true } },
      company: { select: { name: true } },
      project: { select: { name: true } },
      cari: { select: { firstName: true, lastName: true } },
    },
  })
  return logs.map(mapActivity)
}

type LogWithRelations = {
  id: string
  type: ActivityType
  message: string
  createdAt: Date
  actor?: { name: string } | null
  company: { name: string } | null
  project: { name: string } | null
  cari: { firstName: string; lastName: string } | null
}

function mapActivity(log: LogWithRelations): ActivityRow {
  return {
    id: log.id,
    type: log.type,
    message: log.message,
    actorName: log.actor?.name ?? null,
    companyName: log.company?.name ?? null,
    projectName: log.project?.name ?? null,
    cariName: log.cari ? `${log.cari.firstName} ${log.cari.lastName}` : null,
    createdAt: log.createdAt.toISOString(),
  }
}
