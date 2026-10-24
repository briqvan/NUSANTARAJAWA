import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ ok: false, user: null })
    }

    // Find or create user in our DB
    let user = await db.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      user = await db.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || session.user.email.split('@')[0],
          provider: 'google',
          role: 'player',
          image: session.user.image || null,
        },
      })
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider,
        role: user.role,
      },
    })
  } catch (err) {
    console.error('[auth/session] error', err)
    return NextResponse.json({ ok: false, user: null }, { status: 500 })
  }
}
