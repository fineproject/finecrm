import type { ReactNode } from 'react'
import type { UserRole } from '@prisma/client'
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined'
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined'

export interface NavItem {
  href: string
  label: string
  icon: ReactNode
  exact?: boolean
  minRole?: UserRole // görünürlük için gereken en düşük rol (varsayılan: herkes)
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Genel Bakış', icon: <SpaceDashboardOutlinedIcon />, exact: true },
  { href: '/companies', label: 'Şirketler', icon: <BusinessOutlinedIcon /> },
  { href: '/projects', label: 'Projeler', icon: <FolderOutlinedIcon /> },
  { href: '/cariler', label: 'Cariler', icon: <PeopleAltOutlinedIcon /> },
  { href: '/tasks', label: 'Görevler', icon: <ChecklistOutlinedIcon /> },
  { href: '/reports', label: 'Raporlar', icon: <InsightsOutlinedIcon /> },
  { href: '/notifications', label: 'Bildirimler', icon: <NotificationsNoneOutlinedIcon /> },
  { href: '/audit', label: 'Denetim', icon: <FactCheckOutlinedIcon />, minRole: 'ADMIN' },
  { href: '/users', label: 'Kullanıcılar', icon: <ManageAccountsOutlinedIcon />, minRole: 'ADMIN' },
]

export function labelForPath(pathname: string): string {
  const match = [...NAV_ITEMS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((i) => (i.exact ? pathname === i.href : pathname.startsWith(i.href)))
  return match?.label ?? 'FineCRM'
}
