import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Origami } from "lucide-react";
import "./globals.css";

import { Footer } from "@/components/footer";

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var theme = localStorage.getItem("theme");
    var isDark = theme === "dark" || (theme !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
  } catch (e) {}
})();
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
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <header className="border-b">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <Origami className="size-5" />
              AI Patterns
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/patterns" className="text-sm text-muted-foreground hover:text-foreground">
                Patterns
              </Link>
              <Link href="/demo" className="text-sm text-muted-foreground hover:text-foreground">
                Demo
              </Link>
              <Link href="/skill" className="text-sm text-muted-foreground hover:text-foreground">
                Skill
              </Link>
            </nav>
          </div>
        </header>
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
