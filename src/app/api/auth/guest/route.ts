import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const guestId = `tamu_${crypto.randomBytes(6).toString('hex')}`
    const guestEmail = `${guestId}@tamu.nusantara.local`

    const user = await db.user.create({
      data: {
        email: guestEmail,
        name: `Pengembara ${guestId.slice(-4).toUpperCase()}`,
        provider: 'guest',
        role: 'player',
      },
    })

    return NextResponse.json({
      ok: true,
      message: 'Selamat datang, pengembara tamu.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider,
        role: user.role,
        guest: true,
      },
    })
  } catch (err) {
    console.error('[guest] error', err)
    return NextResponse.json(
      { ok: false, message: 'Gagal masuk sebagai tamu.' },
      { status: 500 }
    )
  }
}
