'use client'

import { useState } from 'react'
import { Upload, Trash2, ShieldCheck, Image as ImageIcon, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface GmUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 'upload' | 'delete' */
  mode: 'upload' | 'delete'
  onSuccess: () => void
}

export function GmUploadDialog({
  open,
  onOpenChange,
  mode,
  onSuccess,
}: GmUploadDialogProps) {
  const [password, setPassword] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const reset = () => {
    setPassword('')
    setFile(null)
    setPreview(null)
  }

  const handleFile = (f: File | null) => {
    if (!f) {
      setFile(null)
      setPreview(null)
      return
    }
    if (!f.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'File tidak valid',
        description: 'Hanya file gambar yang diperbolehkan.',
      })
      return
    }
    if (f.size > 4 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'Ukuran terlalu besar',
        description: 'Maksimal 4MB per gambar.',
      })
      return
    }
    setFile(f)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(f)
  }

  const handleSubmit = async () => {
    if (!password) {
      toast({
        variant: 'destructive',
        title: 'Kata sandi GM wajib diisi',
        description: 'Masukkan kata sandi GM untuk melanjutkan.',
      })
      return
    }

    if (mode === 'upload' && !file) {
      toast({
        variant: 'destructive',
        title: 'Gambar belum dipilih',
        description: 'Pilih gambar event untuk diunggah.',
      })
      return
    }

    setLoading(true)
    try {
      if (mode === 'delete') {
        const res = await fetch('/api/banner/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        })
        const data = await res.json()
        if (!res.ok || !data.ok) {
          throw new Error(data.message || 'Gagal menghapus banner')
        }
        toast({
          title: 'Banner dihapus',
          description: data.message,
        })
      } else {
        // upload
        const res = await fetch('/api/banner/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            password,
            imageData: preview,
            title: file?.name || 'Event Banner',
          }),
        })
        const data = await res.json()
        if (!res.ok || !data.ok) {
          throw new Error(data.message || 'Gagal mengunggah banner')
        }
        toast({
          title: 'Banner diperbarui',
          description: data.message,
        })
      }

      reset()
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description:
          err instanceof Error ? err.message : 'Terjadi kesalahan tidak dikenal.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset()
        onOpenChange(v)
      }}
    >
      <DialogContent className="bg-[#1f2533] border-[#3a4259] text-[#f0f0f0] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 nus-serif text-[#f0a500]">
            <ShieldCheck className="h-5 w-5" />
            {mode === 'upload' ? 'Unggah Banner Event' : 'Hapus Banner Event'}
          </DialogTitle>
          <DialogDescription className="text-[#a0a6b8]">
            Area terbatas — khusus Game Master. Masukkan kata sandi GM untuk
            melanjutkan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {mode === 'upload' && (
            <div className="space-y-2">
              <Label htmlFor="gm-banner-file" className="text-[#a0a6b8]">
                Gambar Event
              </Label>
              <label
                htmlFor="gm-banner-file"
                className="group flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#3e475e] bg-[#2d3548]/40 px-4 py-6 cursor-pointer hover:border-[#c5a059] transition-colors"
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Pratinjau banner"
                    className="max-h-32 w-full object-cover rounded-md border border-[#3e475e]"
                  />
                ) : (
                  <>
                    <ImageIcon className="h-8 w-8 text-[#6b7280] group-hover:text-[#c5a059] transition-colors" />
                    <span className="text-xs text-[#a0a6b8] text-center">
                      Klik untuk memilih gambar
                      <br />
                      <span className="text-[#6b7280]">PNG / JPG, maks 4MB</span>
                    </span>
                  </>
                )}
                <input
                  id="gm-banner-file"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="gm-password" className="text-[#a0a6b8]">
              Kata Sandi GM
            </Label>
            <Input
              id="gm-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="nus-input border-[#3e475e]"
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit()
              }}
            />
            <p className="text-[11px] text-[#6b7280]">
              Sandi ini diberikan kepada Game Master resmi Nusantara.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="nus-btn-ghost border-[#3e475e] h-10 px-4 rounded-md text-sm font-medium inline-flex items-center justify-center gap-2"
            disabled={loading}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="nus-btn-primary h-10 px-4 rounded-md text-sm font-bold inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Memproses…
              </>
            ) : mode === 'upload' ? (
              <>
                <Upload className="h-4 w-4" />
                Unggah Banner
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Hapus Banner
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
