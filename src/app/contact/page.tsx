import type { Metadata } from "next";
import Link from "next/link";

import { ContactForm } from "@/components/contact/contact-form";
import { TeamGrid } from "@/components/contact/team-grid";
import { PageHero, PageSection } from "@/components/layout/page-section";
import { TextHighlight } from "@/components/wensity/text-highlight";
import { Heading, Lead, Muted } from "@/components/wensity/typography";
import { CONTACT_EMAIL, TEAM } from "@/lib/lab";

export const metadata: Metadata = {
  title: "Contact — TheSparseLabs",
  description:
    "Tell us what breaks in your week. Every product we've shipped started as someone describing a bad afternoon.",
};

/** docs/Idea.md §11, "What happens next". Copy is verbatim. */
const NEXT_STEPS = [
  {
    lead: "You get named as the person who found it",
    body: "On the product and here, unless you’d rather we didn’t.",
  },
  {
    lead: "You get it first",
    body: "Before the launch, while it’s still easy to change.",
  },
  {
    lead: "We build it with you, not at you",
    body: "You had the problem; you’re the one who can tell us when we’ve solved the wrong half of it.",
  },
] as const;

const inlineLinkClass =
  "text-foreground underline underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * docs/Idea.md §11 then §10: the reader supplies a problem, then meets the
 * people who'll read it. "A real person reads every one of these" lands
 * harder with the people one scroll away.
 *
 * Small copy changes from the script, all because this is its own page now:
 * "the most useful thing on the page" became "on the site", and "that ledger"
 * became "we've shipped" since the ledger isn't on this page.
 */
export default function ContactPage() {
  return (
    <main className="flex-1">
      <PageHero
        heading={
          <>
            Tell us what{" "}
            <TextHighlight color="var(--primary)">breaks</TextHighlight> in your
            week
          </>
        }
        intro={
          <>
            This is the most useful page on the site, and the only one
            that&rsquo;s aimed at you rather than at us. Every product
            we&rsquo;ve shipped started as someone describing a bad afternoon.
          </>
        }
      >
        <div className="mt-14 grid items-start gap-12 sm:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-14">
          <div className="flex flex-col gap-5 lg:sticky lg:top-28">
            <Lead>
              We&rsquo;re not looking for product ideas. We&rsquo;re looking
              for the thing you&rsquo;ve already built a workaround for — the
              spreadsheet that shouldn&rsquo;t exist, the step you do by hand
              every Thursday, the tool you keep open only because the other one
              can&rsquo;t do one thing. You stopped complaining about it a
              while ago. <span className="text-foreground">That&rsquo;s the one.</span>
            </Lead>
            <Lead>
              Describe the problem, not the solution. If you&rsquo;ve already
              designed the fix in your head, tell us anyway, but lead with what
              hurts. We&rsquo;re better at the second part than you&rsquo;d
              expect and worse at guessing the first part than we&rsquo;d like.
            </Lead>

            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-6">
              {CONTACT_EMAIL ? (
                <Muted>
                  Rather not use a form?{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} className={inlineLinkClass}>
                    {CONTACT_EMAIL}
                  </a>{" "}
                  is the same inbox, with the same person reading it.
                </Muted>
              ) : null}
              <Muted>
                Happy for everyone to see it?{" "}
                <Link href="/tell-us" className={inlineLinkClass}>
                  Put it on the ideas wall
                </Link>{" "}
                instead.
              </Muted>
            </div>
          </div>

          <ContactForm />
        </div>
      </PageHero>

      <PageSection surface="background" aria-labelledby="next-heading">
        <Heading level={2} id="next-heading" className="max-w-3xl">
          What happens next
        </Heading>

        <div className="mt-6 flex max-w-2xl flex-col gap-5">
          <Lead>
            A real person reads every one of these. That&rsquo;s not a figure
            of speech yet — there aren&rsquo;t enough of them for it to be.
          </Lead>
          <Lead>
            We reply to the ones we might be able to build, and we try to say
            no clearly to the rest rather than going quiet. If your problem
            turns into something we ship:
          </Lead>
        </div>

        <ul
          role="list"
          className="mt-12 overflow-hidden rounded-xl border border-border bg-card sm:mt-14"
        >
          {NEXT_STEPS.map((step) => (
            <li
              key={step.lead}
              className="grid gap-x-12 gap-y-2 border-t border-border p-6 first:border-t-0 sm:p-8 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]"
            >
              <h3 className="text-balance font-heading text-2xl leading-tight text-foreground">
                {step.lead}
              </h3>
              <p className="text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                {step.body}
              </p>
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection surface="card" aria-labelledby="team-heading">
        <Heading level={2} id="team-heading" className="max-w-3xl">
          The people who{" "}
          <TextHighlight color="var(--primary)">actually</TextHighlight> build
          this
        </Heading>

        <div className="mt-6 flex max-w-2xl flex-col gap-5">
          <Lead>
            A small group in India. Small on purpose — fifteen days only works
            if nobody has to be told what&rsquo;s going on.
          </Lead>
          <Lead>
            There&rsquo;s no product team handing specs to an engineering team.
            The person who notices the problem is usually the person who ships
            the fix, which is why the products are opinionated and why
            they&rsquo;re small.
          </Lead>
        </div>

        <TeamGrid team={TEAM} />

        <p className="mt-12 max-w-2xl text-balance font-heading text-xl leading-snug text-foreground sm:mt-14 sm:text-2xl">
          We&rsquo;re not trying to become large. We&rsquo;re trying to stay
          small enough that shipping in fifteen days is still physically
          possible.
        </p>
      </PageSection>
    </main>
  );
}
