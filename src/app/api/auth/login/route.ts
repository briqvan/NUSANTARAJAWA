import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: 'Email dan kata sandi wajib diisi.' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user || user.provider !== 'email' || !user.password) {
      return NextResponse.json(
        { ok: false, message: 'Email atau kata sandi salah.' },
        { status: 401 }
      )
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json(
        { ok: false, message: 'Email atau kata sandi salah.' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      ok: true,
      message: 'Berhasil masuk ke dunia Nusantara.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider,
        role: user.role,
      },
    })
  } catch (err) {
    console.error('[login] error', err)
    return NextResponse.json(
      { ok: false, message: 'Terjadi kesalahan saat masuk.' },
      { status: 500 }
    )
  }
}
