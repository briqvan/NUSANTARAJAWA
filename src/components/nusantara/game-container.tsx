'use client'

import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import { LoginForm } from './login-form'
import { CharacterCreation, type CharacterData } from './character-creation'
import { GameWorld } from './game-world'
import { useToast } from '@/hooks/use-toast'

type AppPhase = 'login' | 'character-create' | 'game'

interface AppUser {
  id: string
  email: string
  name: string
  provider: string
  role?: string
  guest?: boolean
}

export function GameContainer() {
  const [phase, setPhase] = useState<AppPhase>('login')
  const [user, setUser] = useState<AppUser | null>(null)
  const [character, setCharacter] = useState<CharacterData | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // On mount: try to restore a session from localStorage (client-only),
  // or from the NextAuth session (e.g. after Google OAuth redirect).
  useEffect(() => {
    const finish = () => setLoading(false)
    try {
      const savedUser = localStorage.getItem('nusantara.user')
      const savedChar = localStorage.getItem('nusantara.character')
      if (savedUser) {
        const u = JSON.parse(savedUser) as AppUser
        setUser(u)
        if (savedChar) {
          const c = JSON.parse(savedChar) as CharacterData
          setCharacter(c)
          setPhase('game')
        } else {
          setPhase('character-create')
        }
        finish()
        return
      }
    } catch {
      /* ignore corrupt storage */
    }

    // No local session — check NextAuth (Google) session
    fetch('/api/auth/session', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.ok && data.user) {
          const u: AppUser = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            provider: data.user.provider || 'google',
            role: data.user.role,
          }
          setUser(u)
          // Check if user already has a character
          fetch(`/api/character?userId=${encodeURIComponent(u.id)}`, { cache: 'no-store' })
            .then((r) => r.json())
            .then((cdata) => {
              if (cdata.ok && cdata.character) {
                setCharacter(cdata.character)
                setPhase('game')
              } else {
                setPhase('character-create')
              }
            })
            .catch(() => setPhase('character-create'))
            .finally(finish)
        } else {
          finish()
        }
      })
      .catch(() => finish())
  }, [])

  // Persist user/character when they change
  useEffect(() => {
    if (user) {
      localStorage.setItem('nusantara.user', JSON.stringify(user))
    } else {
      localStorage.removeItem('nusantara.user')
    }
  }, [user])

  useEffect(() => {
    if (character) {
      localStorage.setItem('nusantara.character', JSON.stringify(character))
    } else {
      localStorage.removeItem('nusantara.character')
    }
  }, [character])

  const handleLogin = (u: AppUser) => {
    setUser(u)
    // Check if user already has a character
    fetch(`/api/character?userId=${encodeURIComponent(u.id)}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && data.character) {
          setCharacter(data.character)
          setPhase('game')
        } else {
          setPhase('character-create')
        }
      })
      .catch(() => setPhase('character-create'))
  }

  const handleCharacterComplete = (c: CharacterData) => {
    setCharacter(c)
    setPhase('game')
  }

  const handleLogout = () => {
    setUser(null)
    setCharacter(null)
    setPhase('login')
    try { signOut({ redirect: false }) } catch {}
    toast({
      title: 'Keluar',
      description: 'Kamu telah meninggalkan dunia Nusantara.',
    })
  }

  const handleDeleteCharacter = () => {
    if (!user) return
    fetch('/api/save', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    }).catch(() => {})
    fetch('/api/character', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok) throw new Error(data.message || 'Gagal')
        setCharacter(null)
        setPhase('character-create')
        toast({
          title: 'Karakter direset',
          description: 'Buat karakter baru untuk memulai petualangan lain.',
        })
      })
      .catch((err) => {
        toast({
          variant: 'destructive',
          title: 'Gagal',
          description: err instanceof Error ? err.message : 'Terjadi kesalahan.',
        })
      })
  }

  // Avoid SSR/CSR mismatch flash before localStorage is read
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-[#c5a059] nus-serif text-sm animate-pulse">
          Memuat Nusantara…
        </div>
      </div>
    )
  }

  if (!user || phase === 'login') {
    return <LoginForm onLogin={handleLogin} />
  }

  if (phase === 'character-create') {
    return (
      <CharacterCreation
        user={user}
        onComplete={handleCharacterComplete}
        onBack={() => {
          // Going back from character creation step 1 = logout
          handleLogout()
        }}
      />
    )
  }

  // phase === 'game'
  if (!character) {
    // safety: shouldn't happen
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <GameWorld
      user={user}
      character={character}
      onLogout={handleLogout}
      onDeleteCharacter={handleDeleteCharacter}
    />
  )
}
