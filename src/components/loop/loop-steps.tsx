"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { createPortal } from "react-dom";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

import { MagicCard } from "@/components/ui/magic-card";
import { useMounted } from "@/hooks/use-mounted";

type LoopStep = {
  /**
   * Rendered literally rather than derived from the index, so the numeral is
   * greppable against docs/Idea.md when the script changes.
   */
  readonly marker: string;
  readonly title: string;
  readonly body: string;
};

/** docs/Idea.md §4, steps 1–4, transcribed verbatim. */
const STEPS: readonly LoopStep[] = [
  {
    marker: "01",
    title: "Notice",
    body: "We start from friction, not from ideas. Someone doing real work hits the same wall for the fourth time and works around it instead of complaining. That workaround is the brief.",
  },
  {
    marker: "02",
    title: "Cut",
    body: "Then we take things away. What is the smallest version that actually ends the problem? If the answer needs a roadmap, it’s the wrong problem or we haven’t understood it yet.",
  },
  {
    marker: "03",
    title: "Ship",
    body: "Fifteen days, and it goes out. Small enough to finish, real enough to use. Not a beta list, not a waitlist — a thing you can open.",
  },
  {
    marker: "04",
    title: "Listen",
    body: "Then we find out whether we were right. People use it or they don’t, and both answers are useful. Some products get a second fifteen days. Some get put down.",
  },
];

/**
 * Each particle waits up to MAX_DELAY of its card's scroll before it leaves
 * the edge of the screen, then travels for TRAVEL. The stagger is what makes
 * the card form rather than arrive as one piece; every speck has landed by
 * 0.9, which is when the real card takes over.
 */
const MAX_DELAY = 0.4;
const TRAVEL = 0.5;

/** Smooths wheel steps into a glide before the particles ever see them. */
const SPRING = { stiffness: 90, damping: 24, mass: 0.7 };

/** Per-second rates: how fast a speck catches up with the scroll, and how fast trails fade. */
const CHASE_RATE = 9;
const TRAIL_FADE_RATE = 16;

type Rgb = readonly [number, number, number];

type Particle = {
  /** Start, as a fraction of the viewport: just off one of its corners. */
  sx: number;
  sy: number;
  /** Landing spot, as a fraction of the card: its outline or its face. */
  u: number;
  v: number;
  delay: number;
  radius: number;
  /** Sideways bow of the path, as a fraction of the distance travelled. */
  curve: number;
  phase: number;
  twinkle: number;
  spark: boolean;
};

type DustTarget = {
  card: HTMLElement;
  progress: MotionValue<number>;
  particles: Particle[];
  /** How far along its path each speck is drawn: chases the scroll, never jumps. */
  shown: Float32Array;
  live: boolean;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** "none" once in focus, so a settled element isn't paying for a filter. */
const toFilter = (blur: number) => (blur < 0.05 ? "none" : `blur(${blur}px)`);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, () => {
    // Most land on the outline, so the card's edge is the first thing to
    // resolve; the rest settle across its face.
    let u: number;
    let v: number;
    if (Math.random() < 0.58) {
      const along = Math.random();
      const side = Math.floor(Math.random() * 4);
      [u, v] =
        side === 0 ? [along, 0] : side === 1 ? [1, along] : side === 2 ? [along, 1] : [0, along];
    } else {
      [u, v] = [Math.random(), Math.random()];
    }

    // Each starts just off a corner of the screen, spilling along one of that
    // corner's two edges: thick at the corner, thinning out towards the middle.
    const corner = Math.floor(Math.random() * 4);
    const right = corner % 2 === 1;
    const bottom = corner >= 2;
    const spill = Math.random() ** 2 * 0.7;
    let sx = right ? 1.02 : -0.02;
    let sy = bottom ? 1.02 : -0.02;
    if (Math.random() < 0.5) sx = right ? 1 - spill : spill;
    else sy = bottom ? 1 - spill : spill;

    const spark = Math.random() < 0.12;
    return {
      sx,
      sy,
      u,
      v,
      delay: Math.random() * MAX_DELAY,
      radius: spark ? 3.5 + Math.random() * 2.5 : 1.2 + Math.random() * 1.6,
      curve: (Math.random() - 0.5) * 0.55,
      phase: Math.random() * Math.PI * 2,
      twinkle: 2 + Math.random() * 4,
      spark,
    };
  });
}

