import UsersClient from '@/components/users/UsersClient'
import { listUsers } from '@/server/users'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const [rows, session] = await Promise.all([listUsers(), auth()])
  const isAdmin = session?.user?.role === 'ADMIN'
  return <UsersClient rows={rows} isAdmin={isAdmin} currentUserId={session?.user?.id ?? ''} />
}
