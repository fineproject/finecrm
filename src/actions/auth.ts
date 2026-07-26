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
): Promise<{ ok?: boolean; error?: string }> {
  try {
    // redirect: false => oturum çerezi kurulur ama yönlendirme istemcide yapılır
    await signIn('credentials', { email, password, redirect: false })
    return { ok: true }
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'E-posta veya şifre hatalı.' }
    }
    throw error
  }
}

export async function doSignOut() {
  await signOut({ redirectTo: '/login' })
}
