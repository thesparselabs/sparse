import { IconBrandGithub } from "@tabler/icons-react";
import type { Metadata } from "next";

import { PageHero, PageSection } from "@/components/layout/page-section";
import { Contribute } from "@/components/open-source/contribute";
import { HandedOn } from "@/components/open-source/handed-on";
import {
  RepoLedger,
  type LedgerEntry,
} from "@/components/open-source/repo-ledger";
import { CoolButton } from "@/components/wensity/cool-button";
import { GitHubActivityGrid } from "@/components/wensity/github-activity-grid";
import { TextHighlight } from "@/components/wensity/text-highlight";
import { Heading, Lead } from "@/components/wensity/typography";
import { GITHUB_ORG_URL, getCommitActivity, getRepo } from "@/lib/github";

export const metadata: Metadata = {
  title: "Open source — TheSparseLabs",
  description:
    "We build in public where we can. Muneem's code is on GitHub as it's being written, and so is this site.",
};

const PUBLIC_REPOS = ["muneem", "sparse"] as const;

const repoUrl = (name: string) => `${GITHUB_ORG_URL}/${name}`;

/**
 * docs/Idea.md §8, followed by §9 — the order matters: §8 is load-bearing for
 * §9 and has to come first.
 *
 * Everything with a date or a count on it comes from the GitHub API (see
 * src/lib/github.ts), cached for an hour. If GitHub is unreachable the page
 * loses those details and nothing else.
 */
export default async function OpenSourcePage() {
  const [muneem, sparse, activity] = await Promise.all([
    getRepo("muneem"),
    getRepo("sparse"),
    getCommitActivity(PUBLIC_REPOS),
  ]);

  // docs/Idea.md §6 rows, reduced to what matters here: is it open, and
  // where's the proof. Summaries are the script's own lines.
  const ledger: LedgerEntry[] = [
    {
      visibility: "public",
      name: "Muneem",
      shape: "Desktop app with a cloud API",
      summary:
        "Billing, inventory and accounting for Indian shops, built offline-first. Built in the open, so you can read how the money arithmetic is done, disagree with a decision, and say so.",
      repo: muneem,
      fallbackUrl: repoUrl("muneem"),
    },
    {
      visibility: "public",
      name: "This site",
      shape: "Web app",
      summary:
        "The page you’re reading, and every one around it. Public too, for whatever that’s worth.",
      repo: sparse,
      fallbackUrl: repoUrl("sparse"),
    },
    {
      visibility: "private",
      name: "Godraw",
      shape: "Web app",
      summary:
        "An infinite canvas for drawing systems that exports SQL you can actually run. It’s live, and the product link is the proof here, not the source.",
      status: "Live",
      link: { href: "https://godraw.app", label: "Open Godraw" },
    },
    {
      visibility: "private",
      name: "Sextant",
      shape: "API",
      summary:
        "A web search and extraction API for AI agents, built on our own index rather than somebody else’s results page.",
      status: "Launching soon",
    },
  ];

  return (
    <main className="flex-1">
      <PageHero
        heading={
          <>
            You should be able to{" "}
            <TextHighlight color="var(--primary)">see inside</TextHighlight>
          </>
        }
        intro={
          <>
            We build in public where we can. Muneem’s code is on GitHub as it’s
            being written — not a polished drop after the fact, the actual
            work. This site is public too, for whatever that’s worth.
          </>
        }
      >
        <div className="mt-9 flex flex-row flex-wrap items-center gap-3 delay-200 duration-700 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-3 motion-safe:fill-mode-both sm:mt-11 sm:gap-4">
          <CoolButton
            href={muneem?.url ?? repoUrl("muneem")}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <span className="inline-flex items-center gap-2">
              <IconBrandGithub aria-hidden className="size-4" />
              Read Muneem’s code
            </span>
          </CoolButton>

          <a
            href={sparse?.url ?? repoUrl("sparse")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-xl bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-[scale,opacity] duration-150 ease-out hover:opacity-90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-5 sm:py-2.5 sm:text-base"
          >
            Read this site’s code
          </a>
        </div>

        {activity ? (
          <figure className="mt-14 sm:mt-16">
            <GitHubActivityGrid
              days={activity}
              label="commits in the last year"
            />
            <figcaption className="mt-3 text-pretty text-sm text-muted-foreground">
              Every square is a day of commits to Muneem and this site, read
              from GitHub within the hour. Nobody types these in.
            </figcaption>
          </figure>
        ) : null}
      </PageHero>

      <PageSection surface="background" aria-labelledby="ledger-heading">
        <Heading level={2} id="ledger-heading" className="max-w-3xl">
          Not everything is, yet
        </Heading>

        <Lead className="mt-6 max-w-2xl">
          Godraw and Sextant are closed for now, and we’d rather say that
          plainly than let “open by default” imply more than it does. The
          direction is one way, though: things get opened as they stabilise,
          not sealed as they grow.
        </Lead>

        <RepoLedger entries={ledger} />
      </PageSection>

      <PageSection surface="card">
        <blockquote className="max-w-3xl text-balance font-heading text-[1.75rem] leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
          <p>
            That isn’t a favour we’re asking for. It’s the thing that makes the
            rest of this page safe to believe.
          </p>
          <p className="mt-6 text-muted-foreground sm:mt-8">
            Software from a lab this small is a reasonable thing to be nervous
            about, and the honest answer to that nervousness isn’t a promise —
            it’s{" "}
            <TextHighlight color="var(--primary)" className="text-foreground">
              access
            </TextHighlight>
            .
          </p>
        </blockquote>
      </PageSection>

      <Contribute
        muneemIssuesUrl={muneem?.issuesUrl ?? `${repoUrl("muneem")}/issues`}
      />

      <HandedOn />
    </main>
  );
}
