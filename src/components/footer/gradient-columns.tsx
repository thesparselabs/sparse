"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type Rgb = readonly [number, number, number];

/** A little underdamped, so a column overshoots once and settles. */
const STIFFNESS = 90;
const DAMPING = 13;
/** How close to the top of the band the pointer can pull a column. */
const PULL = 0.92;

const WHITE: Rgb = [255, 255, 255];

const mix = (a: Rgb, b: Rgb, t: number): Rgb => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

const rgba = ([r, g, b]: Rgb, alpha = 1) =>
  `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;

/**
 * Canvas can't read var(), so each token is resolved to RGB by painting it
 * into a 1x1 canvas. The browser does the parsing, which matters: the build
 * emits these tokens as lab(), not the oklch() written in globals.css.
 */
function readPalette() {
  const probe = document
    .createElement("canvas")
    .getContext("2d", { willReadFrequently: true });
  const styles = getComputedStyle(document.documentElement);

  const color = (token: string, fallback: Rgb): Rgb => {
    const value = styles.getPropertyValue(token).trim();
    if (!probe || !value) return fallback;
    probe.fillStyle = "#010203";
    probe.fillStyle = value;
    // An unparseable value leaves fillStyle untouched.
    if (probe.fillStyle === "#010203") return fallback;
    probe.clearRect(0, 0, 1, 1);
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return [r, g, b];
  };

  return {
    primary: color("--primary", [106, 141, 216]),
    surface: color("--background", [11, 11, 11]),
    sheen: document.documentElement.classList.contains("dark") ? 0.14 : 0.24,
  };
}

/**
 * A skyline of gradient columns on springs: they swell slowly on their own and
 * rise to meet the pointer anywhere over `children`. Our own take on the
 * "gradient stripes" idea (Wensity sells one as a Pro component); written from
 * scratch, so nothing licensed ends up in this public repo.
 *
 * Colour is --primary only, lit toward white at the tip and dissolving into
 * --background at the floor, re-read whenever the theme flips. Reduced motion
 * gets one still frame.
 */
export function GradientColumns({
  children,
  className,
  stageClassName,
  columnWidth = 40,
  restHeight = 0.38,
  swell = 0.16,
  reach = 140,
}: {
  children?: ReactNode;
  className?: string;
  /** The band the columns live in. Its height is the skyline's. */
  stageClassName?: string;
  /** Target width of one column slot, in px; the count follows the width. */
  columnWidth?: number;
  /** Resting height, as a fraction of the band. */
  restHeight?: number;
  /** How far the idle swell moves a column, as a fraction of the band. */
  swell?: number;
  /** Horizontal radius of the pointer's pull, in px. */
  reach?: number;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!root || !canvas || !ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let palette = readPalette();
    let width = 0;
    let height = 0;
    let dpr = 1;
    let count = 0;
    let heights = new Float32Array(0);
    let velocities = new Float32Array(0);
    const pointer = { active: false, x: 0, lift: 0 };

    const idle = (i: number, t: number) =>
      restHeight +
      swell *
        (0.6 * Math.sin(t * 0.8 + i * 0.55) +
          0.4 * Math.sin(t * 0.31 - i * 0.23));

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      if (!count || !height) return;

      const slot = width / count;
      const gap = Math.max(2, slot * 0.2);
      const w = slot - gap;
      const r = w / 2;

      for (let i = 0; i < count; i++) {
        const h = Math.min(Math.max(heights[i], w), height);
        const x = i * slot + gap / 2;
        const y = height - h;

        ctx.beginPath();
        ctx.moveTo(x, height);
        ctx.lineTo(x, y + r);
        ctx.arc(x + r, y + r, r, Math.PI, 0);
        ctx.lineTo(x + w, height);
        ctx.closePath();

        // Lit tip, brighter the higher the column stands; root dissolves into
        // the surface, so the skyline rises out of the page.
        const body = ctx.createLinearGradient(0, y, 0, height);
        body.addColorStop(0, rgba(mix(palette.primary, WHITE, 0.15 + 0.45 * (h / height))));
        body.addColorStop(0.4, rgba(palette.primary, 0.85));
        body.addColorStop(1, rgba(palette.surface, 0));
        ctx.fillStyle = body;
        ctx.fill();

        // Glass sheen across the width. source-atop keeps it inside the
        // column and lets it fade out with the body toward the floor.
        const sheen = ctx.createLinearGradient(x, 0, x + w, 0);
        sheen.addColorStop(0, rgba(WHITE, 0));
        sheen.addColorStop(0.32, rgba(WHITE, palette.sheen));
        sheen.addColorStop(0.62, rgba(WHITE, 0));
        ctx.globalCompositeOperation = "source-atop";
        ctx.fillStyle = sheen;
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      const next = Math.max(8, Math.round(width / columnWidth));
      if (next === count) return;
      // First layout starts flat so the skyline rises into view; later
      // re-counts (a resize) start at rest instead of replaying that.
      const t = performance.now() / 1000;
      heights = Float32Array.from({ length: next }, (_, i) =>
        count === 0 && !reduceMotion ? 0 : idle(i, t) * height,
      );
      velocities = new Float32Array(next);
      count = next;
    };

    let raf = 0;
    let last = 0;

    const frame = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 0;
      last = now;
      const t = now / 1000;
      const slot = width / count;

      for (let i = 0; i < count; i++) {
        let target = idle(i, t) * height;
        if (pointer.active && pointer.lift > target) {
          const distance = ((i + 0.5) * slot - pointer.x) / reach;
          target += (pointer.lift - target) * Math.exp(-distance * distance);
        }
        velocities[i] +=
          (STIFFNESS * (target - heights[i]) - DAMPING * velocities[i]) * dt;
        heights[i] += velocities[i] * dt;
      }

      draw();
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.active = true;
      pointer.x = event.clientX - rect.left;
      // Rise to the pointer's height; from above the band, reach for its top.
      pointer.lift =
        Math.min(Math.max(rect.bottom - event.clientY, 0), height) * PULL;
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reduceMotion) draw();
    });
    resizeObserver.observe(canvas);

    // Only animate while the footer is on screen.
    const visibility = new IntersectionObserver(([entry]) => {
      if (reduceMotion) return;
      if (entry.isIntersecting) start();
      else stop();
    });
    visibility.observe(root);

    // next-themes flips a class on <html>; follow it.
    const theme = new MutationObserver(() => {
      palette = readPalette();
      if (reduceMotion) draw();
    });
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    if (!reduceMotion) {
      root.addEventListener("pointermove", onPointerMove);
      root.addEventListener("pointerleave", onPointerLeave);
      root.addEventListener("pointercancel", onPointerLeave);
    }

    return () => {
      stop();
      resizeObserver.disconnect();
      visibility.disconnect();
      theme.disconnect();
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
      root.removeEventListener("pointercancel", onPointerLeave);
    };
  }, [columnWidth, restHeight, swell, reach]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {children}
      <div
        aria-hidden
        className={cn("pointer-events-none relative h-40", stageClassName)}
      >
        <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      </div>
    </div>
  );
}
