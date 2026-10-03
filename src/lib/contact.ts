import { CONTACT_LIMITS } from "@/lib/contact-limits";

type FieldName = "problem" | "workaround" | "email";

export type ContactFormValues = Record<FieldName, string>;

/** What the form gets back from the server action. */
export type ContactFormState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      /**
       * invalid: a field needs fixing. unavailable: no database to write to.
       * failed: the write itself threw. The form owns the wording for each,
       * so the email fallback lives in one place.
       */
      reason: "invalid" | "unavailable" | "failed";
      errors?: Partial<Record<FieldName, string>>;
      /** Echoed back because React clears the form after every action. */
      values?: ContactFormValues;
    };

export type NewContactMessage = ContactFormValues;

// Code points, not UTF-16 units, so the count matches what the author typed.
const length = (value: string) => [...value].length;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

/**
 * Server-side validation. The form's HTML attributes are a convenience; this
 * is the check that counts, because anyone can POST to the action directly.
 */
export function parseContactMessage(
  formData: FormData,
):
  | { ok: true; value: NewContactMessage }
  | {
      ok: false;
      errors: Partial<Record<FieldName, string>>;
      values: ContactFormValues;
    } {
  const values: ContactFormValues = {
    problem: text(formData, "problem").trim(),
    workaround: text(formData, "workaround").trim(),
    email: text(formData, "email").trim(),
  };

  const errors: Partial<Record<FieldName, string>> = {};
  const { problem, workaround, email } = CONTACT_LIMITS;

  if (length(values.problem) < problem.min) {
    errors.problem = `Tell us a little more, at least ${problem.min} characters.`;
  } else if (length(values.problem) > problem.max) {
    errors.problem = `Keep this under ${problem.max} characters.`;
  }

  if (length(values.workaround) < workaround.min) {
    errors.workaround = "Even “nothing” is a useful answer here.";
  } else if (length(values.workaround) > workaround.max) {
    errors.workaround = `Keep this under ${workaround.max} characters.`;
  }

  if (!values.email) {
    errors.email = "We need somewhere to send the reply.";
  } else if (!EMAIL.test(values.email)) {
    errors.email = "That doesn't look like an email address.";
  } else if (length(values.email) > email.max) {
    errors.email = "That email address is too long.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors, values };

  return { ok: true, value: values };
}

/**
 * Not wired up yet: there is no backend while the front end is built (see
 * .env.example). The ideas wall runs on a placeholder store, but a message
 * nobody reads is the "form that silently drops submissions" docs/Idea.md §11
 * warns about, so until this writes somewhere a person checks, it says so and
 * the form tells the sender. The intended table is contact_messages in
 * db/schema.sql; swapping in the real write is the only change needed.
 */
export async function createContactMessage(
  message: NewContactMessage,
): Promise<"sent" | "not-wired"> {
  void message;
  return "not-wired";
}
