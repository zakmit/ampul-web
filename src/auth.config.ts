import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

/**
 * Edge/middleware-safe Auth.js config.
 *
 * This module must NOT import Prisma, `pg`, or anything else that pulls in
 * Node-only native dependencies -- `middleware.ts` bundles whatever it imports,
 * and dragging the database client in there makes the middleware bundle huge
 * and fragile. The Prisma adapter and DB-backed callbacks live in `auth.ts`.
 */
export const authConfig = {
  providers: [Google],
  // Auth.js only auto-detects a trusted host for some deployments. Because
  // `NextAuth()` is now constructed in middleware as well as in `auth.ts`,
  // set this explicitly so both instances agree. Safe behind Vercel/a proxy
  // that sets the host header; if you deploy somewhere the host header is
  // attacker-controlled, pin AUTH_URL instead.
  trustHost: true,
} satisfies NextAuthConfig
