import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const name = req.nextUrl.searchParams.get('name')
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ ok: true, available: true })
    }

    const trimmed = name.trim()

    // Check if any character has this name
    const existing = await db.character.findFirst({
      where: {
        name: { contains: trimmed },
      },
    })

    return NextResponse.json({
      ok: true,
      available: !existing,
    })
  } catch (err) {
    console.error('[check-name] error', err)
    return NextResponse.json(
      { ok: false, available: true, message: 'Gagal cek nama.' },
      { status: 500 }
    )
  }
}
