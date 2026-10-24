'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Mail, Lock, Eye, EyeOff, User, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

type Tab = 'masuk' | 'daftar'

interface LoggedInUser {
  id: string
  email: string
  name: string
  provider: string
  role: string
  guest?: boolean
}

// Inline Google "G" logo (multi-color, official palette)
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  )
}

export function LoginForm({ onLogin }: { onLogin: (user: LoggedInUser) => void }) {
  const [tab, setTab] = useState<Tab>('masuk')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState<'email' | 'google' | 'guest' | null>(null)
  const [gName, setGName] = useState('')
  const [gEmail, setGEmail] = useState('')
  const { toast } = useToast()

  const reset = () => {
    setEmail('')
    setPassword('')
    setName('')
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Lengkapi data',
        description: 'Email dan kata sandi wajib diisi.',
      })
      return
    }

    setLoading('email')
    try {
      const endpoint =
        tab === 'masuk' ? '/api/auth/login' : '/api/auth/register'
      const body =
        tab === 'masuk'
          ? { email, password }
          : { email, password, name: name || undefined }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.message || 'Gagal')
      }

      toast({
        title: tab === 'masuk' ? 'Selamat datang kembali!' : 'Pendekar baru terdaftar!',
        description: data.message,
      })

      onLogin(data.user)
      reset()
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description:
          err instanceof Error ? err.message : 'Terjadi kesalahan.',
      })
    } finally {
      setLoading(null)
    }
  }

  const handleGuest = async () => {
    setLoading('guest')
    try {
      const res = await fetch('/api/auth/guest', { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.message || 'Gagal')
      toast({
        title: 'Masuk sebagai tamu',
        description: data.message,
      })
      onLogin(data.user)
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description: err instanceof Error ? err.message : 'Terjadi kesalahan.',
      })
    } finally {
      setLoading(null)
    }
  }

  const openGoogleDialog = () => {
    // Use NextAuth Google OAuth — redirect to Google login page
    // Use current window URL as callback so it works on any domain
    setLoading('google')
    const currentUrl = window.location.origin
    signIn('google', { callbackUrl: currentUrl }).catch(() => {
      setLoading(null)
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description: 'Tidak dapat terhubung ke Google. Pastikan GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET sudah dikonfigurasi di .env',
      })
    })
  }

  // ====== Login/Register form ======
  return (
    <div className="nus-card-frame rounded-2xl p-6 sm:p-8 w-full max-w-md nus-fade-up">
      <div className="relative">
        <span className="nus-corner tl" />
        <span className="nus-corner tr" />
        <span className="nus-corner bl" />
        <span className="nus-corner br" />

        {/* Tab navigation */}
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-[#1f2533] p-1 border border-[#3a4259]">
          <button
            type="button"
            onClick={() => setTab('masuk')}
            className={`nus-tab rounded-md py-2 text-sm font-semibold ${tab === 'masuk' ? 'nus-tab-active' : 'nus-tab-inactive'}`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => setTab('daftar')}
            className={`nus-tab rounded-md py-2 text-sm font-semibold ${tab === 'daftar' ? 'nus-tab-active' : 'nus-tab-inactive'}`}
          >
            Daftar
          </button>
        </div>

        <form onSubmit={handleEmailSubmit} className="mt-5 space-y-4">
          {tab === 'daftar' && (
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs text-[#a0a6b8]">
                Nama Pendekar
              </Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7280]" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama julukanmu di Nusantara"
                  className="nus-input pl-9 h-11"
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs text-[#a0a6b8]">
              Email
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7280]" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pendekar@nusantara.id"
                className="nus-input pl-9 h-11"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs text-[#a0a6b8]">
              Kata Sandi
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7280]" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="nus-input pl-9 pr-10 h-11"
                autoComplete={tab === 'masuk' ? 'current-password' : 'new-password'}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#c5a059] transition-colors"
                aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {tab === 'masuk' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  toast({
                    title: 'Lupa kata sandi?',
                    description:
                      'Hubungi Game Master untuk mereset kata sandi akunmu.',
                  })
                }
                className="text-[11px] text-[#a0a6b8] hover:text-[#c5a059] transition-colors"
              >
                Lupa kata sandi?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading !== null}
            className="nus-btn-primary w-full h-11 rounded-md text-sm font-bold inline-flex items-center justify-center gap-2"
          >
            {loading === 'email' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Memproses…
              </>
            ) : tab === 'masuk' ? (
              'Masuk ke Petualangan'
            ) : (
              'Daftar Menjadi Pendekar'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-5 nus-divider">
          <span>atau</span>
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={openGoogleDialog}
          disabled={loading !== null}
          className="nus-btn-google w-full h-11 rounded-md text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading === 'google' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <GoogleIcon className="h-4 w-4" />
          )}
          Masuk dengan Google
        </button>

        {/* Guest */}
        <button
          type="button"
          onClick={handleGuest}
          disabled={loading !== null}
          className="nus-btn-ghost w-full h-11 rounded-md text-sm font-semibold mt-2 inline-flex items-center justify-center gap-2"
        >
          {loading === 'guest' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <User className="h-4 w-4" />
          )}
          Main sebagai Tamu
        </button>

        <p className="mt-5 text-center text-[11px] text-[#6b7280]">
          Akun tamu hanya terbatas di perangkat ini
        </p>
      </div>
    </div>
  )
}
