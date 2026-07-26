'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import MenuIcon from '@mui/icons-material/Menu'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import { NAV_ITEMS, labelForPath } from './navConfig'
import ThemeToggle from './ThemeToggle'
import UserMenu from './UserMenu'
import { hasRole } from '@/lib/rbac'
import type { UserRole } from '@prisma/client'

const DRAWER_WIDTH = 264

export interface ShellUser {
  name: string
  email: string
  roleLabel: string
  role: UserRole
}

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function AppShell({
  children,
  unreadCount = 0,
  user,
}: {
  children: React.ReactNode
  unreadCount?: number
  user?: ShellUser | null
}) {
  const pathname = usePathname()
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ gap: 1.5, px: 2.5 }}>
        <Avatar
          variant="rounded"
          sx={{
            bgcolor: 'primary.main',
            width: 36,
            height: 36,
            fontWeight: 800,
            background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
          }}
        >
          ◆
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={800} lineHeight={1.1}>
            FineCRM
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Yönetim Paneli
          </Typography>
        </Box>
      </Toolbar>

      <List sx={{ px: 1.5, py: 1, flex: 1 }}>
        {NAV_ITEMS.filter((item) => !item.minRole || hasRole(user?.role, item.minRole)).map((item) => {
          const active = isActive(pathname, item.href, item.exact)
          return (
            <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                selected={active}
                onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'action.selected',
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: active ? 700 : 500, fontSize: 14.5 }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} FineCRM
        </Typography>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            {labelForPath(pathname)}
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <ThemeToggle />
            <IconButton color="inherit" component={Link} href="/notifications">
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <NotificationsNoneOutlinedIcon />
              </Badge>
            </IconButton>
            {user && <UserMenu name={user.name} email={user.email} roleLabel={user.roleLabel} />}
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Kalıcı (desktop) ve geçici (mobil) çekmece */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {isDesktop ? (
          <Drawer
            variant="permanent"
            open
            sx={{
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                boxSizing: 'border-box',
                borderRight: 1,
                borderColor: 'divider',
              },
            }}
          >
            {drawerContent}
          </Drawer>
        ) : (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
          >
            {drawerContent}
          </Drawer>
        )}
      </Box>

      {/* Ana içerik */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          height: '100vh',
          overflow: 'auto',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>
      </Box>
    </Box>
  )
}
