import { PageSection } from "@/components/layout/page-section";
import { TextHighlight } from "@/components/wensity/text-highlight";
import { Heading, Lead } from "@/components/wensity/typography";
import { GITHUB_ORG_URL } from "@/lib/github";
import { cn } from "@/lib/utils";

type Tone = "live" | "building" | "soon";

type Product = {
  name: string;
  shape: string;
  hurts: string;
  does: string;
  /** The script's one line worth pulling out, where a product has one. */
  line?: string;
  status: { tone: Tone; label: string };
  /**
   * Public launch date, only once it's confirmed. docs/Idea.md still carries
   * godraw's as a [[TODO]], and an unconfirmed date is a guess, so no row has
   * one yet; the slot renders as soon as one is filled in.
   */
  shipped?: string;
  link?: { href: string; label: string };
};

/** docs/Idea.md §6, rows 1–3. Copy is the script's, trimmed to fit a row. */
const PRODUCTS: readonly Product[] = [
  {
    name: "Godraw",
    shape: "Web app",
    hurts:
      "You’re designing a database and the diagram lives in one tool, the schema in another. They drift apart within a week, and the diagram becomes a lie.",
    does: "An infinite canvas for drawing systems. Draw the tables in crow’s-foot notation and export SQL you can actually run — Postgres, MySQL, SQLite. Or point it at a schema you already have and get the diagram back.",
    status: { tone: "live", label: "Live" },
    link: { href: "https://godraw.app", label: "Open Godraw" },
  },
  {
    name: "Muneem",
    shape: "Desktop app with a cloud API",
    hurts:
      "The shop’s internet drops and the till stops taking money. Cloud billing software assumes a connection that a lot of Indian retail simply doesn’t have.",
    does: "Billing, inventory and accounting for Indian retail and wholesale shops, built offline-first. The shop’s own computer is the system of record. The cloud is for backup and reporting, not for permission to make a sale.",
    line: "Your business keeps running even when the internet doesn’t.",
    status: { tone: "building", label: "In development, built in the open" },
    link: { href: `${GITHUB_ORG_URL}/muneem`, label: "Read the code" },
  },
  {
    name: "Sextant",
    shape: "API",
    hurts:
      "Agents are only as good as the web context they can pull in, and most tools scrape someone else’s search results — which means a latency floor, a dependency that can cut you off, and no real retrieval.",
    does: "A web search and extraction API for AI agents, built on our own index rather than somebody else’s results page. Search the live web, pull clean Markdown out of any page, get answers you can check.",
    line: "Close enough that we’re arguing about the docs rather than the code.",
    status: { tone: "soon", label: "Launching soon" },
  },
];

/**
 * docs/Idea.md §6, rows 4–5. Promises, not receipts: no status dot, no date,
 * no link, and a dashed, dimmer row so they're never mistaken for shipped
 * products. "Every shape in §5" reads "every shape above" on the page.
 */
const PROMISES = [
  {
    title: "More in the workshop",
    body: "Several things are mid-build right now. Some will make it out, some won’t — that’s what the loop is for. The ones that survive land here with a date on them.",
    status: "In progress",
  },
  {
    title: "More of all five",
    body: "More SaaS and micro-SaaS. More command-line tools. More endpoints, more mobile, more small things that open in a tab. Every shape above has something behind it — this row is where they’ll appear once they’re real enough to have a date.",
    status: "Ongoing",
  },
] as const;

const linkClass =
  "text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Mono, sentence case: docs/Idea.md rules out ALL-CAPS labels. */
const labelClass = "font-mono text-[11px] tracking-[0.12em] text-muted-foreground";

function StatusDot({ tone }: { tone: Tone }) {
  if (tone === "live") {
    return (
      <span aria-hidden className="relative flex size-1.5">
        <span className="absolute inline-flex size-full rounded-full bg-primary opacity-60 motion-safe:animate-ping" />
        <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "size-1.5 rounded-full",
        tone === "building" ? "ring-1 ring-primary" : "bg-muted-foreground/60",
      )}
    />
  );
}

/**
 * docs/Idea.md §6. Rows, not cards: a dated ledger reads as a system starting
 * up, a grid of three cards as a thin portfolio. It ends on the two promise
 * rows so the cadence reads as a habit rather than as history.
 *
 * This is where the header's Products link and the hero's "See our work"
 * land, so it carries id="products"; scroll-mt clears the fixed header.
 */
export function Ledger() {
  return (
    <PageSection
      surface="card"
      id="products"
      aria-labelledby="ledger-heading"
      className="scroll-mt-20 sm:scroll-mt-24 lg:py-40"
    >
      <Heading level={2} id="ledger-heading" className="max-w-3xl">
        What we’ve <TextHighlight color="var(--primary)">built</TextHighlight>{" "}
        so far
      </Heading>

      <Lead className="mt-6 max-w-2xl">
        Three products, three different shapes. A whiteboard, a shop till, and
        a search API. What they have in common is the loop, not the category.
      </Lead>

      <ul
        role="list"
        className="mt-12 overflow-hidden rounded-xl border border-border bg-background sm:mt-16"
      >
        {PRODUCTS.map((product) => (
          <li
            key={product.name}
            className="grid gap-x-12 gap-y-6 border-t border-border p-6 first:border-t-0 sm:p-8 md:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]"
          >
            <div className="flex flex-col items-start gap-3">
              <div>
                <h3 className="font-heading text-2xl leading-tight text-foreground sm:text-3xl">
                  {product.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{product.shape}</p>
              </div>
              <p className="inline-flex items-center gap-2 text-xs font-medium text-foreground/90">
                <StatusDot tone={product.status.tone} />
                {product.status.label}
              </p>
              {product.shipped ? (
                <p className={labelClass}>
                  Shipped <time>{product.shipped}</time>
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <p className={labelClass}>What hurts</p>
                <p className="mt-1.5 text-pretty text-base leading-relaxed text-foreground/90">
                  {product.hurts}
                </p>
              </div>
              <div>
                <p className={labelClass}>What it does</p>
                <p className="mt-1.5 text-pretty text-base leading-relaxed text-muted-foreground">
                  {product.does}
                </p>
              </div>
              {product.line ? (
                <p className="text-balance font-heading text-xl leading-snug text-foreground">
                  {product.line}
                </p>
              ) : null}
              {product.link ? (
                <div>
                  <a
                    href={product.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {product.link.label}
                  </a>
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <ul
        role="list"
        className="mt-4 overflow-hidden rounded-xl border border-dashed border-border"
      >
        {PROMISES.map((promise) => (
          <li
            key={promise.title}
            className="grid gap-x-12 gap-y-3 border-t border-dashed border-border p-6 first:border-t-0 sm:p-8 md:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]"
          >
            <div className="flex flex-col items-start gap-2">
              <h3 className="font-heading text-2xl leading-tight text-foreground/75 sm:text-3xl">
                {promise.title}
              </h3>
              <p className={labelClass}>{promise.status}</p>
            </div>
            <p className="text-pretty text-base leading-relaxed text-muted-foreground">
              {promise.body}
            </p>
          </li>
        ))}
      </ul>
    </PageSection>
  );
}
