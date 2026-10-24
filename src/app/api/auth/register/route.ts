import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: 'Email dan kata sandi wajib diisi.' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, message: 'Kata sandi minimal 6 karakter.' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    const exists = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (exists) {
      return NextResponse.json(
        { ok: false, message: 'Email sudah terdaftar di kerajaan.' },
        { status: 409 }
      )
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        name: name || normalizedEmail.split('@')[0],
        password: hashed,
        provider: 'email',
        role: 'player',
      },
    })

    return NextResponse.json({
      ok: true,
      message: 'Pendekar baru terlahir di Nusantara!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider,
        role: user.role,
      },
    })
  } catch (err) {
    console.error('[register] error', err)
    return NextResponse.json(
      { ok: false, message: 'Terjadi kesalahan saat mendaftar.' },
      { status: 500 }
    )
  }
}
