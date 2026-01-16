import NextAuth, { DefaultSession } from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

declare module "next-auth" {
  interface Session {
    user: {
      role: string
    } & DefaultSession["user"]
  }
  interface User {
    role: string
    lastLoginAt: Date | null
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    role: string
    lastLoginAt: Date | null
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  callbacks: {
    async session({ session, user }) {
      const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []

      // Update lastLoginAt timestamp only if it's been more than 6 hours
      const SIX_HOURS = 6 * 60 * 60 * 1000
      const shouldUpdateLastLogin =
        !user.lastLoginAt ||
        Date.now() - user.lastLoginAt.getTime() > SIX_HOURS

      if (shouldUpdateLastLogin) {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        })
      }

      // Check if user should be admin and update if needed
      if (adminEmails.includes(user.email!) && user.role !== 'admin') {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'admin' }
        })
        session.user.role = 'admin'
      } else {
        session.user.role = user.role
      }

      return session
    },
  },
})