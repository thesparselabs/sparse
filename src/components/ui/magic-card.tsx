"use client"

import { useCallback, type ReactNode } from "react"
import { motion, useMotionTemplate, useMotionValue } from "motion/react"

import { cn } from "@/lib/utils"

interface MagicCardProps {
  children?: ReactNode
  className?: string
  /** Classes for the inner surface. Match it to whatever the card sits on. */
  surfaceClassName?: string
  /** Diameter of the spotlight, in px. */
  gradientSize?: number
  /** Fill of the spotlight inside the card. */
  gradientColor?: string
  /** The border lights up from this colour... */
  gradientFrom?: string
  /** ...through this one, fading into --border at the edge of the spotlight. */
  gradientTo?: string
}

/**
 * Magic UI's MagicCard (magicui.design/r/magic-card), gradient mode only.
 *
 * Upstream defaults to hardcoded purple/pink hexes and reads next-themes to
 * pick a blend mode for its "orb" variant. Both are gone: the spotlight and the
 * lit border are mixed from --primary, so the card re-themes with globals.css
 * and needs no theme lookup — which also removes upstream's mounted-state
 * effect and the hydration flash it caused.
 *
 * Pointer-only by nature. On touch the card is simply a bordered surface,
 * which is why nothing important lives in the effect.
 */
export function MagicCard({
  children,
  className,
  surfaceClassName = "bg-card",
  gradientSize = 220,
  gradientColor = "color-mix(in oklab, var(--primary) 12%, transparent)",
  gradientFrom = "var(--primary)",
  gradientTo = "color-mix(in oklab, var(--primary), transparent 55%)",
}: MagicCardProps) {
  const mouseX = useMotionValue(-gradientSize)
  const mouseY = useMotionValue(-gradientSize)

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect()
      mouseX.set(event.clientX - rect.left)
      mouseY.set(event.clientY - rect.top)
    },
    [mouseX, mouseY]
  )

  const reset = useCallback(() => {
    mouseX.set(-gradientSize)
    mouseY.set(-gradientSize)
  }, [mouseX, mouseY, gradientSize])

  const border = useMotionTemplate`
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
      ${gradientFrom},
      ${gradientTo},
      var(--border) 100%
    )
  `
  const spotlight = useMotionTemplate`
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
      ${gradientColor},
      transparent 100%
    )
  `

  return (
    <motion.div
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      className={cn(
        "group relative isolate overflow-hidden rounded-xl bg-border",
        className
      )}
      style={{ background: border }}
    >
      {/* The 1px gap around this surface is the border. */}
      <div
        className={cn(
          "absolute inset-px z-0 rounded-[inherit]",
          surfaceClassName
        )}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-px z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: spotlight }}
      />
      <div className="relative z-20 h-full">{children}</div>
    </motion.div>
  )
}
