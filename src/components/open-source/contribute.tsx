import { IconBrandGithub } from "@tabler/icons-react";

import { PageSection } from "@/components/layout/page-section";
import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/ui/terminal";
import { CoolButton } from "@/components/wensity/cool-button";
import { Heading, Lead } from "@/components/wensity/typography";
import { GITHUB_ORG_URL } from "@/lib/github";

/**
 * docs/Idea.md §8, "the concrete door". The terminal shows this site's own
 * repo and its real commands (bun, `next dev`), so it is instructions rather
 * than a demo.
 */
export function Contribute({ muneemIssuesUrl }: { muneemIssuesUrl: string }) {
  return (
    <PageSection surface="background" aria-labelledby="contribute-heading">
      {/* grid-cols-1, not the implicit auto column: the clone URL can't wrap,
          and an auto column grows to fit it, pushing the page sideways on a
          phone. minmax(0,1fr) lets the terminal scroll instead. */}
      <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-14">
        <div>
          <Heading level={2} id="contribute-heading">
            If you want to help
          </Heading>

          <Lead className="mt-6">
            The open repos are listed above, and issues are the best place to
            start. A pull request from a stranger is the best day of our week.
          </Lead>

          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            <CoolButton
              href={muneemIssuesUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="inline-flex items-center gap-2">
                <IconBrandGithub aria-hidden className="size-4" />
                Find an issue on Muneem
              </span>
            </CoolButton>

            <a
              href={GITHUB_ORG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-base"
            >
              See everything on GitHub
            </a>
          </div>
        </div>

        {/* min-h holds the finished height, so the section doesn't grow a line
            at a time while the commands type out. */}
        <Terminal className="h-auto max-h-none min-h-[16.5rem] w-full max-w-none bg-card">
          <TypingAnimation duration={30} className="text-muted-foreground">
            # run this site locally
          </TypingAnimation>
          <TypingAnimation duration={30}>
            $ git clone https://github.com/thesparselabs/sparse
          </TypingAnimation>
          <TypingAnimation duration={30}>$ cd sparse && bun install</TypingAnimation>
          <TypingAnimation duration={30}>$ bun dev</TypingAnimation>
          <AnimatedSpan className="text-muted-foreground">
            {"  ▲ Next.js"}
          </AnimatedSpan>
          <AnimatedSpan className="text-primary">
            {"  - Local: http://localhost:3000"}
          </AnimatedSpan>
        </Terminal>
      </div>
    </PageSection>
  );
}
