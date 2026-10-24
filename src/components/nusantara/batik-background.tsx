'use client'

/**
 * BatikBackground —
 * Layered dark Nusantara backdrop:
 *  - batik parang diagonal pattern (CSS class nus-batik-bg)
 *  - slow-rotating wayang sun behind the card
 *  - floating embers (dust motes) drifting upward
 *  - top & bottom vignette
 *
 * Ember positions use a deterministic pseudo-random sequence (seeded by index)
 * so the server-rendered HTML matches the client — no hydration mismatch,
 * and no setState-in-effect lint violation.
 */
const EMBER_COUNT = 14

// Deterministic pseudo-random in [0, 1) from an integer seed.
function seeded(n: number): number {
  const x = Math.sin(n * 99.13 + 7.7) * 43758.5453
  return x - Math.floor(x)
}

const EMBERS = Array.from({ length: EMBER_COUNT }).map((_, i) => ({
  id: i,
  left: Math.round(seeded(i) * 10000) / 100,
  bottom: Math.round(seeded(i + 100) * 4000) / 100,
  delay: Math.round(seeded(i + 200) * 800) / 100,
  duration: Math.round((7 + seeded(i + 300) * 6) * 100) / 100,
  size: Math.round((2 + seeded(i + 400) * 3) * 100) / 100,
}))

export function BatikBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden nus-batik-bg">
      {/* wayang-style slow rotating sun */}
      <div
        className="nus-spin-slow absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2"
        aria-hidden
      >
        <div
          className="rounded-full"
          style={{
            width: '720px',
            height: '720px',
            background:
              'conic-gradient(from 0deg, rgba(197,160,89,0.10) 0deg, rgba(197,160,89,0) 30deg, rgba(197,160,89,0.08) 60deg, rgba(197,160,89,0) 90deg, rgba(197,160,89,0.10) 120deg, rgba(197,160,89,0) 150deg, rgba(197,160,89,0.08) 180deg, rgba(197,160,89,0) 210deg, rgba(197,160,89,0.10) 240deg, rgba(197,160,89,0) 270deg, rgba(197,160,89,0.08) 300deg, rgba(197,160,89,0) 330deg, rgba(197,160,89,0.10) 360deg)',
            maskImage:
              'radial-gradient(circle, black 0%, black 45%, transparent 70%)',
            WebkitMaskImage:
              'radial-gradient(circle, black 0%, black 45%, transparent 70%)',
          }}
        />
      </div>

      {/* floating embers */}
      {EMBERS.map((e) => (
        <span
          key={e.id}
          className="nus-ember"
          style={{
            left: `${e.left}%`,
            bottom: `${e.bottom}%`,
            width: `${e.size}px`,
            height: `${e.size}px`,
            animationDelay: `${e.delay}s`,
            animationDuration: `${e.duration}s`,
          }}
        />
      ))}

      {/* top vignette */}
      <div
        className="absolute inset-x-0 top-0 h-40"
        style={{
          background:
            'linear-gradient(180deg, rgba(17,21,31,0.95) 0%, rgba(17,21,31,0) 100%)',
        }}
      />
      {/* bottom vignette */}
      <div
        className="absolute inset-x-0 bottom-0 h-48"
        style={{
          background:
            'linear-gradient(0deg, rgba(17,21,31,0.95) 0%, rgba(17,21,31,0) 100%)',
        }}
      />
    </div>
  )
}
