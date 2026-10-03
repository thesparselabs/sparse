import { useId } from "react"

import { cn } from "@/lib/utils"

interface DotPatternProps extends React.SVGProps<SVGSVGElement> {
  /** Horizontal spacing between dots. @default 16 */
  width?: number
  /** Vertical spacing between dots. @default 16 */
  height?: number
  /** Offset of the whole pattern. @default 0 */
  x?: number
  y?: number
  /** Offset of each dot inside its tile. @default 1 */
  cx?: number
  cy?: number
  /** Dot radius. @default 1 */
  cr?: number
  className?: string
}

/**
 * Magic UI's DotPattern (magicui.design/r/dot-pattern), same props, drawn
 * with one SVG <pattern> instead of a measured grid of motion circles.
 *
 * Upstream measures its container in an effect and renders one animated
 * <circle> per dot — thousands of nodes for a full-width hero, a resize
 * listener, and nothing on screen until hydration. A pattern tile is one
 * node, renders on the server, and tiles itself at any size. The glow
 * variant went with it; nothing here used it.
 *
 * Dot colour is currentColor, so set it with a text-* class.
 */
export function DotPattern({
  width = 16,
  height = 16,
  x = 0,
  y = 0,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  ...props
}: DotPatternProps) {
  const id = useId()

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-current",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          patternContentUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <circle cx={cx} cy={cy} r={cr} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
    </svg>
  )
}
