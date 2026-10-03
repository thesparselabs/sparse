"use server";

import {
  createContactMessage,
  parseContactMessage,
  type ContactFormState,
} from "@/lib/contact";

export async function sendContactMessage(
  _previous: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Honeypot: real people never see this field, bots fill everything. Say
  // "success" so they don't learn they were filtered.
  if (String(formData.get("website") ?? "").trim() !== "") {
    return { status: "success" };
  }

  const parsed = parseContactMessage(formData);

  if (!parsed.ok) {
    return {
      status: "error",
      reason: "invalid",
      errors: parsed.errors,
      values: parsed.values,
    };
  }

  try {
    const result = await createContactMessage(parsed.value);
    // docs/Idea.md §11: a form that silently drops submissions is worse than
    // no form, so with nowhere for this to land, say so.
    if (result === "not-wired") {
      return { status: "error", reason: "unavailable", values: parsed.value };
    }
  } catch (error) {
    console.error("Could not save contact message", error);
    return { status: "error", reason: "failed", values: parsed.value };
  }

  return { status: "success" };
}
