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

const LINKS: {
  key: keyof TeamLinks;
  label: string;
  Icon: Icon;
}[] = [
  { key: "github", label: "GitHub", Icon: IconBrandGithub },
  { key: "x", label: "X", Icon: IconBrandX },
  { key: "linkedin", label: "LinkedIn", Icon: IconBrandLinkedin },
  { key: "site", label: "Website", Icon: IconWorld },
];

function PersonCard({ person }: { person: TeamMember }) {
  const links = LINKS.filter(({ key }) => person.links[key]);

  return (
    <MagicCard className="h-full" surfaceClassName="bg-background">
      <article className="flex h-full flex-col p-6 sm:p-8">
        {person.photo ? (
          <Image
            src={person.photo}
            alt=""
            width={96}
            height={96}
            className="mb-6 size-16 rounded-full object-cover ring-1 ring-border"
          />
        ) : null}

        <h3 className="font-heading text-3xl leading-tight text-foreground">
          {person.name}
        </h3>
        <p className="mt-1 text-sm font-medium text-primary">{person.role}</p>
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
          {person.line}
        </p>

        {links.length > 0 ? (
          <ul role="list" className="mt-auto flex gap-2 pt-7">
            {links.map(({ key, label, Icon }) => (
              <li key={key}>
                <a
                  href={person.links[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${person.name} on ${label}`}
                  className="inline-flex size-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Icon aria-hidden className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </article>
    </MagicCard>
  );
}

/**
 * docs/Idea.md §10. Plain typographic grid, by instruction: "real faces or
 * nothing". A photo shows only when src/lib/lab.ts gives one.
 */
export function TeamGrid({ team }: { team: readonly TeamMember[] }) {
  return (
    <ul role="list" className="mt-12 grid gap-4 sm:mt-14 sm:grid-cols-2">
      {team.map((person, index) => (
        // Index in the key: placeholder entries share a name until filled in.
        <li key={`${person.name}-${index}`}>
          <PersonCard person={person} />
        </li>
      ))}
    </ul>
  );
}
