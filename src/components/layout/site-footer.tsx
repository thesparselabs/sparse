import Link from "next/link";

import { GITHUB_ORG_URL, getRepo } from "@/lib/github";
import { describeAge, describeMoment } from "@/lib/relative-time";

type FooterLink =
  | { label: string; href: string; external?: boolean }
  /** Nothing to open yet: plain text with a note, never a waitlist link. */
  | { label: string; note: string };

/** docs/Idea.md §12; Lab mirrors the header, Ideas included. */
const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Products",
    links: [
      { label: "Godraw", href: "https://godraw.app", external: true },
      { label: "Muneem", href: `${GITHUB_ORG_URL}/muneem`, external: true },
      { label: "Sextant", note: "Soon" },
    ],
  },
  {
    title: "Lab",
    links: [
      { label: "Method", href: "/#method" },
      { label: "Ideas", href: "/ideas" },
      { label: "Open source", href: "/open-source" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Code",
    links: [
      { label: "github.com/thesparselabs", href: GITHUB_ORG_URL, external: true },
    ],
  },
];

const linkClass =
  "text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * docs/Idea.md §12's build note: each public repo's last update, read from
 * GitHub and cached for an hour. The most honest cadence receipt on the page,
 * and it keeps itself current. A repo GitHub can't answer for simply drops out.
 */
const RECEIPTS = [
  { repo: "muneem", label: "Muneem" },
  { repo: "sparse", label: "This site" },
] as const;

export async function SiteFooter() {
  const receipts = await Promise.all(
    RECEIPTS.map(async ({ repo, label }) => ({ label, data: await getRepo(repo) })),
  );

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto w-full max-w-4xl px-5 pt-16 sm:px-8 sm:pt-20">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
          <div>
            <Link
              href="/"
              className="font-heading text-2xl tracking-tight text-foreground transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              TheSparseLabs
            </Link>
            <p className="mt-3 max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
              We ship simple software for painful problems.
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3"
          >
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <h2 className="text-sm font-medium text-foreground">
                  {column.title}
                </h2>
                <ul role="list" className="mt-4 flex flex-col gap-3 text-sm">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {"note" in link ? (
                        <span className="text-muted-foreground">
                          {link.label}{" "}
                          <span className="text-xs text-muted-foreground/70">
                            {link.note}
                          </span>
                        </span>
                      ) : link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={linkClass}
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link href={link.href} className={linkClass}>
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getUTCFullYear()} TheSparseLabs. Built in the open,
            in India.
          </p>
          <ul role="list" className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
            {receipts.map(({ label, data }) =>
              data ? (
                <li key={label}>
                  <a
                    href={data.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {label} updated{" "}
                    <time
                      dateTime={data.pushedAt.toISOString()}
                      title={describeMoment(data.pushedAt)}
                    >
                      {describeAge(data.pushedAt)}
                    </time>
                  </a>
                </li>
              ) : null,
            )}
          </ul>
        </div>
      </div>

      {/* The wordmark as a watermark: the glyphs are transparent and clipped
          to a gradient that fades out before the baseline. */}
      <div
        aria-hidden
        className="flex select-none items-end justify-center gap-[1vw] overflow-hidden pt-10 sm:pt-14"
      >
        <div className="-m-[0.2em] whitespace-nowrap bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--foreground)_12%,transparent)_0,color-mix(in_oklab,var(--foreground)_12%,transparent)_0.2em,transparent_1.05em)] bg-clip-text bg-no-repeat p-[0.2em] font-heading text-[14vw] leading-[0.85] tracking-tight text-transparent">
          TheSparseLabs
        </div>
        <span className="mb-[1.2vw] inline-block size-[2.4vw] shrink-0 rounded-full bg-primary" />
      </div>
    </footer>
  );
}
