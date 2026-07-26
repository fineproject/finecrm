import { prisma } from '@/lib/prisma'
import type { CompanyRow, Option } from '@/types/dto'
import { companyWhere, getScope } from './access'

export async function listCompanies(): Promise<CompanyRow[]> {
  const scope = await getScope()
  const companies = await prisma.company.findMany({
    where: companyWhere(scope),
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { projects: true } },
      projects: { select: { _count: { select: { cariler: true } } } },
    },
  })

  return companies.map((c) => ({
    id: c.id,
    name: c.name,
    taxNumber: c.taxNumber,
    email: c.email,
    phone: c.phone,
    address: c.address,
    projectCount: c._count.projects,
    cariCount: c.projects.reduce((sum, p) => sum + p._count.cariler, 0),
    createdAt: c.createdAt.toISOString(),
  }))
}

export async function companyOptions(): Promise<Option[]> {
  const scope = await getScope()
  const companies = await prisma.company.findMany({
    where: companyWhere(scope),
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })
  return companies.map((c) => ({ id: c.id, label: c.name }))
}

// Yönetim ekranları için kapsam gözetmeksizin tüm şirketler
export async function allCompanyOptions(): Promise<Option[]> {
  const companies = await prisma.company.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })
  return companies.map((c) => ({ id: c.id, label: c.name }))
}
