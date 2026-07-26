'use client'

import * as React from 'react'
import { useColorScheme } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'

export default function ThemeToggle() {
  const { mode, systemMode, setMode } = useColorScheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  // Sunucu render'ında tema bilinmediği için hydration uyumu adına boş buton
  if (!mounted) {
    return (
      <IconButton color="inherit" disabled>
        <DarkModeOutlinedIcon />
      </IconButton>
    )
  }

  const resolved = mode === 'system' ? systemMode : mode
  const isDark = resolved === 'dark'

  return (
    <Tooltip title={isDark ? 'Aydınlık moda geç' : 'Karanlık moda geç'}>
      <IconButton color="inherit" onClick={() => setMode(isDark ? 'light' : 'dark')}>
        {isDark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
      </IconButton>
    </Tooltip>
  )
}
