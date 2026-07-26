import type { ReactNode } from 'react'
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'

export interface NavItem {
  href: string
  label: string
  icon: ReactNode
  exact?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Genel Bakış', icon: <SpaceDashboardOutlinedIcon />, exact: true },
  { href: '/companies', label: 'Şirketler', icon: <BusinessOutlinedIcon /> },
  { href: '/projects', label: 'Projeler', icon: <FolderOutlinedIcon /> },
  { href: '/cariler', label: 'Cariler', icon: <PeopleAltOutlinedIcon /> },
  { href: '/reports', label: 'Raporlar', icon: <InsightsOutlinedIcon /> },
  { href: '/notifications', label: 'Bildirimler', icon: <NotificationsNoneOutlinedIcon /> },
]

export function labelForPath(pathname: string): string {
  const match = [...NAV_ITEMS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((i) => (i.exact ? pathname === i.href : pathname.startsWith(i.href)))
  return match?.label ?? 'FineCRM'
}
