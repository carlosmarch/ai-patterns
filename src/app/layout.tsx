import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Origami } from "lucide-react";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

import { Footer } from "@/components/footer";
import { SiteNav } from "@/components/site-nav";
import { ScrollRestoration } from "@/components/scroll-restoration";

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
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: SCROLL_RESTORATION_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <ScrollRestoration />
        <header className="border-b">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <Origami className="size-5" />
              AI Patterns
            </Link>
            <SiteNav />
          </div>
        </header>
        <div className="flex-1">{children}</div>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
