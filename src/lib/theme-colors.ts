/**
 * canvas-confetti only understands hex: its parser strips every character that
 * isn't a hex digit, so handing it `var(--chart-1)` or a `lab(...)` string
 * doesn't fail loudly — it scrapes stray digits out and paints nonsense.
 *
 * The tokens are written as oklch in globals.css, but the build emits each one
 * as a hex fallback followed by lab(), and the browser keeps the lab(). So no
 * single syntax is parsed here: each token is painted into a 1x1 canvas and
 * read back, and the browser does the conversion whatever form it arrives in.
 */

const FALLBACK = ["#0159b7", "#13c9aa", "#cf3fd9", "#8f3c1e", "#17ab92"];

/** The designed five-colour spread already in globals.css. */
const CONFETTI_TOKENS = [
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
];

const toHexByte = (value: number) => value.toString(16).padStart(2, "0");

function tokenToHex(
  token: string,
  styles: CSSStyleDeclaration,
  probe: CanvasRenderingContext2D,
): string | null {
  const value = styles.getPropertyValue(token).trim();
  if (!value) return null;

  probe.fillStyle = "#010203";
  probe.fillStyle = value;
  // An unparseable value leaves fillStyle untouched.
  if (probe.fillStyle === "#010203") return null;

  probe.clearRect(0, 0, 1, 1);
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;
}

/**
 * Read at call time, not at import: the tokens differ between light and dark,
 * and the user can flip themes without a reload.
 */
export function themeConfettiColors(): string[] {
  if (typeof window === "undefined") return FALLBACK;

  try {
    const probe = document
      .createElement("canvas")
      .getContext("2d", { willReadFrequently: true });
    if (!probe) return FALLBACK;

    const styles = getComputedStyle(document.documentElement);
    const colors = CONFETTI_TOKENS.map((token) => tokenToHex(token, styles, probe))
      .filter((hex): hex is string => hex !== null);

    return colors.length > 0 ? colors : FALLBACK;
  } catch {
    return FALLBACK;
  }
}
