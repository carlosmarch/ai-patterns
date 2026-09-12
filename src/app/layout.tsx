import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

import { Footer } from "@/components/footer";
import { DesignSystemSwitcher } from "@/components/design-system-switcher";

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var theme = localStorage.getItem("theme");
    var isDark = theme === "dark" || (theme !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
  } catch (e) {}
})();
`;

const DESIGN_SYSTEM_IDS = ["shadcn", "material", "ant", "chakra", "carbon", "bootstrap"];

const DESIGN_SYSTEM_INIT_SCRIPT = `
(function () {
  try {
    var ids = ${JSON.stringify(DESIGN_SYSTEM_IDS)};
    var stored = localStorage.getItem("design-system");
    var system = ids.indexOf(stored) !== -1 ? stored : "shadcn";
    document.documentElement.setAttribute("data-design-system", system);
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
  title: "ai-patterns",
  description: "A copy-paste library of animated UI components.",
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
        <script dangerouslySetInnerHTML={{ __html: DESIGN_SYSTEM_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <header className="border-b">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-4">
            <Link href="/" className="font-semibold tracking-tight">
              ai-patterns
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/patterns" className="text-sm text-muted-foreground hover:text-foreground">
                Patterns
              </Link>
              <Link href="/skill" className="text-sm text-muted-foreground hover:text-foreground">
                Skill
              </Link>
            </nav>
            <DesignSystemSwitcher />
          </div>
        </header>
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
