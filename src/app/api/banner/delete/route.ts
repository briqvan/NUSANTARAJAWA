import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

const GM_PASSWORD = '19891989'

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()

    if (password !== GM_PASSWORD) {
      return NextResponse.json(
        { ok: false, message: 'Kata sandi GM salah. Akses ditolak.' },
        { status: 403 }
      )
    }

    await db.eventBanner.updateMany({
      where: { active: true },
      data: { active: false },
    })

    return NextResponse.json({
      ok: true,
      message: 'Banner event telah dihapus. Kembali ke banner default.',
    })
  } catch (err) {
    console.error('[banner delete] error', err)
    return NextResponse.json(
      { ok: false, message: 'Gagal menghapus banner.' },
      { status: 500 }
    )
  }
}
