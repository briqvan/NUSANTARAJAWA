import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ ok: false, message: 'userId wajib diisi.' }, { status: 400 })
    }
    const save = await db.gameSave.findUnique({ where: { userId } })
    if (!save) {
      return NextResponse.json({ ok: true, save: null })
    }
    let data: unknown = null
    try {
      data = JSON.parse(save.data)
    } catch {
      data = null
    }
    return NextResponse.json({ ok: true, save: { data, updatedAt: save.updatedAt } })
  } catch (err) {
    console.error('[save GET] error', err)
    return NextResponse.json({ ok: false, message: 'Gagal memuat save.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, data } = await req.json()
    if (!userId || data === undefined) {
      return NextResponse.json({ ok: false, message: 'userId dan data wajib diisi.' }, { status: 400 })
    }
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ ok: false, message: 'User tidak ditemukan.' }, { status: 404 })
    }
    const serialized = JSON.stringify(data)
    const save = await db.gameSave.upsert({
      where: { userId },
      update: { data: serialized },
      create: { userId, data: serialized },
    })
    return NextResponse.json({ ok: true, message: 'Progress tersimpan.', updatedAt: save.updatedAt })
  } catch (err) {
    console.error('[save POST] error', err)
    return NextResponse.json({ ok: false, message: 'Gagal menyimpan progress.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await req.json()
    if (!userId) {
      return NextResponse.json({ ok: false, message: 'userId wajib diisi.' }, { status: 400 })
    }
    await db.gameSave.deleteMany({ where: { userId } })
    return NextResponse.json({ ok: true, message: 'Save dihapus.' })
  } catch (err) {
    console.error('[save DELETE] error', err)
    return NextResponse.json({ ok: false, message: 'Gagal menghapus save.' }, { status: 500 })
  }
}