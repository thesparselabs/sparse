"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";

import { cn } from "@/lib/utils";

/**
 * Wensity's GitHub-style activity grid (ui.wensity.com/r/github-activity-grid),
 * copied in by hand rather than through the CLI. The CLI install would have
 * added Wensity's own palette — chili reds, --surface, a dozen --primitive-*
 * tokens — to globals.css, which is exactly the parallel colour system
 * docs/Idea.md rules out. Changes from upstream:
 *
 * - Colours come from the theme: cells step through --primary instead of
 *   emerald, surfaces are --background/--border, so it re-themes with the page.
 * - The matte noise layer is gone; SiteGrain already covers the whole page.
 * - Cells are spans, not 371 buttons. A tab stop per day made the grid a
 *   keyboard trap; the summary below it is what screen readers get instead.
 * - The tooltip and header drop the "A · B" middle-dot strings.
 * - Numbers format in a pinned locale, so server and client agree.
 * - The header label is a prop: these are commits, not "contributions".
 */

export interface ActivityDay {
  /** ISO date string (YYYY-MM-DD). */
  date: string;
  /** 0..n raw count (bucketed into 5 levels). */
  count: number;
}

export interface GitHubActivityGridProps {
  /** Days, oldest first. 371 gives a clean 53-week grid. */
  days: ActivityDay[];
  /** Header label after the total, e.g. "commits in the last year". */
  label?: string;
  /** Count that maps to the darkest cell. Defaults to the max in `days`. */
  maxCount?: number;
  /** Cell size in px. Default 11. */
  cellSize?: number;
  /** Gap between cells in px. Default 3. */
  cellGap?: number;
  className?: string;
}

// Empty days: in the light theme --muted and --background are the same
// near-white, so a muted fill vanishes; a faint ink tint reads on both.
const LEVEL_BG = [
  "bg-foreground/[0.07] dark:bg-muted/70",
  "bg-primary/25",
  "bg-primary/50",
  "bg-primary/75",
  "bg-primary",
] as const;

const WEEKDAYS = ["", "Mon", "", "Wed", "", "Fri", ""] as const;
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const WEEKDAY_LABEL_WIDTH = 22;
const WEEKDAY_LABEL_GAP = 4;
const MAX_GROW = 1.4;
const MIN_CELL_SIZE = 8;
/** A month label needs about this many week columns before the next one. */
const MIN_LABEL_COLUMNS = 3;

