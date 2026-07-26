'use server'

import { AuthError } from 'next-auth'
import { signIn, signOut } from '@/auth'

/**
 * Credentials ile giriş. Başarılıysa signIn bir yönlendirme (redirect) fırlatır
 * ve istemci otomatik olarak '/' adresine gider. Hatalıysa mesaj döner.
 */
export async function authenticate(
  email: string,
  password: string,
): Promise<{ error?: string }> {
  try {
    await signIn('credentials', { email, password, redirectTo: '/' })
    return {}
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'E-posta veya şifre hatalı.' }
    }
    // Yönlendirme (NEXT_REDIRECT) ve diğer hatalar yukarı fırlatılır
    throw error
  }
}

export async function doSignOut() {
  await signOut({ redirectTo: '/login' })
}
