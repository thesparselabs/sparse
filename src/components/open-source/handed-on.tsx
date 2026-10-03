import { PageSection } from "@/components/layout/page-section";
import { MagicCard } from "@/components/ui/magic-card";
import { Heading, Lead } from "@/components/wensity/typography";

/** docs/Idea.md §9, the three mechanical answers. Copy is verbatim. */
const PROMISES = [
  {
    lead: "Your data leaves whenever you want.",
    body: "Export is a feature we build first, not a concession we add when people complain.",
  },
  {
    lead: "The code is public where it can be.",
    body: "If a product is open and you’re depending on it, an acquisition doesn’t strand you. You can run it yourself.",
  },
  {
    lead: "We say so out loud.",
    body: "No quiet handover, no “exciting news” post that turns out to mean the service closes in thirty days.",
  },
] as const;

/**
 * docs/Idea.md §9. It sits after the repos because §8 is what makes it true.
 * The closing line says "up front" where the script says "on the front page",
 * which this page isn't.
 */
export function HandedOn() {
  return (
    <PageSection surface="card" aria-labelledby="handed-on-heading">
      <Heading level={2} id="handed-on-heading" className="max-w-3xl">
        We build things to be handed on
      </Heading>

      <div className="mt-6 flex max-w-2xl flex-col gap-5">
        <Lead>
          We’ll say the quiet part plainly, because you’d find out anyway: these
          products are built to be acquired. A lab that ships every fifteen
          days cannot also run twelve products forever, and pretending
          otherwise would be how they all slowly get worse.
        </Lead>
        <Lead>
          When something we built finds a team that can take it further than
          we can, that’s the good outcome. Not the exit — the continuity. The
          product gets people who’ll look after it full time.
        </Lead>
        <Lead>
          The fair question is what that means for you if you’re using it.
          Here’s the answer, and it’s mechanical rather than reassuring.
        </Lead>
      </div>

      <ul role="list" className="mt-12 grid gap-4 sm:mt-14 md:grid-cols-3">
        {PROMISES.map((promise) => (
          <li key={promise.lead}>
            <MagicCard className="h-full" surfaceClassName="bg-background">
              <div className="flex h-full flex-col p-6 sm:p-7">
                <h3 className="text-balance font-heading text-2xl leading-tight text-foreground">
                  {promise.lead}
                </h3>
                <p className="mt-3 text-pretty text-base leading-relaxed text-muted-foreground">
                  {promise.body}
                </p>
              </div>
            </MagicCard>
          </li>
        ))}
      </ul>

      <p className="mt-12 max-w-2xl text-balance font-heading text-xl leading-snug text-foreground sm:mt-14 sm:text-2xl">
        We’d rather tell you this up front than have you discover it later.
      </p>
    </PageSection>
  );
}
