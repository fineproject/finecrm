import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'

// Middleware yalnızca edge-safe authConfig kullanır (Prisma yok).
export const { auth: middleware } = NextAuth(authConfig)

export const config = {
  // api/auth, statik dosyalar ve görseller hariç tüm rotalar korunur
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|logo.svg).*)'],
}
