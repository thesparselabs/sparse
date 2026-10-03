import { LockIcon } from "lucide-react";

import type { RepoSummary } from "@/lib/github";
import { describeAge, describeMoment } from "@/lib/relative-time";
import { cn } from "@/lib/utils";

export type LedgerEntry =
  | {
      visibility: "public";
      name: string;
      shape: string;
      summary: string;
      /** Null when GitHub couldn't be reached; the row still renders. */
      repo: RepoSummary | null;
      /** Used when `repo` is null, so the link never disappears with the API. */
      fallbackUrl: string;
    }
  | {
      visibility: "private";
      name: string;
      shape: string;
      summary: string;
      status: string;
      link?: { href: string; label: string };
    };

const linkClass =
  "text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function OpenBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-foreground">
      <span aria-hidden className="relative flex size-1.5">
        <span className="absolute inline-flex size-full rounded-full bg-primary opacity-60 motion-safe:animate-ping" />
        <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
      </span>
      Open source
    </span>
  );
}

function ClosedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
      <LockIcon aria-hidden className="size-3" />
      Closed for now
    </span>
  );
}

/**
 * Rows, not cards — the same call docs/Idea.md §6 makes for the product
 * ledger. A row per thing we've made, open or not, because the honest part of
 * §8 is the closed ones sitting in the same list as the open ones.
 *
 * Open rows carry live data from GitHub. Closed rows say so plainly and link
 * to the product instead, which is the only proof they can offer.
 */
export function RepoLedger({ entries }: { entries: readonly LedgerEntry[] }) {
  return (
    <ul
      role="list"
      className="mt-12 overflow-hidden rounded-xl border border-border bg-card sm:mt-16"
    >
      {entries.map((entry) => {
        const isPublic = entry.visibility === "public";

        return (
          <li
            key={entry.name}
            className={cn(
              "grid gap-x-12 gap-y-5 border-t border-border p-6 first:border-t-0 sm:p-8 md:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]",
              // Closed rows sit back a step; the open ones are the point.
              !isPublic && "bg-muted/25",
            )}
          >
            <div className="flex flex-col items-start gap-3">
              <div>
                <h3
                  className={cn(
                    "font-heading text-2xl leading-tight sm:text-3xl",
                    isPublic ? "text-foreground" : "text-foreground/80",
                  )}
                >
                  {entry.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{entry.shape}</p>
              </div>
              {isPublic ? <OpenBadge /> : <ClosedBadge />}
            </div>

            <div className="flex flex-col">
              <p className="text-pretty text-base leading-relaxed text-muted-foreground">
                {entry.summary}
              </p>

              {entry.visibility === "public" ? (
                <>
                  {entry.repo ? (
                    <ul
                      role="list"
                      className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground"
                    >
                      <li>
                        Updated{" "}
                        <time
                          dateTime={entry.repo.pushedAt.toISOString()}
                          title={describeMoment(entry.repo.pushedAt)}
                          className="text-foreground"
                        >
                          {describeAge(entry.repo.pushedAt)}
                        </time>
                      </li>
                      {entry.repo.language ? <li>{entry.repo.language}</li> : null}
                      {entry.repo.license ? (
                        <li>{entry.repo.license} licence</li>
                      ) : null}
                    </ul>
                  ) : null}

                  <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                    <a
                      href={entry.repo?.url ?? entry.fallbackUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClass}
                    >
                      Read the code
                    </a>
                    <a
                      href={entry.repo?.issuesUrl ?? `${entry.fallbackUrl}/issues`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClass}
                    >
                      See the issues
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-4 inline-flex items-center gap-2 text-sm text-foreground/80">
                    <span aria-hidden className="size-1.5 rounded-full bg-muted-foreground" />
                    {entry.status}
                  </p>
                  {entry.link ? (
                    <div className="mt-5">
                      <a
                        href={entry.link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClass}
                      >
                        {entry.link.label}
                      </a>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
