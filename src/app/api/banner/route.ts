import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const banner = await db.eventBanner.findFirst({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      ok: true,
      banner: banner
        ? {
            id: banner.id,
            imageData: banner.imageData,
            title: banner.title,
            uploadedBy: banner.uploadedBy,
            createdAt: banner.createdAt,
          }
        : null,
    })
  } catch (err) {
    console.error('[banner GET] error', err)
    return NextResponse.json(
      { ok: false, message: 'Gagal memuat banner event.' },
      { status: 500 }
    )
  }
}
