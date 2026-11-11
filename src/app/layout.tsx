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
import { SiteActions } from "@/components/site-actions";
import { SiteCommandPalette } from "@/components/site-command-palette";
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

// Google Tag Manager — the container decides which tags (GA4, …) run. The
// custom events in src/lib/analytics.ts are pushed to dataLayer for it.
// Only loaded on the production host, so local dev and PR previews send nothing.
const GTM_ID = "GTM-WKPZ539R";
const GTM_HOSTNAME = new URL(SITE_URL).hostname;
const GTM_INIT_SCRIPT = `
if (location.hostname === ${JSON.stringify(GTM_HOSTNAME)}) {
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag("js", new Date());
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtm.js?id=${GTM_ID}";
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
  description: "An open research project on how user experience evolves as AI learns to act — each pattern a UX spec people and agents can read, with the code to ship it.",
  alternates: {
    types: { "text/markdown": "/index.md", "text/plain": "/llms.txt" },
  },
  openGraph: {
    type: "website",
    siteName: "AI Patterns",
    title: "AI Patterns",
    description: "An open research project on how user experience evolves as AI learns to act — each pattern a UX spec people and agents can read, with the code to ship it.",
    url: "/",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // The patterns sidebar is always compact (ticks) — see PatternsSidebar.
      data-sidebar="compact"
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
          <div className="grid h-full grid-cols-[1fr_auto] items-center sm:grid-cols-[1fr_auto_1fr] gap-3 px-4 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-8 transition-[opacity,translate,visibility] duration-300 ease-out group-data-[collapsed=true]/header:invisible group-data-[collapsed=true]/header:pointer-events-none group-data-[collapsed=true]/header:opacity-0 group-data-[collapsed=true]/header:-translate-y-2">
              <Link href="/" aria-label="AI Patterns home" className="logo-link flex items-center gap-2 font-semibold tracking-tight">
                <span className="logo-beam -m-1 p-1">
                  <AnimatedOrigami className="size-6" />
                </span>
                <span className="hidden xl:inline">AI Patterns</span>
              </Link>
              <SiteNav className="flex-1 justify-center sm:flex-none sm:justify-start" />
            </div>
            <div className="pointer-events-auto">
              <SiteCommandPalette />
            </div>
            <div className="hidden justify-end sm:flex transition-[opacity,translate,visibility] duration-300 ease-out group-data-[collapsed=true]/header:invisible group-data-[collapsed=true]/header:pointer-events-none group-data-[collapsed=true]/header:opacity-0 group-data-[collapsed=true]/header:-translate-y-2">
              <SiteActions />
            </div>
          </div>
        </SiteHeader>
        <div className="flex-1">{children}</div>
        <Footer />
        <StarToast />
        <Script id="gtm-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: GTM_INIT_SCRIPT }} />
      </body>
    </html>
  );
}
