import type { ComponentProps, ReactNode } from "react";

import { DotPattern } from "@/components/ui/dot-pattern";
import { Heading, Lead } from "@/components/wensity/typography";
import { cn } from "@/lib/utils";

type Surface = "card" | "background";

/** The same dissolve Loop and Products use, so bands never meet on a hard line. */
const RAMP: Record<Surface, string> = {
  card: "bg-[linear-gradient(to_bottom,var(--card)_0%,color-mix(in_oklab,var(--card),transparent_45%)_38%,color-mix(in_oklab,var(--card),transparent_80%)_68%,transparent_100%)]",
  background:
    "bg-[linear-gradient(to_bottom,var(--background)_0%,color-mix(in_oklab,var(--background),transparent_45%)_38%,color-mix(in_oklab,var(--background),transparent_80%)_68%,transparent_100%)]",
};

/**
 * Opening band of an inner page. Same --card surface as the home hero, with a
 * dot grid in the corner instead of the honeycomb, which belongs to the home
 * page. The entrance is CSS, so the copy never waits on hydration.
 */
export function PageHero({
  heading,
  intro,
  children,
}: {
  heading: ReactNode;
  intro: ReactNode;
  children?: ReactNode;
}) {
  return (
    // Top padding clears the fixed header, which is h-16 sm:h-18.
    <section className="relative isolate overflow-hidden bg-card px-5 pb-20 pt-32 sm:px-8 sm:pb-28 sm:pt-40">
      <DotPattern
        width={18}
        height={18}
        className="-z-10 text-foreground/[0.14] [mask-image:radial-gradient(ellipse_60%_70%_at_100%_0%,black_10%,transparent_75%)]"
      />

      <div className="mx-auto w-full max-w-4xl">
        <Heading
          level={1}
          className="max-w-3xl duration-700 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-3"
        >
          {heading}
        </Heading>

        <Lead className="mt-6 max-w-2xl delay-100 duration-700 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-3 motion-safe:fill-mode-both">
          {intro}
        </Lead>

        {children}
      </div>
    </section>
  );
}

/**
 * A band below the hero. Pages alternate surfaces, so the band above is always
 * the other one, and that is what the top ramp dissolves from.
 */
export function PageSection({
  surface,
  className,
  children,
  ...props
}: { surface: Surface } & ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden px-5 py-24 sm:px-8 sm:py-32",
        surface === "card" ? "bg-card" : "bg-background",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 -z-10 h-64",
          RAMP[surface === "card" ? "background" : "card"],
        )}
      />
      <div className="mx-auto w-full max-w-4xl">{children}</div>
    </section>
  );
}
