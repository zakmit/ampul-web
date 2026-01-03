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
    async session({ session, user }) {
      const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []

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