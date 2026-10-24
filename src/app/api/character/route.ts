import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

const VALID_GENDERS = ['male', 'female']
const VALID_CLASSES = ['ksatria', 'pendekar', 'dukun', 'pemanah']

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) {
      return NextResponse.json(
        { ok: false, message: 'userId wajib diisi.' },
        { status: 400 }
      )
    }

    const character = await db.character.findUnique({
      where: { userId },
    })

    return NextResponse.json({ ok: true, character })
  } catch (err) {
    console.error('[character GET] error', err)
    return NextResponse.json(
      { ok: false, message: 'Gagal memuat karakter.' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, name, gender, classCode } = await req.json()

    if (!userId || !name || !gender || !classCode) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Data karakter tidak lengkap (userId, name, gender, classCode).',
        },
        { status: 400 }
      )
    }

    if (!VALID_GENDERS.includes(gender)) {
      return NextResponse.json(
        { ok: false, message: 'Jenis kelamin tidak valid.' },
        { status: 400 }
      )
    }

    if (!VALID_CLASSES.includes(classCode)) {
      return NextResponse.json(
        { ok: false, message: 'Kelas/profesi tidak valid.' },
        { status: 400 }
      )
    }

    const trimmedName = String(name).trim()
    if (trimmedName.length < 2 || trimmedName.length > 24) {
      return NextResponse.json(
        { ok: false, message: 'Nama karakter harus 2-24 karakter.' },
        { status: 400 }
      )
    }

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json(
        { ok: false, message: 'User tidak ditemukan.' },
        { status: 404 }
      )
    }

    // Upsert: one character per user
    const character = await db.character.upsert({
      where: { userId },
      update: { name: trimmedName, gender, classCode },
      create: {
        userId,
        name: trimmedName,
        gender,
        classCode,
      },
    })

    return NextResponse.json({
      ok: true,
      message: 'Karakter berhasil dibuat!',
      character: {
        id: character.id,
        userId: character.userId,
        name: character.name,
        gender: character.gender,
        classCode: character.classCode,
      },
    })
  } catch (err) {
    console.error('[character POST] error', err)
    return NextResponse.json(
      { ok: false, message: 'Gagal membuat karakter.' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await req.json()
    if (!userId) {
      return NextResponse.json(
        { ok: false, message: 'userId wajib diisi.' },
        { status: 400 }
      )
    }

    await db.character.deleteMany({ where: { userId } })

    return NextResponse.json({
      ok: true,
      message: 'Karakter telah dihapus. Buat karakter baru.',
    })
  } catch (err) {
    console.error('[character DELETE] error', err)
    return NextResponse.json(
      { ok: false, message: 'Gagal menghapus karakter.' },
      { status: 500 }
    )
  }
}
