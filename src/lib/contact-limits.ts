/**
 * Shared by the contact form (maxLength attributes) and the server
 * (validation), and mirrored by the check constraints on contact_messages in
 * db/schema.sql. Change all three together.
 *
 * The workaround minimum is deliberately tiny: docs/Idea.md §11 invites
 * "nothing, I just put up with it", and "nothing" has to be a valid answer.
 */
export const CONTACT_LIMITS = {
  problem: { min: 10, max: 2000 },
  workaround: { min: 2, max: 2000 },
  email: { max: 254 },
} as const;