/**
 * Canvas can't read var(), so the theme is resolved by painting each token
 * into a 1x1 canvas and reading it back: the browser does the parsing, which
 * matters because the build emits these tokens as lab(), not oklch().
 */
function readColors(): { accent: Rgb; ink: Rgb } {
  const probe = document
    .createElement("canvas")
    .getContext("2d", { willReadFrequently: true });
  const styles = getComputedStyle(document.documentElement);

  const color = (token: string, fallback: Rgb): Rgb => {
    const value = styles.getPropertyValue(token).trim();
    if (!probe || !value) return fallback;
    probe.fillStyle = "#010203";
    probe.fillStyle = value;
    if (probe.fillStyle === "#010203") return fallback;
    probe.clearRect(0, 0, 1, 1);
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return [r, g, b];
  };

  return {
    accent: color("--primary", [106, 141, 216]),
    ink: color("--foreground", [250, 250, 250]),
  };
}

/** A soft round speck, drawn once and stamped per particle: far cheaper than arcs. */
function makeSprite([r, g, b]: Rgb): HTMLCanvasElement {
  const size = 32;
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = size;
  const ctx = sprite.getContext("2d");
  if (!ctx) return sprite;
  const glow = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
  glow.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, 0.75)`);
  glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);
  return sprite;
}

/**
 * One canvas over the whole screen, shared by all four cards, so their dust
 * can come from the screen's corners rather than from around each card.
 * Portalled to <body> so no section's stacking or clipping cuts it off; it
 * sits under the header and the grain.
 *
 * It animates every frame while the steps are near the screen — trails,
 * twinkle and drift need time, not just scroll — and idles once nothing is
 * in flight.
 */
function DustField({
  targets,
  listRef,
}: {
  targets: RefObject<Set<DustTarget>>;
  listRef: RefObject<HTMLOListElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const list = listRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !list || !ctx) return;

    let dark = false;
    let sprites = { accent: makeSprite([0, 0, 0]), ink: makeSprite([0, 0, 0]) };
    const theme = () => {
      const colors = readColors();
      dark = document.documentElement.classList.contains("dark");
      sprites = { accent: makeSprite(colors.accent), ink: makeSprite(colors.ink) };
    };
    theme();

    let width = 0;
    let height = 0;
    let dpr = 1;
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };
    resize();

    let raf = 0;
    let last = 0;
    let cleared = true;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 1 / 60;
      last = now;
      const time = now / 1000;

      const flying = [...targets.current].filter((target) => {
        const p = target.progress.get();
        if (p > 0 && p < 1) return true;
        target.live = false;
        return false;
      });

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (flying.length === 0) {
        if (!cleared) ctx.clearRect(0, 0, width, height);
        cleared = true;
        return;
      }
      cleared = false;

      // Fade last frame instead of wiping it: what's left is each speck's trail.
      ctx.globalCompositeOperation = "destination-out";
      ctx.globalAlpha = 1;
      ctx.fillStyle = `rgba(0, 0, 0, ${1 - Math.exp(-dt * TRAIL_FADE_RATE)})`;
      ctx.fillRect(0, 0, width, height);
      // Additive on dark, so crossing streams glow; plain on light, where
      // adding would wash the ink out.
      ctx.globalCompositeOperation = dark ? "lighter" : "source-over";

      const chase = 1 - Math.exp(-dt * CHASE_RATE);

      for (const target of flying) {
        const p = target.progress.get();
        const rect = target.card.getBoundingClientRect();
        // The dust hands over to the card as it appears.
        const handover = p < 0.86 ? 1 : Math.max(0, 1 - (p - 0.86) / 0.12);

        target.particles.forEach((q, i) => {
          const want = easeInOutCubic(clamp01((p - q.delay) / TRAVEL));
          // Easing along the path, not across the screen: a landed speck
          // stays on the card however fast the page scrolls.
          const e = target.live ? target.shown[i] + (want - target.shown[i]) * chase : want;
          target.shown[i] = e;
          if (e <= 0.001) return;

          const sx = q.sx * width;
          const sy = q.sy * height;
          const dx = rect.left + q.u * rect.width - sx;
          const dy = rect.top + q.v * rect.height - sy;
          const bend = Math.sin(Math.PI * e) * q.curve;
          // A drift that dies away as the speck lands.
          const drift = (1 - e) * 7;

          const x = sx + dx * e - dy * bend + Math.sin(time * 1.6 + q.phase) * drift;
          const y = sy + dy * e + dx * bend + Math.cos(time * 1.3 + q.phase) * drift;
          const shimmer = 0.7 + 0.3 * Math.sin(time * q.twinkle + q.phase);

          ctx.globalAlpha = Math.min(1, e * 4) * handover * shimmer * (q.spark ? 0.9 : 0.75);
          ctx.drawImage(
            q.spark ? sprites.accent : sprites.ink,
            x - q.radius,
            y - q.radius,
            q.radius * 2,
            q.radius * 2,
          );
        });
        target.live = true;
      }
      ctx.globalAlpha = 1;
    };

    // Run only while the steps are within a screen of the viewport.
    const nearby = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !raf) {
          last = 0;
          raf = requestAnimationFrame(frame);
        } else if (!entry.isIntersecting && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, width, height);
          cleared = true;
        }
      },
      { rootMargin: "100% 0px" },
    );
    nearby.observe(list);

    window.addEventListener("resize", resize);
    // next-themes flips a class on <html>; the dust follows it.
    const themeObserver = new MutationObserver(theme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      cancelAnimationFrame(raf);
      nearby.disconnect();
      window.removeEventListener("resize", resize);
      themeObserver.disconnect();
    };
  }, [targets, listRef]);

  return createPortal(
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40 size-full"
    />,
    document.body,
  );
}

function StepFace({
  step,
  lit,
}: {
  step: LoopStep;
  lit?: MotionValue<number>;
}) {
  return (
    <MagicCard className="h-full" surfaceClassName="bg-background">
      <article className="flex h-full flex-col p-6 sm:p-7">
        <div className="flex items-center gap-4">
          <span className="relative grid size-9 shrink-0 place-items-center rounded-full border border-border font-mono text-xs text-muted-foreground">
            {/* Lights once the card has formed, and stays lit. */}
            {lit ? (
              <motion.span
                aria-hidden
                className="absolute -inset-px rounded-full bg-primary/15 ring-1 ring-primary"
                style={{ opacity: lit }}
              />
            ) : null}
            <span className="relative">{step.marker}</span>
          </span>
          <h3 className="font-heading text-2xl leading-tight text-foreground sm:text-3xl">
            {step.title}
          </h3>
        </div>
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
          {step.body}
        </p>
      </article>
    </MagicCard>
  );
}

/**
 * The thread across the 3cm gap above a card, so the four read as one line.
 * Given a `draw` value it grows downward as that card forms, ending on a node.
 */
function Connector({ draw }: { draw?: MotionValue<number> }) {
  // A static connector is simply finished. Whether `draw` is given never
  // changes for a mounted connector, so the source below is stable.
  const finished = useMotionValue(1);
  const node = useTransform(draw ?? finished, [0.85, 1], [0, 1]);
  return (
    <span aria-hidden className="absolute -top-[3cm] left-1/2 h-[3cm] w-px -translate-x-1/2">
      <motion.span
        className="absolute inset-0 origin-top bg-linear-to-b from-border via-primary/60 to-primary/30"
        style={draw ? { scaleY: draw } : undefined}
      />
      <motion.span
        className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_10px_color-mix(in_oklab,var(--primary)_70%,transparent)]"
        style={draw ? { opacity: node } : undefined}
      />
    </span>
  );
}

/** A card that forms out of the dust streaming in as it scrolls into view. */
function DustStep({
  step,
  first,
  register,
}: {
  step: LoopStep;
  first: boolean;
  register: (card: HTMLElement, progress: MotionValue<number>) => () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start end", "start 40%"],
  });
  const progress = useSpring(scrollYProgress, SPRING);

  // The card comes into focus where the dust settled.
  const opacity = useTransform(progress, [0.8, 0.97], [0, 1]);
  const blur = useTransform(progress, [0.8, 0.97], [10, 0]);
  const filter = useTransform(blur, toFilter);
  const scale = useTransform(progress, [0.8, 0.97], [0.97, 1]);
  const y = useTransform(progress, [0.8, 0.97], [10, 0]);
  // A brief glow as it ignites, gone once it's settled.
  const ring = useTransform(progress, [0.82, 0.93, 1], [0, 1, 0]);
  const lit = useTransform(progress, [0.93, 1], [0, 1]);
  const draw = useTransform(progress, [0.15, 0.9], [0, 1]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    return register(card, progress);
  }, [register, progress]);

  return (
    <div ref={wrapRef} className="relative">
      {first ? null : <Connector draw={draw} />}
      <motion.div
        ref={cardRef}
        className="relative rounded-xl"
        style={{ opacity, filter, scale, y }}
      >
        <motion.span
          aria-hidden
          className="pointer-events-none absolute -inset-px z-10 rounded-[inherit] ring-1 ring-primary/70 shadow-[0_0_48px_-6px_color-mix(in_oklab,var(--primary)_60%,transparent)]"
          style={{ opacity: ring }}
        />
        <StepFace step={step} lit={lit} />
      </motion.div>
    </div>
  );
}

/** The closing line arrives the same way, without the dust. */
function ClosingLine({ animate }: { animate: boolean }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 95%", "start 70%"],
  });
  const smooth = useSpring(scrollYProgress, SPRING);
  const opacity = useTransform(smooth, [0, 1], [0, 1]);
  const blur = useTransform(smooth, [0, 1], [6, 0]);
  const filter = useTransform(blur, toFilter);
  const y = useTransform(smooth, [0, 1], [14, 0]);

  return (
    <motion.p
      ref={ref}
      className="mt-16 text-balance text-center font-heading text-xl leading-snug text-foreground sm:text-2xl"
      style={animate ? { opacity, filter, y } : undefined}
    >
      We run them again the moment we’re done.
    </motion.p>
  );
}

/**
 * docs/Idea.md §4 as a scroll sequence. The space starts empty; as the reader
 * reaches each step, dust streams in from the corners of the screen and
 * settles into its card, the four stacked in one vertical line 3cm apart.
 * Server render and reduced motion get the finished cards, so nothing is
 * ever hidden behind an animation that can't run.
 */
export function LoopSteps() {
  const mounted = useMounted();
  const reduceMotion = useReducedMotion();
  const animate = mounted && !reduceMotion;

  const listRef = useRef<HTMLOListElement>(null);
  const targets = useRef(new Set<DustTarget>());

  const register = useCallback((card: HTMLElement, progress: MotionValue<number>) => {
    // Phones get fewer specks: the effect reads the same at a fraction of the cost.
    const count = window.matchMedia("(min-width: 768px)").matches ? 850 : 450;
    const target: DustTarget = {
      card,
      progress,
      particles: makeParticles(count),
      shown: new Float32Array(count),
      live: false,
    };
    targets.current.add(target);
    return () => {
      targets.current.delete(target);
    };
  }, []);

  return (
    <div className="mx-auto mt-12 w-full max-w-2xl sm:mt-16">
      {/*
        role="list" is not redundant: Safari strips list semantics from any
        list with list-style: none, which the Tailwind reset applies here.
      */}
      <ol ref={listRef} role="list" className="flex flex-col gap-[3cm]">
        {STEPS.map((step, index) => (
          // animate in the key remounts each step when it flips, so the
          // scroll hooks never swap a static card for a moving one mid-life.
          <li key={`${animate}-${step.marker}`}>
            {animate ? (
              <DustStep step={step} first={index === 0} register={register} />
            ) : (
              <div className="relative">
                {index === 0 ? null : <Connector />}
                <StepFace step={step} />
              </div>
            )}
          </li>
        ))}
      </ol>

      <ClosingLine animate={animate} />

      {animate ? <DustField targets={targets} listRef={listRef} /> : null}
    </div>
  );
}
