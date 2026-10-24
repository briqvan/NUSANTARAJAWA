'use client'

import { useState, useEffect } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  Swords,
  Sparkles,
  Crosshair,
  Wand2,
  User,
  UserCheck,
} from 'lucide-react'
import { Stepper } from './stepper'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

export interface CharacterData {
  id?: string
  userId: string
  name: string
  gender: 'male' | 'female'
  classCode: 'ksatria' | 'pendekar' | 'dukun' | 'pemanah'
}

interface CharacterCreationProps {
  user: { id: string; name: string; email: string; provider: string }
  onComplete: (char: CharacterData) => void
  onBack: () => void
}

const TOTAL_STEPS = 3
const STEP_LABELS = ['Kelamin', 'Kelas', 'Nama']

interface GenderOption {
  code: 'male' | 'female'
  label: string
  image: string
  topText: string
  bottomText: string
}

const GENDERS: GenderOption[] = [
  {
    code: 'male',
    label: 'Laki-laki',
    image: '/char-male.png',
    topText: 'KARAKTER LAKI-LAKI',
    bottomText: 'PEMAIN LAKI-LAKI',
  },
  {
    code: 'female',
    label: 'Perempuan',
    image: '/char-female.png',
    topText: 'KARAKTER PEREMPUAN',
    bottomText: 'PEMAIN PEREMPUAN',
  },
]

interface ClassOption {
  code: 'ksatria' | 'pendekar' | 'dukun' | 'pemanah'
  label: string
  image: string
  description: string
  stats: { label: string; value: number }[]
  icon: React.ComponentType<{ className?: string }>
}

const CLASSES: ClassOption[] = [
  {
    code: 'ksatria',
    label: 'Ksatria',
    image: '/class-ksatria.png',
    description:
      'Kesatria kerajaan dengan baju zirah dan keris pusaka. Tangguh di garis depan, setia pada sumpah dan dharma.',
    stats: [
      { label: 'STR', value: 9 },
      { label: 'VIT', value: 8 },
      { label: 'AGI', value: 4 },
      { label: 'INT', value: 3 },
    ],
    icon: Swords,
  },
  {
    code: 'pendekar',
    label: 'Pendekar',
    image: '/class-pendekar.png',
    description:
      'Master silat dengan tonggak bambu lincah. Seimbang antara serangan cepat dan pertahanan, ahli beladiri kuno.',
    stats: [
      { label: 'STR', value: 6 },
      { label: 'VIT', value: 6 },
      { label: 'AGI', value: 8 },
      { label: 'INT', value: 5 },
    ],
    icon: User,
  },
  {
    code: 'dukun',
    label: 'Dukun',
    image: '/class-dukun.png',
    description:
      'Penyembuh dan pemanggil roh Nusantara. Mengendalikan kekuatan gaib, mantera, dan ramuan kuno.',
    stats: [
      { label: 'STR', value: 3 },
      { label: 'VIT', value: 5 },
      { label: 'AGI', value: 5 },
      { label: 'INT', value: 10 },
    ],
    icon: Wand2,
  },
  {
    code: 'pemanah',
    label: 'Pemanah',
    image: '/class-pemanah.png',
    description:
      'Pemburu hutan dengan busur bambu recurve. Mematikan dari jarak jauh, ahli merayap dan menembus rimba.',
    stats: [
      { label: 'STR', value: 5 },
      { label: 'VIT', value: 4 },
      { label: 'AGI', value: 10 },
      { label: 'INT', value: 6 },
    ],
    icon: Crosshair,
  },
]

