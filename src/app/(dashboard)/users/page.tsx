import UsersClient from '@/components/users/UsersClient'
import { listUsers } from '@/server/users'
import { allCompanyOptions } from '@/server/companies'
import { allProjectOptions } from '@/server/projects'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const [rows, companies, projects, session] = await Promise.all([
    listUsers(),
    allCompanyOptions(),
    allProjectOptions(),
    auth(),
  ])
  const isAdmin = session?.user?.role === 'ADMIN'
  return (
    <UsersClient
      rows={rows}
      companies={companies}
      projects={projects}
      isAdmin={isAdmin}
      currentUserId={session?.user?.id ?? ''}
    />
  )
}
