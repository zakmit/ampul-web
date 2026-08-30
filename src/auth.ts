import NextAuth, { DefaultSession } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { authConfig } from "@/auth.config"

declare module "next-auth" {
  interface Session {
    user: {
      role: string
    } & DefaultSession["user"]
  }
  interface User {
    role: string
    lastLoginAt: Date | null
    lastOrderAt: Date | null
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    role: string
    lastLoginAt: Date | null
    lastOrderAt: Date | null
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
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

      // Link any guest orders placed with this email to the now-authenticated user
      const guestOrders = await prisma.order.findMany({
        where: { customerEmail: user.email!, userId: null },
        select: { id: true, createdAt: true },
      })

      if (guestOrders.length > 0) {
        await prisma.order.updateMany({
          where: { id: { in: guestOrders.map((o) => o.id) } },
          data: { userId: user.id },
        })

        const latestOrderAt = guestOrders.reduce((latest, o) =>
          o.createdAt > latest ? o.createdAt : latest,
          guestOrders[0].createdAt
        )

        if (!user.lastOrderAt || latestOrderAt > user.lastOrderAt) {
          await prisma.user.update({
            where: { id: user.id },
            data: { lastOrderAt: latestOrderAt },
          })
        }
      }

      return session
    },
  },
})