export function CharacterCreation({ user, onComplete, onBack }: CharacterCreationProps) {
  const [step, setStep] = useState(1)
  const [gender, setGender] = useState<'male' | 'female' | null>(null)
  const [classCode, setClassCode] = useState<ClassOption['code'] | null>(null)
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [nameChecking, setNameChecking] = useState(false)
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null)
  const { toast } = useToast()

  // Check name availability with debounce
  useEffect(() => {
    if (name.trim().length < 2) {
      setNameAvailable(null)
      return
    }
    setNameChecking(true)
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/character/check-name?name=${encodeURIComponent(name.trim())}`)
        const data = await res.json()
        setNameAvailable(data.available)
      } catch {
        setNameAvailable(null)
      } finally {
        setNameChecking(false)
      }
    }, 500)
    return () => clearTimeout(timeout)
  }, [name])

  const canNext = step === 1 ? !!gender : step === 2 ? !!classCode : (name.trim().length >= 2 && nameAvailable === true)

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1)
      return
    }
    // Final step — submit
    if (!gender || !classCode || name.trim().length < 2) {
      toast({
        variant: 'destructive',
        title: 'Lengkapi data',
        description: 'Pilih kelamin, kelas, dan masukkan nama karakter.',
      })
      return
    }

    setSubmitting(true)
    fetch('/api/character', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        name: name.trim(),
        gender,
        classCode,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok) throw new Error(data.message || 'Gagal')
        toast({
          title: 'Karakter siap!',
          description: `${name.trim()} sang ${CLASSES.find((c) => c.code === classCode)?.label} telah lahir di Nusantara.`,
        })
        onComplete({
          id: data.character?.id,
          userId: user.id,
          name: name.trim(),
          gender,
          classCode,
        })
      })
      .catch((err) => {
        toast({
          variant: 'destructive',
          title: 'Gagal membuat karakter',
          description: err instanceof Error ? err.message : 'Terjadi kesalahan.',
        })
      })
      .finally(() => setSubmitting(false))
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((s) => s - 1)
    } else {
      onBack()
    }
  }

  return (
    <div className="w-full max-w-2xl nus-fade-up">
      <div className="nus-card-frame rounded-2xl p-6 sm:p-8">
        <div className="relative">
          <span className="nus-corner tl" />
          <span className="nus-corner tr" />
          <span className="nus-corner bl" />
          <span className="nus-corner br" />

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="nus-title text-3xl sm:text-4xl font-bold text-[#f0f0f0] drop-shadow-[0_2px_14px_rgba(240,165,0,0.25)]">
              Buat Karaktermu
            </h2>
            <div className="mt-1.5 flex items-center justify-center gap-2">
              <span className="h-px w-6 bg-gradient-to-r from-transparent to-[#c5a059]" />
              <p className="nus-serif text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#c5a059]">
                Pendekar Baru Nusantara
              </p>
              <span className="h-px w-6 bg-gradient-to-l from-transparent to-[#c5a059]" />
            </div>
          </div>

          {/* Stepper */}
          <div className="mb-8">
            <Stepper current={step} total={TOTAL_STEPS} labels={STEP_LABELS} />
          </div>

          {/* Step instruction */}
          <p className="text-center text-sm text-[#a0a6b8] mb-2 min-h-[1.5rem]">
            {step === 1 && 'Pilih jenis kelamin karaktermu'}
            {step === 2 && 'Pilih jalan atau profesi yang kau ikuti'}
            {step === 3 && 'Berikan nama untuk pendekar baru ini'}
          </p>
          {/* Hint to click a card when nothing is selected yet */}
          {((step === 1 && !gender) || (step === 2 && !classCode)) && (
            <p className="text-center text-[11px] text-[#c5a059] mb-5 animate-pulse nus-serif tracking-wide">
              ↓ Klik salah satu kartu di bawah untuk memilih ↓
            </p>
          )}
          {((step === 1 && gender) || (step === 2 && classCode) || step === 3) && (
            <div className="mb-5" />
          )}

          {/* ===== Step 1: Gender ===== */}
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 nus-fade-up">
              {GENDERS.map((g) => {
                const selected = gender === g.code
                return (
                  <button
                    key={g.code}
                    type="button"
                    onClick={() => setGender(g.code)}
                    className={`group relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selected
                        ? 'border-[#f0a500] shadow-[0_0_0_3px_rgba(240,165,0,0.18),0_12px_30px_-10px_rgba(240,165,0,0.45)]'
                        : 'border-[#3a4259] hover:border-[#c5a059]/60 hover:bg-[#1f2533]/80'
                    }`}
                  >
                    {/* Selected checkmark */}
                    {selected && (
                      <div className="absolute top-3 right-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-[#f0a500] text-[#1a1207] shadow-lg">
                        <Check className="h-4 w-4" strokeWidth={3} />
                      </div>
                    )}

                    <div className="aspect-[4/5] relative bg-[#1f2533]">
                      <img
                        src={g.image}
                        alt={g.label}
                        className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                          selected ? 'opacity-100' : 'opacity-80'
                        }`}
                      />
                      {/* Top text overlay */}
                      <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/80 to-transparent">
                        <p className="text-[10px] sm:text-xs tracking-[0.2em] text-[#c5a059] font-semibold uppercase">
                          {g.topText}
                        </p>
                      </div>
                      {/* Bottom text overlay */}
                      <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/85 to-transparent">
                        <p className="nus-serif text-base sm:text-lg font-bold text-[#f0f0f0]">
                          {g.label}
                        </p>
                        <p className="text-[10px] tracking-[0.15em] text-[#a0a6b8] uppercase mt-0.5">
                          {g.bottomText}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* ===== Step 2: Class ===== */}
          {step === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 nus-fade-up">
              {CLASSES.map((c) => {
                const selected = classCode === c.code
                const Icon = c.icon
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setClassCode(c.code)}
                    className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left cursor-pointer transition-all duration-200 ${
                      selected
                        ? 'border-[#f0a500] bg-[#2d3548] shadow-[0_0_0_3px_rgba(240,165,0,0.18),0_12px_30px_-10px_rgba(240,165,0,0.45)]'
                        : 'border-[#3a4259] bg-[#1f2533] hover:border-[#c5a059] hover:bg-[#252b3b]'
                    }`}
                  >
                    {selected && (
                      <div className="absolute top-3 right-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-[#f0a500] text-[#1a1207] shadow-lg">
                        <Check className="h-4 w-4" strokeWidth={3} />
                      </div>
                    )}

                    <div className="flex gap-3">
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-[#3a4259] bg-[#0f1320]">
                        <img
                          src={c.image}
                          alt={c.label}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Icon
                            className={`h-4 w-4 ${selected ? 'text-[#f0a500]' : 'text-[#c5a059]'}`}
                          />
                          <h3
                            className={`nus-serif text-lg font-bold ${
                              selected ? 'text-[#f0a500]' : 'text-[#f0f0f0]'
                            }`}
                          >
                            {c.label}
                          </h3>
                        </div>
                        <p className="text-[11px] leading-snug text-[#a0a6b8] line-clamp-3">
                          {c.description}
                        </p>
                      </div>
                    </div>

                    {/* Stats bar */}
                    <div className="mt-3 grid grid-cols-4 gap-1.5">
                      {c.stats.map((s) => (
                        <div
                          key={s.label}
                          className="rounded-md border border-[#3a4259] bg-[#0f1320] px-1.5 py-1 text-center"
                        >
                          <p className="text-[9px] uppercase tracking-wider text-[#6b7280]">
                            {s.label}
                          </p>
                          <p className="text-sm font-bold text-[#c5a059]">{s.value}</p>
                        </div>
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* ===== Step 3: Name ===== */}
          {step === 3 && (
            <div className="nus-fade-up max-w-md mx-auto">
              {/* Summary preview */}
              <div className="mb-6 flex items-center gap-4 rounded-xl border border-[#3a4259] bg-[#1f2533] p-4">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-[#3a4259]">
                  <img
                    src={gender === 'male' ? GENDERS[0].image : GENDERS[1].image}
                    alt="Karakter"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#c5a059]">
                    Pratinjau
                  </p>
                  <p className="nus-serif text-lg font-bold text-[#f0f0f0]">
                    {CLASSES.find((c) => c.code === classCode)?.label}
                  </p>
                  <p className="text-xs text-[#a0a6b8]">
                    {gender === 'male' ? 'Laki-laki' : 'Perempuan'} · Pendekar
                    Nusantara
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="char-name" className="text-xs text-[#a0a6b8] flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5" />
                  Nama Karakter
                </Label>
                <Input
                  id="char-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="cth: Bujangga Manik, Srikandi, Jayanegara…"
                  className={`nus-input h-12 text-base nus-serif ${nameAvailable === false ? 'border-[#ef4444]' : nameAvailable === true ? 'border-[#22c55e]' : ''}`}
                  maxLength={24}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && canNext) handleNext()
                  }}
                />
                <div className="flex items-center justify-between text-[11px] text-[#6b7280]">
                  <span>2–24 karakter</span>
                  <span>{name.trim().length}/24</span>
                </div>
                {/* Name availability feedback */}
                {nameChecking && (
                  <p className="text-[11px] text-[#a0a6b8] flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Mengecek ketersediaan nama…
                  </p>
                )}
                {!nameChecking && nameAvailable === true && name.trim().length >= 2 && (
                  <p className="text-[11px] text-[#22c55e] font-semibold">✓ Nama tersedia!</p>
                )}
                {!nameChecking && nameAvailable === false && (
                  <p className="text-[11px] text-[#ef4444] font-semibold">✗ Nama sudah digunakan. Pilih nama lain.</p>
                )}
              </div>

              <p className="mt-5 text-center text-[11px] text-[#6b7280] italic">
                &ldquo;Sebuah nama adalah doa pertama yang diberikan orang tua
                kepada anaknya.&rdquo;
              </p>
            </div>
          )}

          {/* ===== Footer navigation ===== */}
          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className="nus-btn-ghost h-11 px-5 rounded-md text-sm font-semibold inline-flex items-center justify-center gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
              {step === 1 ? 'Kembali' : 'Sebelumnya'}
            </button>

            <div className="text-xs text-[#6b7280]">
              Langkah <span className="text-[#c5a059] font-semibold">{step}</span>{' '}
              dari {TOTAL_STEPS}
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={!canNext || submitting}
              className="nus-btn-primary h-11 px-6 rounded-md text-sm font-bold inline-flex items-center justify-center gap-1.5"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Membuat…
                </>
              ) : !canNext ? (
                <>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                  Pilih dulu untuk lanjut
                </>
              ) : step === TOTAL_STEPS ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  Mulai Petualangan
                </>
              ) : (
                <>
                  Lanjut
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
