import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteGrain } from "@/components/layout/site-grain";
import { SiteHeader } from "@/components/layout/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Instrument Serif ships 400 only — it is not variable, so the weight is explicit.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TheSparseLabs — we ship simple software for painful problems",
  description:
    "A small product lab. We look for the things that quietly ruin a workday, build the smallest thing that stops it, and put it in front of the people who have the problem.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body id="top" className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SiteHeader />
          {children}
          <SiteFooter />
          <SiteGrain />
        </ThemeProvider>
      </body>
    </html>
  );
}
