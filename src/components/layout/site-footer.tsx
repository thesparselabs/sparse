import Link from "next/link";

import { GradientColumns } from "@/components/footer/gradient-columns";
import { GITHUB_ORG_URL } from "@/lib/github";

type FooterLink =
  | { label: string; href: string; external?: boolean }
  /** Nothing to open yet: plain text with a note, never a waitlist link. */
  | { label: string; note: string };

/** docs/Idea.md §12; Lab mirrors the header, Ideas included. */
const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Products",
    links: [
      { label: "godraw", href: "https://godraw.app", external: true },
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

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <GradientColumns stageClassName="h-36 sm:h-52">
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

          <p className="mt-14 border-t border-border pt-6 text-sm text-muted-foreground">
            © {new Date().getUTCFullYear()} TheSparseLabs. Built in the open, in
            India.
          </p>
        </div>
      </GradientColumns>
    </footer>
  );
}
