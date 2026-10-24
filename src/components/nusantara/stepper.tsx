'use client'

import { Check } from 'lucide-react'

interface StepperProps {
  current: number // 1-indexed current step
  total: number
  labels: string[]
}

/**
 * Progress stepper with circular numbered nodes connected by a line.
 * - Completed steps: filled gold with checkmark
 * - Current step: filled gold with number, slightly larger, glowing
 * - Future steps: outlined dark with number
 */
export function Stepper({ current, total, labels }: StepperProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between relative">
        {/* Background connecting line */}
        <div className="absolute left-0 right-0 top-5 h-px bg-[#3a4259]" />
        {/* Progress fill line */}
        <div
          className="absolute left-0 top-5 h-px bg-gradient-to-r from-[#f0a500] to-[#c5a059] transition-all duration-500"
          style={{
            width: `${((Math.min(current, total) - 1) / (total - 1)) * 100}%`,
          }}
        />

        {Array.from({ length: total }).map((_, i) => {
          const stepNum = i + 1
          const isCompleted = stepNum < current
          const isCurrent = stepNum === current
          const isFuture = stepNum > current

          return (
            <div
              key={i}
              className="relative z-10 flex flex-col items-center gap-2"
            >
              <div
                className={`flex items-center justify-center rounded-full transition-all duration-300 ${
                  isCurrent
                    ? 'h-10 w-10 bg-gradient-to-b from-[#f0a500] to-[#e69500] text-[#1a1207] font-bold shadow-[0_0_0_4px_rgba(240,165,0,0.18),0_8px_20px_-6px_rgba(240,165,0,0.5)]'
                    : isCompleted
                    ? 'h-10 w-10 bg-gradient-to-b from-[#f0a500] to-[#e69500] text-[#1a1207] font-bold'
                    : 'h-10 w-10 bg-[#1f2533] border-2 border-[#3a4259] text-[#6b7280] font-bold'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" strokeWidth={3} />
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={`text-[10px] sm:text-xs font-medium tracking-wide uppercase transition-colors duration-300 ${
                  isCurrent
                    ? 'text-[#f0a500]'
                    : isCompleted
                    ? 'text-[#c5a059]'
                    : isFuture
                    ? 'text-[#6b7280]'
                    : 'text-[#a0a6b8]'
                }`}
              >
                {labels[i]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
