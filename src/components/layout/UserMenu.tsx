'use client'

import * as React from 'react'
import { signOut } from 'next-auth/react'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import { initials } from '@/lib/format'

export default function UserMenu({
  name,
  email,
  roleLabel,
}: {
  name: string
  email: string
  roleLabel: string
}) {
  const [anchor, setAnchor] = React.useState<null | HTMLElement>(null)
  const [first, last] = name.split(' ')

  return (
    <>
      <IconButton onClick={(e) => setAnchor(e.currentTarget)} sx={{ ml: 1 }}>
        <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', fontSize: 14 }}>
          {initials(first, last)}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" fontWeight={700}>{name}</Typography>
          <Typography variant="caption" color="text.secondary" display="block">{email}</Typography>
          <Typography variant="caption" color="primary">{roleLabel}</Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
          <ListItemIcon>
            <LogoutOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Çıkış Yap
        </MenuItem>
      </Menu>
    </>
  )
}
