'use client'

import { BatikBackground } from '@/components/nusantara/batik-background'
import { BannerSection } from '@/components/nusantara/banner-section'
import { GameContainer } from '@/components/nusantara/game-container'
import { MapPin } from 'lucide-react'

export default function Home() {
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-start px-4 pt-6 pb-10 sm:py-10">
      <BatikBackground />

      <div className="w-full max-w-2xl flex flex-col items-center nus-fade-up">
        {/* Banner + GM controls */}
        <div className="w-full max-w-md">
          <BannerSection />
        </div>

        {/* Title section */}
        <div className="mt-8 mb-5 text-center">
          <h1 className="nus-title text-5xl sm:text-6xl font-bold text-[#f0f0f0] drop-shadow-[0_2px_18px_rgba(240,165,0,0.25)]">
            Nusantara
          </h1>
          <div className="mt-1.5 flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#c5a059]" />
            <p className="nus-serif text-xs sm:text-sm tracking-[0.35em] uppercase text-[#c5a059]">
              Petualangan Tanah Jawa
            </p>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#c5a059]" />
          </div>
          <p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-[#6b7280]">
            <MapPin className="h-3 w-3" />
            Kerajaan Mataram Kuno · Abad ke-8
          </p>
        </div>

        {/* Game container — handles login → character creation → game world */}
        <GameContainer />

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-[10px] text-[#6b7280] tracking-wide">
            Created by briqvan 2026 · Setiap petualangan
            dimulai dengan satu langkah
          </p>
        </footer>
      </div>
    </main>
  )
}
