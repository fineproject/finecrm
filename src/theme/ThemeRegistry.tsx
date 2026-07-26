'use client'

import * as React from 'react'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'
import theme from './theme'

/**
 * Tüm uygulamayı saran istemci taraflı sağlayıcı.
 * - AppRouterCacheProvider: Emotion SSR uyumu (App Router)
 * - InitColorSchemeScript: sayfa yüklenmeden renk şemasını uygular (flicker yok)
 * - ThemeProvider + CssBaseline: MUI teması ve reset
 */
export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: 'mui' }}>
      <InitColorSchemeScript attribute="class" defaultMode="light" />
      <ThemeProvider theme={theme} defaultMode="light">
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}
