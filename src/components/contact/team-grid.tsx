import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
  IconWorld,
  type Icon,
} from "@tabler/icons-react";
import Image from "next/image";

import { MagicCard } from "@/components/ui/magic-card";
import type { TeamLinks, TeamMember } from "@/lib/lab";

/** Button label and mark per link. The URL itself never shows on the page. */
const LINKS: { key: keyof TeamLinks; label: string; Icon: Icon }[] = [
  { key: "linkedin", label: "LinkedIn", Icon: IconBrandLinkedin },
  { key: "x", label: "X", Icon: IconBrandX },
  { key: "github", label: "GitHub", Icon: IconBrandGithub },
  { key: "site", label: "Website", Icon: IconWorld },
];

/**
 * Opensource UI's User Profile card (opensourceui.in, MIT, © 2026 Bidyut
 * Kundu), rebuilt in this theme. Changes from upstream:
 *
 * - Tokens instead of its warm-paper hex and neutral-* greys, our radius, and
 *   the MagicCard surface the rest of the page uses.
 * - The label above the name is the person's role, in sentence case:
 *   docs/Idea.md rules out ALL-CAPS labels above headings.
 * - The portrait only appears for a real photo; without one the card goes
 *   without ("real faces or nothing", §10).
 * - Links are labelled buttons ("LinkedIn") rather than printed addresses,
 *   with the brand mark in place of the ↗: no arrows glued to button text.
 */
function PersonCard({ person }: { person: TeamMember }) {
  const links = LINKS.flatMap((link) => {
    const href = person.links[link.key];
    return href ? [{ ...link, href }] : [];
  });

  return (
    <MagicCard className="h-full" surfaceClassName="bg-background">
      <article className="flex h-full flex-col p-6 sm:p-7">
        <p className="border-b border-border pb-3 font-mono text-[11px] tracking-[0.14em] text-muted-foreground">
          {person.role}
        </p>

        <div className="mt-5 flex items-center gap-4">
          {person.photo ? (
            // Decorative: the name beside it already says who this is.
            <Image
              src={person.photo}
              alt=""
              width={128}
              height={128}
              className="size-16 shrink-0 rounded-lg border border-border bg-muted object-cover"
            />
          ) : null}

          <h3 className="min-w-0 font-heading text-[1.75rem] leading-none tracking-tight text-foreground">
            {person.name}
          </h3>
        </div>

        <p className="mt-5 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
          {person.line}
        </p>

        {links.length > 0 ? (
          // mt-auto pins the links to the floor of the taller card in a row;
          // the wrapper's padding keeps a gap when there's nothing to push.
          <div className="mt-auto pt-5">
            <ul
              role="list"
              className="flex flex-wrap gap-2 border-t border-border pt-4 sm:pt-5"
            >
              {links.map(({ key, href, label, Icon }) => (
                <li key={key}>
                  {/* Four cards, four "LinkedIn" buttons: the name in the
                      accessible label says whose profile this one opens. */}
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${person.name} on ${label}`}
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <Icon aria-hidden className="size-4 text-muted-foreground" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </article>
    </MagicCard>
  );
}

/**
 * docs/Idea.md §10. Faces only when they're real: a photo in src/lib/lab.ts
 * supplies one, otherwise the card stays typographic.
 */
export function TeamGrid({ team }: { team: readonly TeamMember[] }) {
  return (
    <ul role="list" className="mt-12 grid gap-4 sm:mt-14 sm:grid-cols-2">
      {team.map((person, index) => (
        // Index in the key: two people can share a name.
        <li key={`${person.name}-${index}`}>
          <PersonCard person={person} />
        </li>
      ))}
    </ul>
  );
}
