/**
 * The people and the inbox behind the lab. This is the one file to edit when
 * someone joins, leaves, or changes their links — /contact reads it as-is.
 *
 * docs/Idea.md §10: each person gets the same four things. Keep the role in
 * plain words ("Builds the desktop app" beats "Senior Full-Stack Engineer")
 * and the line short; this is a lab, not a leadership page.
 */

export type TeamLinks = {
  github?: string;
  x?: string;
  linkedin?: string;
  site?: string;
};

export type TeamMember = {
  name: string;
  role: string;
  /** What they're into, what they own, or what they built before this. */
  line: string;
  links: TeamLinks;
  /**
   * Optional path under /public, e.g. "/team/name.jpg". Real photos only —
   * the script rules out generated avatars and monograms, so a card without
   * a photo stays typographic rather than getting a placeholder face.
   */
  photo?: string;
};

// TODO: links. They're optional; any that are left out simply don't render.
// For example:
//   links: { github: "https://github.com/handle", x: "https://x.com/handle" }
export const TEAM: readonly TeamMember[] = [
  {
    name: "Rishabh Gupta",
    role: "Engineer",
    line: "Takes the hardest problem on the board and makes it look like the easy one.",
    links: {},
  },
  {
    name: "Hemant Yadav",
    role: "Engineer",
    line: "Won’t ship it until it’s right, and has a very particular idea of right.",
    links: {},
  },
  {
    name: "Nanak Gupta",
    role: "Engineer",
    line: "Writes code that does exactly what it says, which is rarer than it sounds.",
    links: {},
  },
  {
    name: "Pratik Singh",
    role: "GTM",
    line: "Could sell you this pen. Only sells the ones that write.",
    links: {},
  },
];

/**
 * TODO: the inbox from docs/Idea.md §11 — "same inbox, same person reading
 * it". Left null until there is a real address: while it is null the direct
 * contact line and the email fallback in the form's error message don't
 * render, so the page never publishes a guessed address.
 */
export const CONTACT_EMAIL: string | null = null;
