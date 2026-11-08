import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";

import { SITE_URL } from "@/lib/agent";

import { AnimatedOrigami } from "@/components/animated-origami";
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

// Google Analytics 4 — page views plus the custom events in src/lib/analytics.ts.
// Off unless NEXT_PUBLIC_GA_MEASUREMENT_ID is set at build time.
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GA_HOSTNAME = new URL(SITE_URL).hostname;
// Loads gtag.js itself, and only on the production host, so elsewhere
// window.gtag stays undefined and track() calls are no-ops.
const GA_INIT_SCRIPT = `
if (location.hostname === ${JSON.stringify(GA_HOSTNAME)}) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  gtag("js", new Date());
  gtag("config", ${JSON.stringify(GA_MEASUREMENT_ID)});
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + ${JSON.stringify(GA_MEASUREMENT_ID)};
  document.head.appendChild(s);
}
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "AI Patterns",
  description: "Production components for AI agent UIs — each with a UX spec the harness can read.",
  alternates: {
    types: { "text/markdown": "/index.md", "text/plain": "/llms.txt" },
  },
  openGraph: {
    type: "website",
    siteName: "AI Patterns",
    title: "AI Patterns",
    description: "Production components for AI agent UIs — each with a UX spec the harness can read.",
    url: "/",
  },
  twitter: { card: "summary_large_image" },
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
            <Link href="/" className="logo-link flex items-center gap-2 font-semibold tracking-tight">
              <AnimatedOrigami className="size-5" />
              AI Patterns
            </Link>
            <SiteNav />
          </div>
        </SiteHeader>
        <div className="flex-1">{children}</div>
        <Footer />
        <StarToast />
        {GA_MEASUREMENT_ID && (
          <Script id="ga-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: GA_INIT_SCRIPT }} />
        )}
      </body>
    </html>
  );
}
