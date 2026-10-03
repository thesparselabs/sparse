"use client";

import { CheckIcon } from "lucide-react";
import { useActionState, useEffect, useState, type ReactNode } from "react";

import { sendContactMessage } from "@/app/contact/actions";
import { BorderBeam } from "@/components/ui/border-beam";
import { CoolButton } from "@/components/wensity/cool-button";
import { CONTACT_LIMITS } from "@/lib/contact-limits";
import type { ContactFormState } from "@/lib/contact";
import { CONTACT_EMAIL } from "@/lib/lab";
import { cn } from "@/lib/utils";

const initialState: ContactFormState = { status: "idle" };

// Top to bottom, so the first error is the one nearest the top.
const FIELD_ORDER = ["problem", "workaround", "email"] as const;

const inputClass =
  "w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-base text-foreground placeholder:text-muted-foreground/70 transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20";

const textareaClass = cn(
  inputClass,
  // Grows with the text where the browser supports field-sizing; elsewhere it
  // stays put and can still be dragged taller.
  "field-sizing-content max-h-80 min-h-28 resize-y leading-relaxed",
);

const linkClass =
  "text-foreground underline underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Field({
  id,
  label,
  helper,
  error,
  children,
}: {
  id: string;
  label: string;
  helper?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {helper ? (
        <p id={`${id}-helper`} className="-mt-0.5 text-sm text-muted-foreground">
          {helper}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function EmailLink() {
  return CONTACT_EMAIL ? (
    <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
      {CONTACT_EMAIL}
    </a>
  ) : null;
}

/** docs/Idea.md §11 failure copy. Never a bare "Error". */
function ErrorMessage({ reason }: { reason: "invalid" | "unavailable" | "failed" }) {
  if (reason === "invalid") return <>A couple of things need another look.</>;

  if (reason === "unavailable") {
    return CONTACT_EMAIL ? (
      <>
        This form isn&rsquo;t switched on yet. Email us at <EmailLink /> instead.
      </>
    ) : (
      <>This form isn&rsquo;t switched on yet. Please check back soon.</>
    );
  }

  return CONTACT_EMAIL ? (
    <>
      That didn&rsquo;t send. Try again, or email us at <EmailLink />.
    </>
  ) : (
    <>That didn&rsquo;t send. Give it another go in a moment.</>
  );
}

function Sent({ onReset }: { onReset: () => void }) {
  return (
    <div
      role="status"
      // Close to the form's own height, so the card doesn't collapse under
      // the reader the moment they press send.
      className="flex min-h-[30rem] flex-col items-start justify-center gap-5 duration-500 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95"
    >
      <span
        aria-hidden
        className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground"
      >
        <CheckIcon className="size-5" strokeWidth={2.5} />
      </span>
      <p className="max-w-sm text-balance font-heading text-3xl leading-tight text-foreground">
        Got it. We read these properly, so give us a few days.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Send another problem
      </button>
    </div>
  );
}

function Form({ onReset }: { onReset: () => void }) {
  const [state, formAction, pending] = useActionState(
    sendContactMessage,
    initialState,
  );

  const errors = state.status === "error" ? (state.errors ?? {}) : {};
  // React clears uncontrolled fields after every action, so on a failed post
  // the server sends back what was typed and we put it in again.
  const values = state.status === "error" ? state.values : undefined;

  // A failed post puts the cursor on the first thing to fix, rather than
  // leaving it on the button with the problem somewhere off-screen.
  useEffect(() => {
    if (state.status !== "error" || !state.errors) return;
    const first = FIELD_ORDER.find((field) => state.errors?.[field]);
    if (first) document.getElementById(`contact-${first}`)?.focus();
  }, [state]);

  // docs/Idea.md §11: after submitting, the form is replaced.
  if (state.status === "success") return <Sent onReset={onReset} />;

  const describe = (...ids: (string | false)[]) =>
    ids.filter(Boolean).join(" ") || undefined;

  return (
    <form action={formAction} aria-busy={pending} className="flex flex-col gap-6">
      <Field id="contact-problem" label="What breaks?" error={errors.problem}>
        <textarea
          id="contact-problem"
          name="problem"
          required
          rows={4}
          minLength={CONTACT_LIMITS.problem.min}
          maxLength={CONTACT_LIMITS.problem.max}
          defaultValue={values?.problem}
          placeholder="The thing that goes wrong, as plainly as you can put it."
          aria-invalid={Boolean(errors.problem)}
          aria-describedby={describe(
            Boolean(errors.problem) && "contact-problem-error",
          )}
          className={textareaClass}
        />
      </Field>

      <Field
        id="contact-workaround"
        label="What do you do instead today?"
        helper="The workaround is the important part. People only build workarounds for things that genuinely hurt."
        error={errors.workaround}
      >
        <textarea
          id="contact-workaround"
          name="workaround"
          required
          rows={3}
          minLength={CONTACT_LIMITS.workaround.min}
          maxLength={CONTACT_LIMITS.workaround.max}
          defaultValue={values?.workaround}
          placeholder="Even if the answer is “nothing, I just put up with it.”"
          aria-invalid={Boolean(errors.workaround)}
          aria-describedby={describe(
            "contact-workaround-helper",
            Boolean(errors.workaround) && "contact-workaround-error",
          )}
          className={textareaClass}
        />
      </Field>

      <Field id="contact-email" label="Where can we reach you?" error={errors.email}>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          maxLength={CONTACT_LIMITS.email.max}
          defaultValue={values?.email}
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={describe(
            Boolean(errors.email) && "contact-email-error",
          )}
          className={inputClass}
        />
      </Field>

      {/* Honeypot. Off-screen and out of the tab order, so only bots fill it. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-4 pt-1">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
          <CoolButton
            as="button"
            type="submit"
            disabled={pending}
            className="shrink-0 disabled:pointer-events-none disabled:opacity-60"
          >
            {pending ? "Sending…" : "Send it"}
          </CoolButton>
          <p className="text-pretty text-sm text-muted-foreground">
            We only use this to reply. No list, no newsletter, nothing
            forwarded to anyone.
          </p>
        </div>

        <div aria-live="polite" className="text-sm">
          {state.status === "error" ? (
            <p role="alert" className="text-destructive">
              <ErrorMessage reason={state.reason} />
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}

/**
 * docs/Idea.md §11. Three fields and no more: "every extra field costs
 * submissions, and the workaround question is the one that separates real
 * pain from idle wishes."
 *
 * Works without JavaScript — it is a plain form post to a Server Action,
 * progressively enhanced by useActionState.
 */
export function ContactForm() {
  // Remounting is the reset: it is the only way to clear useActionState's
  // success state, and it gets a fresh, empty form for free.
  const [round, setRound] = useState(0);

  return (
    <div className="relative rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-8 dark:shadow-[inset_0_1px_0_0_color-mix(in_oklab,var(--foreground),transparent_92%)]">
      <BorderBeam size={140} duration={9} borderWidth={1.5} />
      <BorderBeam size={140} duration={9} borderWidth={1.5} delay={4.5} />
      <Form key={round} onReset={() => setRound((value) => value + 1)} />
    </div>
  );
}
