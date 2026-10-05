import { HeroGlobe } from "@/components/hero/hero-globe";
import { HeroHeadline } from "@/components/hero/hero-headline";
import { HexagonPattern } from "@/components/ui/hexagon-pattern";
import { CoolButton } from "@/components/wensity/cool-button";
import { Lead } from "@/components/wensity/typography";

export function Hero() {
  return (
    /*
      Height is content + gap + crown, and nothing else. There is deliberately
      no min-h and no flex-1 here.

      Both were here before and both caused the same class of bug: the globe was
      bottom-anchored, so the distance between the buttons and the globe was
      never set anywhere — it was whatever height the section had left over. A
      tall min-h with short copy left a big void on mobile; the same min-h with
      wider-wrapping copy left almost nothing on desktop. Every attempt to fix
      one end moved the other.

      Now the globe has its own block below the copy, so the gap is a margin and
      the crown is that block's height. Both are fixed values that mean the same
      thing at every viewport size. The trade is that the hero no longer
      stretches to fill tall screens — its height is simply what it contains.
    */
    <section className="relative isolate flex flex-col items-center overflow-hidden bg-card px-5 pt-24 sm:px-8 sm:pt-32 lg:pt-36">
      {/* Honeycomb backdrop. Masked so it only reads at the edges and never
          competes with the headline or the globe. */}
      <HexagonPattern
        radius={26}
        gap={2}
        className="-z-10 stroke-foreground/[0.07] fill-none [mask-image:radial-gradient(ellipse_78%_62%_at_50%_38%,transparent_18%,black_78%)]"
      />

      {/* Keeps the copy legible where it crosses the honeycomb. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[78%] bg-[radial-gradient(ellipse_78%_62%_at_50%_30%,var(--card)_0%,color-mix(in_oklab,var(--card),transparent_22%)_52%,transparent_82%)]"
      />

      {/* pointer-events-none on the wrapper lets clicks in the gaps reach the
          globe; each real element opts back in. */}
      <div className="pointer-events-none relative z-20 flex w-full flex-col items-center text-center">
        {/*
          docs/Idea.md §2 headline is "We ship simple software for painful
          problems." Superseded here by the globe-led line, deliberately.
        */}
        <HeroHeadline />

        <Lead className="pointer-events-auto mt-7 max-w-2xl sm:mt-9">
          TheSparseLabs is a small product lab. We find what quietly ruins a
          workday and build the smallest thing that stops it.
        </Lead>

        {/* One row at every width. They were stacked and full-width on mobile,
            which is what stretched the CoolButton's orbit border across the
            screen. Sizing down happens inside each button so the animation is
            untouched. */}
        <div className="pointer-events-auto mt-9 flex w-full flex-row items-center justify-center gap-3 sm:mt-11 sm:w-auto sm:gap-4">
          {/* CoolButton renders an <a> that defaults to target="_blank". */}
          <CoolButton href="/tell-us" target="_self" className="shrink-0">
            Bring us an idea
          </CoolButton>

          <a
            href="#products"
            className="inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-xl bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-5 sm:py-2.5 sm:text-base"
          >
            See our work
          </a>
        </div>

        {/* docs/Idea.md §2: the constraint, set apart as its own line. */}
        <div className="pointer-events-auto mt-9 flex max-w-xl flex-col items-center gap-4 sm:mt-11">
          <span aria-hidden className="h-px w-10 bg-border" />
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
            Nothing ships that can’t ship in{" "}
            <span className="text-foreground">15 days</span>. That isn’t a
            schedule. It’s a filter — if an idea can’t survive being that
            small, it isn’t the right idea yet.
          </p>
        </div>
      </div>

      {/*
        The globe's own block. Two numbers define the whole arrangement:

          mt-*  the gap between the buttons and the top of the arc
          h-*   the height of the arc itself

        The globe is anchored to this block's top and is far taller than it
        (26rem / 48rem against 11.5rem / 18rem), so the rest of the sphere hangs
        below and is clipped by the section. That clipped height IS the arc, so
        it can't drift — which is what kept happening when it was a percentage
        of the section.

        Keep the arc under about half the globe's diameter. Past that the crop
        clears the equator and you stop seeing a horizon and start seeing a
        whole planet parked behind the copy. At 18rem of a 48rem globe this is
        37%; on mobile, 11.5rem of 26rem is 44%.
      */}
      <div className="relative z-0 mt-6 h-[11.5rem] w-full sm:mt-7 sm:h-[18rem]">
        <HeroGlobe className="top-0" />

        {/*
          Dissolves the crop into the hero's OWN surface, --card, and nothing
          else — it used to resolve to --background, which left a hard line the
          moment the section below stopped being the villain band. Ending on the
          hero's own surface makes it independent of whatever follows.

          Scoped to this block and started slightly above it, so the dissolve is
          always the same shape relative to the arc instead of a percentage of a
          section height that moves.
        */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-8 bottom-0 z-10 bg-[linear-gradient(to_bottom,transparent_0%,color-mix(in_oklab,var(--card),transparent_62%)_46%,color-mix(in_oklab,var(--card),transparent_18%)_74%,var(--card)_97%)]"
        />
      </div>
    </section>
  );
}
