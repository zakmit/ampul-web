'use server'

import { signIn, signOut } from '@/auth'
import { AuthError } from 'next-auth'
import { headers } from 'next/headers'

export async function handleSignIn(provider: string, callbackUrl?: string) {
  try {
    // If no callbackUrl provided, get it from the referer header
    let redirectTo = callbackUrl

    if (!redirectTo) {
      const headersList = await headers()
      const referer = headersList.get('referer')
      redirectTo = referer || '/'
    }

    await signIn(provider, {
      redirectTo,
    })
  } catch (error) {
    // Auth.js throws a redirect error on successful sign in
    // We need to re-throw it so the redirect happens
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'OAuthSignInError':
          return { error: 'OAuth sign in failed. Please try again.' }
        default:
          return { error: 'An error occurred during sign in.' }
      }
    }
    throw error
  }
}

export async function handleSignOut(callbackUrl?: string) {
  try {
    // If no callbackUrl provided, get it from the referer header
    let redirectTo = callbackUrl

    if (!redirectTo) {
      const headersList = await headers()
      const referer = headersList.get('referer')
      redirectTo = referer || '/'
    }

    await signOut({
      redirectTo,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'An error occurred during sign out.' }
    }
    throw error
  }
}
