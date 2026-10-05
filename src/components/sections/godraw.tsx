import Image from "next/image";

import { PageSection } from "@/components/layout/page-section";
import { Safari } from "@/components/ui/safari";
import { CoolButton } from "@/components/wensity/cool-button";
import { TextHighlight } from "@/components/wensity/text-highlight";
import { Heading, Lead } from "@/components/wensity/typography";

/**
 * docs/Idea.md §7. A ledger proves we ship often; this proves we ship well.
 * Copy is the script's, with "godraw" capitalised the way the rest of the
 * site now writes it.
 *
 * The build note asks for one real screenshot of the ER-to-SQL export, and
 * these are real: a four-table schema pasted into godraw.app's "Import SQL
 * schema", the diagram it drew, and its own Export SQL dialog for the same
 * tables. Nothing here is mocked up.
 */
export function Godraw() {
  return (
    <PageSection
      surface="background"
      aria-labelledby="godraw-heading"
      className="lg:py-40"
    >
      <Heading level={2} id="godraw-heading" className="max-w-3xl">
        A closer look at{" "}
        <TextHighlight color="var(--primary)">Godraw</TextHighlight>
      </Heading>

      <Lead className="mt-6 max-w-2xl">
        The ledger shows the cadence. This shows the work.
      </Lead>

      {/* sm:pb-* reserves the room the export panel hangs into below the frame. */}
      <figure className="mt-12 sm:mt-16 sm:pb-14">
        <div className="relative">
          <Safari url="godraw.app" idSuffix="godraw" className="w-full">
            <Image
              src="/godraw/er-diagram.webp"
              alt="Godraw with four tables, customers, products, invoices and invoice lines, drawn in crow’s-foot notation with their keys and relationships."
              fill
              sizes="(min-width: 1024px) 56rem, 100vw"
              className="object-cover object-top"
            />
          </Safari>

          {/* The export the diagram becomes, laid over the corner of the
              canvas it came from. Below the frame on phones, where an overlap
              would cover most of the diagram. */}
          <div className="relative mx-auto -mt-6 w-[86%] sm:absolute sm:-bottom-28 sm:-right-4 sm:mt-0 sm:w-[42%] lg:-right-10">
            <Image
              src="/godraw/sql-export.webp"
              alt="Godraw’s Export SQL dialog showing the same tables as Postgres CREATE TABLE statements."
              width={900}
              height={721}
              sizes="(min-width: 640px) 26rem, 86vw"
              className="h-auto w-full rounded-xl border border-border shadow-[0_24px_60px_-20px_color-mix(in_oklab,var(--foreground)_35%,transparent)]"
            />
          </div>
        </div>

        <figcaption className="mt-6 max-w-[55%] text-pretty text-sm leading-relaxed text-muted-foreground max-sm:max-w-2xl sm:mt-8">
          A four-table schema pasted into Godraw, drawn back as a diagram in
          crow’s-foot notation, then exported out again as Postgres.
        </figcaption>
      </figure>

      <div className="mt-12 flex max-w-2xl flex-col gap-5 sm:mt-14">
        <Lead>
          Every developer has drawn the same database twice. Once in the
          diagramming tool, to think. Once in SQL, to build. Then the schema
          changes and only one of them gets updated, so the picture on the wall
          slowly becomes fiction.
        </Lead>
        <Lead>
          Godraw collapses that into one step. Draw the tables, the columns,
          the keys and the relationships in proper crow’s-foot notation, and
          export DDL that runs on Postgres, MySQL or SQLite. Already have a
          schema? Import it and get a diagram that matches reality, because it
          came from reality.
        </Lead>
        <Lead>
          Around that sits an ordinary, good infinite canvas — freehand,
          shapes, arrows that route themselves, sticky notes, mind maps, code
          blocks, math. Live cursors and voice chat when you’re working with
          someone. A presentation mode for when the sketch becomes the meeting.
          And it works offline, syncing when you’re back.
        </Lead>
      </div>

      <figure className="mt-12 max-w-2xl border-l-2 border-primary/60 pl-6 sm:mt-14">
        <blockquote className="text-balance font-heading text-2xl leading-snug text-foreground sm:text-3xl">
          “Free and always will be. If it saved you time, a small tip funds the
          servers and the next feature.”
        </blockquote>
        <figcaption className="mt-3 text-sm text-muted-foreground">
          Godraw’s own line, from its pricing.
        </figcaption>
      </figure>

      <div className="mt-10">
        <CoolButton href="https://godraw.app" target="_blank" rel="noopener noreferrer">
          Open Godraw
        </CoolButton>
      </div>
    </PageSection>
  );
}
