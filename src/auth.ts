import NextAuth, { DefaultSession } from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { PrismaClient } from "@/generated/prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      role: string
    } & DefaultSession["user"]
  }
  interface User {
    role: string
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    role: string
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  callbacks: {
    async signIn({ user }) {
      const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []

      // Only update if user should be admin (default is already 'user' in schema)
      if (adminEmails.includes(user.email!)) {
        const db = new PrismaClient()
        await db.user.update({
          where: { id: user.id! },
          data: { role: 'admin' }
        })
        await db.$disconnect()
      }

      return true
    },
    async session({ session, user }) {
      session.user.role = user.role
      return session
    },
  },
})