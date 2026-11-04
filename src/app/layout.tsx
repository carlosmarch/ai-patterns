import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import { Origami } from "lucide-react";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { SiteNav } from "@/components/site-nav";
import { ScrollRestoration } from "@/components/scroll-restoration";
import { StarToast } from "@/components/star-toast";

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var theme = localStorage.getItem("theme");
    var isDark = theme === "dark" || (theme !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
  } catch (e) {}
})();
`;

// Take over scroll restoration ourselves (see <ScrollRestoration>) instead of
// letting the browser's native "auto" restore race the app router's async
// re-render on back/forward navigation.
const SCROLL_RESTORATION_SCRIPT = `
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
`;

// Umami analytics — only loaded when a website ID is configured, so local dev
// and preview builds without the env var stay untracked.
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const UMAMI_SCRIPT_URL = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL ?? "https://cloud.umami.is/script.js";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Patterns",
  description: "Production components for AI agent UIs — each with a UX spec the harness can read.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <Script id="scroll-restoration-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: SCROLL_RESTORATION_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <ScrollRestoration />
        <SiteHeader>
          <div className="flex h-full items-center justify-between px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <Origami className="size-5" />
              AI Patterns
            </Link>
            <SiteNav />
          </div>
        </SiteHeader>
        <div className="flex-1">{children}</div>
        <Footer />
        <StarToast />
        <Analytics />
        {UMAMI_WEBSITE_ID && (
          <Script src={UMAMI_SCRIPT_URL} data-website-id={UMAMI_WEBSITE_ID} strategy="afterInteractive" />
        )}
      </body>
    </html>
  );
}
