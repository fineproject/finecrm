import type {
  ActivityType,
  CariStage,
  CariType,
  MilestoneStatus,
  NotificationChannel,
  NotificationStatus,
  ProjectStatus,
  UserRole,
  TaskStatus,
  TaskPriority,
} from '@prisma/client'

export interface TaskRow {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  assignedUserId: string | null
  assignedUserName: string | null
  cariId: string | null
  cariName: string | null
  projectId: string | null
  projectName: string | null
  createdAt: string
}

export interface UserRow {
  id: string
  email: string
  name: string
  role: UserRole
  accessCompanyIds: string[]
  accessProjectIds: string[]
  createdAt: string
}

// İstemciye (Client Components / DataGrid) aktarılabilir düz veri tipleri.
// Prisma Decimal -> number, Date -> ISO string olarak serileştirilir.

export interface Option {
  id: string
  label: string
}

export interface CompanyRow {
  id: string
  name: string
  taxNumber: string | null
  email: string | null
  phone: string | null
  address: string | null
  projectCount: number
  cariCount: number
  createdAt: string
}

export interface ProjectRow {
  id: string
  name: string
  description: string | null
  companyId: string
  companyName: string
  status: ProjectStatus
  startDate: string | null
  endDate: string | null
  budget: number | null
  milestoneCount: number
  cariCount: number
  createdAt: string
}

export interface CariRow {
  id: string
  firstName: string
  lastName: string
  fullName: string
  phone: string | null
  email: string | null
  type: CariType
  stage: CariStage
  infoStatus: string | null
  projectId: string
  projectName: string
  companyName: string
  currentMilestoneId: string | null
  currentMilestoneTitle: string | null
  createdAt: string
}

export interface CariHistoryItem {
  id: string
  type: ActivityType
  message: string
  createdAt: string
}

export interface CariDetail {
  id: string
  firstName: string
  lastName: string
  fullName: string
  phone: string | null
  email: string | null
  type: CariType
  stage: CariStage
  infoStatus: string | null
  projectId: string
  projectName: string
  companyName: string
  currentMilestoneTitle: string | null
  createdAt: string
  history: CariHistoryItem[]
}

export interface MilestoneRow {
  id: string
  title: string
  description: string | null
  status: MilestoneStatus
  order: number
  dueDate: string | null
  completedAt: string | null
  projectId: string
  createdAt: string
}

export interface ActivityRow {
  id: string
  type: ActivityType
  message: string
  actorName: string | null
  companyName: string | null
  projectName: string | null
  cariName: string | null
  createdAt: string
}

export interface NotificationRow {
  id: string
  channel: NotificationChannel
  status: NotificationStatus
  title: string
  body: string
  recipientName: string | null
  createdAt: string
  readAt: string | null
}
