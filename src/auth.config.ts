import type { NextAuthConfig } from 'next-auth'
import type { UserRole } from '@prisma/client'

// AUTH_SECRET tanımlı değilse geliştirme ortamında güvenli bir yedek kullanılır
// (böylece proje kutudan çıkar çıkmaz çalışır). ÜRETİMDE ise AUTH_SECRET zorunludur.
const devFallbackSecret =
  process.env.NODE_ENV !== 'production' ? 'finecrm-dev-insecure-secret-change-me' : undefined

const secret = process.env.AUTH_SECRET ?? devFallbackSecret

// Edge-safe yapılandırma (middleware bunu kullanır — Prisma/bcrypt İÇERMEZ).
// Sağlayıcılar ve authorize() mantığı auth.ts (Node) içinde eklenir.
export const authConfig = {
  secret,
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  providers: [],
  callbacks: {
    // Rota koruması: giriş yapılmamışsa /login'e yönlendir
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnLogin = nextUrl.pathname.startsWith('/login')

      if (isOnLogin) {
        if (isLoggedIn) return Response.redirect(new URL('/', nextUrl))
        return true
      }
      return isLoggedIn
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: UserRole }).role
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    },
  },
} satisfies NextAuthConfig
