import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { db } from '@/lib/db'
import type { Adapter } from 'next-auth/adapters'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  // Custom cookie settings are only safe over HTTPS (production / hosted proxy).
  // On local http (dev) we fall back to NextAuth defaults so Google login works locally.
  ...(process.env.NODE_ENV === 'production'
    ? {
        cookies: {
          callbackUrl: {
            name: `__Secure-next-auth.callback-url`,
            options: { httpOnly: true, sameSite: 'none', path: '/', secure: true },
          },
          pkceCodeVerifier: {
            name: `__Secure-next-auth.pkce.code-verifier`,
            options: { httpOnly: true, sameSite: 'none', path: '/', secure: true },
          },
        },
      }
    : {}),
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/',
  },
}
