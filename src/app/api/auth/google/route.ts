import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

export const runtime = 'nodejs'

// Mock Google OAuth handler.
// In production this would exchange a Google ID token for user profile.
// Here we accept a mock credential and create/fetch a user.
export async function POST(req: NextRequest) {
  try {
    const { credential, name, email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { ok: false, message: 'Data Google tidak lengkap.' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    let user = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      user = await db.user.create({
        data: {
          email: normalizedEmail,
          name: name || normalizedEmail.split('@')[0],
          provider: 'google',
          role: 'player',
          // store credential id reference (not the token) for debugging
          password: credential ? `google:${credential.slice(0, 12)}` : null,
        },
      })
    } else if (user.provider !== 'google') {
      return NextResponse.json(
        {
          ok: false,
          message: 'Email sudah terdaftar dengan metode lain. Silakan masuk dengan cara yang sama.',
        },
        { status: 409 }
      )
    }

    return NextResponse.json({
      ok: true,
      message: 'Masuk dengan Google berhasil.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider,
        role: user.role,
      },
    })
  } catch (err) {
    console.error('[google] error', err)
    return NextResponse.json(
      { ok: false, message: 'Gagal masuk dengan Google.' },
      { status: 500 }
    )
  }
}
