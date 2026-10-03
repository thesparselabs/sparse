"use client"

import { motion, type MotionStyle, type Transition } from "motion/react"

import { cn } from "@/lib/utils"

interface BorderBeamProps {
  /** Length of the beam, in px. */
  size?: number
  /** Seconds per lap. */
  duration?: number
  /** Seconds to offset the start by. */
  delay?: number
  /** Head of the beam. */
  colorFrom?: string
  /** Tail of the beam, before it fades out. */
  colorTo?: string
  transition?: Transition
  className?: string
  style?: React.CSSProperties
  reverse?: boolean
  /** Starting position along the border, 0–100. */
  initialOffset?: number
  borderWidth?: number
}

/**
 * Magic UI's BorderBeam (magicui.design/r/border-beam). The only change from
 * upstream is the default colours: the orange/purple hexes became --primary
 * and a lighter mix of it, so the beam belongs to the theme rather than
 * bringing its own. Hidden under reduced motion — a light that laps a border
 * forever is decoration and nothing else.
 */
export const BorderBeam = ({
  className,
  size = 50,
  delay = 0,
  duration = 6,
  colorFrom = "var(--primary)",
  colorTo = "color-mix(in oklab, var(--primary), white 45%)",
  transition,
  style,
  reverse = false,
  initialOffset = 0,
  borderWidth = 1,
}: BorderBeamProps) => {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[inherit] border-(length:--border-beam-width) border-transparent mask-[linear-gradient(transparent,transparent),linear-gradient(#000,#000)] mask-intersect [mask-clip:padding-box,border-box] motion-reduce:hidden"
      style={
        {
          "--border-beam-width": `${borderWidth}px`,
        } as React.CSSProperties
      }
    >
      <motion.div
        className={cn(
          "absolute aspect-square",
          "bg-linear-to-l from-(--color-from) via-(--color-to) to-transparent",
          className
        )}
        style={
          {
            width: size,
            offsetPath: `rect(0 auto auto 0 round ${size}px)`,
            "--color-from": colorFrom,
            "--color-to": colorTo,
            ...style,
          } as MotionStyle
        }
        initial={{ offsetDistance: `${initialOffset}%` }}
        animate={{
          offsetDistance: reverse
            ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
            : [`${initialOffset}%`, `${100 + initialOffset}%`],
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration,
          delay: -delay,
          ...transition,
        }}
      />
    </div>
  )
}