const numberFormat = new Intl.NumberFormat("en");
const tooltipDate = new Intl.DateTimeFormat("en", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function GitHubActivityGrid({
  days,
  label = "commits in the last year",
  maxCount,
  cellSize = 11,
  cellGap = 3,
  className,
}: GitHubActivityGridProps) {
  const reduce = useReducedMotion();

  const max = React.useMemo(() => {
    if (typeof maxCount === "number" && maxCount > 0) return maxCount;
    return Math.max(1, ...days.map((d) => d.count));
  }, [days, maxCount]);

  function level(count: number) {
    if (count <= 0) return 0;
    const ratio = count / max;
    if (ratio < 0.25) return 1;
    if (ratio < 0.5) return 2;
    if (ratio < 0.75) return 3;
    return 4;
  }

  /* Group into [week][weekday], padding the first week so Sunday is row 0. */
  const grid = React.useMemo(() => {
    if (days.length === 0) {
      return {
        weeks: [] as (ActivityDay | null)[][],
        monthLabels: [] as { col: number; label: string }[],
      };
    }
    // Dates are UTC days, so read them back as UTC or the grid shifts a row
    // for anyone west of Greenwich.
    const first = new Date(days[0].date + "T00:00:00Z");
    const flat: (ActivityDay | null)[] = [
      ...Array.from({ length: first.getUTCDay() }, () => null),
      ...days,
    ];
    while (flat.length % 7 !== 0) flat.push(null);

    const weeks: (ActivityDay | null)[][] = [];
    for (let i = 0; i < flat.length; i += 7) {
      weeks.push(flat.slice(i, i + 7));
    }

    const monthLabels: { col: number; label: string }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, col) => {
      const firstReal = week.find(Boolean);
      if (!firstReal) return;
      const month = new Date(firstReal.date + "T00:00:00Z").getUTCMonth();
      if (month !== lastMonth) {
        monthLabels.push({ col, label: MONTHS[month] });
        lastMonth = month;
      }
    });

    // The window rarely starts on the 1st, so the first month is often a
    // single column and its label lands on top of the next. GitHub drops it;
    // so do we.
    const spaced = monthLabels.filter(
      (label, index) =>
        index + 1 >= monthLabels.length ||
        monthLabels[index + 1].col - label.col >= MIN_LABEL_COLUMNS,
    );

    return { weeks, monthLabels: spaced };
  }, [days]);

  // Upstream called days.indexOf() per cell, which is 371² lookups a render.
  const dayIndex = React.useMemo(
    () => new Map(days.map((d, index) => [d.date, index])),
    [days],
  );

  /* One shared tooltip that springs between cells. */
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const tooltipX = useMotionValue(0);
  const tooltipY = useMotionValue(0);
  const springX = useSpring(tooltipX, { stiffness: 480, damping: 40, mass: 0.5 });
  const springY = useSpring(tooltipY, { stiffness: 480, damping: 40, mass: 0.5 });
  const [hover, setHover] = React.useState<ActivityDay | null>(null);

  const gridViewportRef = React.useRef<HTMLDivElement | null>(null);
  const [gridViewportWidth, setGridViewportWidth] = React.useState(0);

  // ResizeObserver reports once on observe, so this also takes the first
  // measurement — no synchronous setState in the effect body.
  React.useEffect(() => {
    const node = gridViewportRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) =>
      setGridViewportWidth(entry.contentRect.width),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  function onCellEnter(event: React.PointerEvent<HTMLSpanElement>, day: ActivityDay) {
    const container = containerRef.current;
    if (!container) return;
    const cell = event.currentTarget.getBoundingClientRect();
    const box = container.getBoundingClientRect();
    tooltipX.set(cell.left - box.left + cell.width / 2);
    tooltipY.set(cell.top - box.top - 6);
    setHover(day);
  }

  const total = React.useMemo(
    () => days.reduce((sum, d) => sum + d.count, 0),
    [days],
  );
  const activeDays = React.useMemo(
    () => days.filter((d) => d.count > 0).length,
    [days],
  );

  const availableGridWidth = Math.max(
    0,
    gridViewportWidth - WEEKDAY_LABEL_WIDTH - WEEKDAY_LABEL_GAP,
  );

  // On a phone a whole year shrinks to 3px dots with the labels piled on top
  // of each other. Rather than go below MIN_CELL_SIZE, keep the most recent
  // weeks that fit — the right-hand end is the part worth reading anyway.
  const fitWeeks =
    gridViewportWidth > 0
      ? Math.max(
          1,
          Math.floor((availableGridWidth + cellGap) / (MIN_CELL_SIZE + cellGap)),
        )
      : grid.weeks.length;
  const firstWeek = Math.max(0, grid.weeks.length - fitWeeks);
  const weeks = grid.weeks.slice(firstWeek);
  const monthLabels = grid.monthLabels
    .map((label) => ({ ...label, col: label.col - firstWeek }))
    .filter((label) => label.col >= 0);

  const weekCount = weeks.length;
  const baseGridWidth = weekCount * cellSize + Math.max(0, weekCount - 1) * cellGap;
  // Upstream only ever shrank the grid, which left a ragged gap on the right
  // of a wide card. Fitting both ways makes the last week meet the edge;
  // the cap stops the cells turning into tiles on a very wide container.
  const fitScale =
    gridViewportWidth > 0 && baseGridWidth > 0
      ? Math.min(MAX_GROW, availableGridWidth / baseGridWidth)
      : 1;
  const fittedCellSize = cellSize * fitScale;
  const fittedCellGap = cellGap * fitScale;
  const fittedGridWidth =
    weekCount * fittedCellSize + Math.max(0, weekCount - 1) * fittedCellGap;

  return (
    <div
      ref={containerRef}
      onPointerLeave={() => setHover(null)}
      className={cn(
        "relative isolate w-full overflow-hidden rounded-xl border border-border bg-background p-4 sm:p-5",
        className,
      )}
    >
      <div className="relative z-10 mb-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <p className="text-sm text-foreground">
          <span className="font-medium tabular-nums">
            {numberFormat.format(total)}
          </span>{" "}
          <span className="text-muted-foreground">{label}</span>
        </p>
        <Legend />
      </div>

      <p className="sr-only">
        {numberFormat.format(total)} {label}, across {activeDays}{" "}
        {activeDays === 1 ? "day" : "days"}.
      </p>

      <div
        ref={gridViewportRef}
        aria-hidden
        className="relative z-10 overflow-hidden pb-1"
      >
        <div className="flex min-w-0 flex-col">
          <div
            className="relative h-3.5"
            style={{
              width: fittedGridWidth,
              marginLeft: WEEKDAY_LABEL_WIDTH + WEEKDAY_LABEL_GAP,
            }}
          >
            {monthLabels.map((m) => (
              <span
                key={`${m.col}-${m.label}`}
                className="absolute top-0 text-[10px] font-medium text-muted-foreground"
                style={{ left: m.col * (fittedCellSize + fittedCellGap) }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex" style={{ gap: WEEKDAY_LABEL_GAP }}>
            <div className="flex flex-col" style={{ gap: fittedCellGap }}>
              {WEEKDAYS.map((weekday, index) => (
                <span
                  key={index}
                  className="flex items-center text-[10px] font-medium text-muted-foreground"
                  style={{ height: fittedCellSize, width: WEEKDAY_LABEL_WIDTH }}
                >
                  {weekday}
                </span>
              ))}
            </div>

            <div className="flex" style={{ gap: fittedCellGap }}>
              {weeks.map((week, wIdx) => (
                <div
                  key={week.find(Boolean)?.date ?? wIdx}
                  className="flex flex-col"
                  style={{ gap: fittedCellGap }}
                >
                  {week.map((day, dIdx) => {
                    if (!day) {
                      return (
                        <span
                          key={`pad-${wIdx}-${dIdx}`}
                          style={{ width: fittedCellSize, height: fittedCellSize }}
                        />
                      );
                    }
                    // The reveal ripples backward from today.
                    const fromEnd = days.length - 1 - (dayIndex.get(day.date) ?? 0);
                    return (
                      <motion.span
                        key={day.date}
                        initial={reduce ? false : { scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={
                          reduce
                            ? { duration: 0 }
                            : {
                                delay: fromEnd * 0.002,
                                type: "spring",
                                stiffness: 420,
                                damping: 28,
                                mass: 0.6,
                              }
                        }
                        onPointerEnter={(event) => onCellEnter(event, day)}
                        className={cn("block rounded-[3px]", LEVEL_BG[level(day.count)])}
                        style={{ width: fittedCellSize, height: fittedCellSize }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <motion.div
        aria-hidden
        style={{
          x: springX,
          y: springY,
          opacity: hover ? 1 : 0,
          translateX: "-50%",
          translateY: "-100%",
        }}
        transition={{ opacity: { duration: 0.12 } }}
        className="pointer-events-none absolute left-0 top-0 z-20 select-none whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[11px] font-medium text-popover-foreground shadow-md"
      >
        {hover ? (
          <>
            <span className="tabular-nums">{hover.count}</span>{" "}
            {hover.count === 1 ? "commit" : "commits"}
            <span className="text-muted-foreground">
              {" "}
              on {tooltipDate.format(new Date(hover.date + "T00:00:00Z"))}
            </span>
          </>
        ) : null}
      </motion.div>
    </div>
  );
}

function Legend() {
  return (
    <div aria-hidden className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
      <span>Less</span>
      {LEVEL_BG.map((bg, index) => (
        <span key={index} className={cn("size-2.5 rounded-[3px]", bg)} />
      ))}
      <span>More</span>
    </div>
  );
}
