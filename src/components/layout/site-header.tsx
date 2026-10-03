"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronRightIcon, MenuIcon, XIcon } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { useScrolled } from "@/hooks/use-scrolled";
import { cn } from "@/lib/utils";

/**
 * Separate links, sentence case (docs/Idea.md §1). They are laid out with
 * spacing — never joined with middle dots.
 */
const LINKS = [
  { label: "Products", href: "/#products" },
  { label: "Method", href: "/#method" },
  { label: "Open source", href: "/open-source" },
  { label: "Ideas", href: "/ideas" },
  { label: "Contact", href: "/contact" },
];

const CTA = { label: "Tell us what hurts", href: "/tell-us" };

/**
 * Pill CTA: animated gradient hairline border, gradient label, nudging chevron.
 * The border is a masked gradient layer so the pill itself stays transparent.
 */
function GradientPillLink({
  href,
  className,
  onClick,
  children,
}: {
  href: string;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group relative inline-flex items-center justify-center rounded-full px-4 font-medium shadow-[inset_0_-8px_10px_color-mix(in_oklab,var(--primary),transparent_88%)] [transition:box-shadow_500ms_ease-out,scale_150ms_ease-out] hover:shadow-[inset_0_-5px_10px_color-mix(in_oklab,var(--primary),transparent_76%)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <span
        aria-hidden
        className="animate-gradient absolute inset-0 block size-full rounded-[inherit] bg-linear-to-r from-primary/40 via-primary to-primary/40 bg-size-[300%_100%] p-px motion-reduce:animate-none"
        style={{
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "destination-out",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "subtract",
          WebkitClipPath: "padding-box",
        }}
      />
      <AnimatedGradientText className="motion-reduce:animate-none">
        {children}
      </AnimatedGradientText>
      <ChevronRightIcon
        aria-hidden
        className="ml-1 size-4 text-muted-foreground transition-transform duration-300 ease-in-out group-hover:translate-x-0.5"
      />
    </Link>
  );
}

export function SiteHeader() {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // On its own page the CTA would only point at where you already are.
  const showCta = pathname !== CTA.href;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-200",
        // Transparent over the hero; earns a surface only once you leave it.
        scrolled || open
          ? "border-b border-border bg-card/85 backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between gap-6 px-5 sm:h-18 sm:px-8">
        <Link
          href="/"
          className="font-heading text-xl tracking-tight text-foreground transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-2xl"
        >
          TheSparseLabs
        </Link>

        {/* lg, not md: five links plus the CTA don't fit beside the wordmark at
            tablet width, so below 1024px they live in the menu. */}
        <nav className="hidden items-center gap-8 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={cn(
                "text-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                pathname === link.href
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {/* On /tell-us the pill is not shown, but its slot stays. Without it the
              nav links slide ~170px right, so the "Ideas" link you just
              clicked jumps out from under the cursor. inert keeps the hidden
              copy out of the tab order and away from clicks. */}
          <div
            className={cn("hidden lg:block", !showCta && "invisible")}
            aria-hidden={!showCta || undefined}
            inert={!showCta}
          >
            <GradientPillLink
              href={CTA.href}
              className="min-h-10 text-sm"
            >
              {CTA.label}
            </GradientPillLink>
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:hidden"
          >
            {open ? (
              <XIcon className="size-[1.15rem]" />
            ) : (
              <MenuIcon className="size-[1.15rem]" />
            )}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="site-menu"
          className="border-t border-border bg-card/95 backdrop-blur-md lg:hidden"
        >
          <nav className="mx-auto flex w-full max-w-4xl flex-col gap-1 px-5 py-4 sm:px-8">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={pathname === link.href ? "page" : undefined}
                className={cn(
                  "rounded-lg px-2 py-2.5 text-base transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  pathname === link.href
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}

            {showCta ? (
              <GradientPillLink
                href={CTA.href}
                onClick={() => setOpen(false)}
                className="mt-3 min-h-11 text-base"
              >
                {CTA.label}
              </GradientPillLink>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
