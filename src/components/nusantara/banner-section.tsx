'use client'

import { useEffect, useState } from 'react'
import { Upload, Trash2, Crown, Loader2 } from 'lucide-react'
import { GmUploadDialog } from './gm-upload-dialog'

interface BannerData {
  id: string
  imageData: string
  title: string | null
  uploadedBy: string | null
  createdAt: string
}

export function BannerSection() {
  const [banner, setBanner] = useState<BannerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'upload' | 'delete'>('upload')

  const fetchBanner = async () => {
    try {
      const res = await fetch('/api/banner', { cache: 'no-store' })
      const data = await res.json()
      if (data.ok && data.banner) {
        setBanner(data.banner)
      } else {
        setBanner(null)
      }
    } catch {
      setBanner(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBanner()
  }, [])

  const openUpload = () => {
    setDialogMode('upload')
    setDialogOpen(true)
  }
  const openDelete = () => {
    setDialogMode('delete')
    setDialogOpen(true)
  }

  return (
    <div className="w-full">
      {/* Banner frame */}
      <div className="nus-banner-glow relative overflow-hidden rounded-xl border border-[#3a4259]">
        <div className="aspect-[16/7] w-full bg-[#1f2533]">
          {loading ? (
            <div className="flex h-full w-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#c5a059]" />
            </div>
          ) : banner ? (
            <img
              src={banner.imageData}
              alt={banner.title || 'Banner Event Nusantara'}
              className="h-full w-full object-cover"
            />
          ) : (
            <img
              src="/banner-default.png"
              alt="Banner Petualangan Nusantara"
              className="h-full w-full object-cover"
            />
          )}
        </div>

        {/* gradient overlay for legibility */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(17,21,31,0) 60%, rgba(17,21,31,0.75) 100%)',
          }}
        />

        {/* banner label */}
        {banner && (
          <div className="absolute bottom-2 left-3 right-3 flex items-center gap-2 text-xs text-[#f0f0f0]">
            <Crown className="h-3.5 w-3.5 text-[#f0a500]" />
            <span className="nus-serif tracking-wide">
              {banner.title || 'Event Aktif'}
            </span>
            <span className="ml-auto text-[10px] text-[#a0a6b8]">
              oleh {banner.uploadedBy || 'GM'}
            </span>
          </div>
        )}
      </div>

      {/* GM controls */}
      <div className="mt-2 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={openUpload}
          className="inline-flex items-center gap-1.5 rounded-md border border-[#3e475e] bg-[#2d3548]/60 px-2.5 py-1 text-[11px] text-[#a0a6b8] transition-colors hover:border-[#c5a059] hover:text-[#f0f0f0]"
        >
          <Upload className="h-3 w-3" />
          Upload GM
        </button>
        <button
          type="button"
          onClick={openDelete}
          disabled={!banner && !loading}
          className="inline-flex items-center gap-1.5 rounded-md border border-[#3e475e] bg-[#2d3548]/60 px-2.5 py-1 text-[11px] text-[#a0a6b8] transition-colors hover:border-[#c5a059] hover:text-[#f0f0f0] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 className="h-3 w-3" />
          Delete Banner
        </button>
      </div>

      <GmUploadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        onSuccess={fetchBanner}
      />
    </div>
  )
}
