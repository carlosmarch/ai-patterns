import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Children, Fragment, cloneElement, createElement, isValidElement, type ComponentType, type ReactElement, type ReactNode } from "react";
import { ImageResponse } from "next/og";

/*
 * Shared renderer for the Open Graph / Twitter share images
 * (`opengraph-image.tsx` routes). They're generated once at build time and
 * exported as static PNGs, like every other route on this site.
 */

export const OG_SIZE = { width: 1200, height: 630 };

// The light theme from globals.css, as sRGB hex (Satori can't read CSS vars or oklch).
const theme = {
  background: "#ffffff",
  foreground: "#141210",
  card: "#ffffff",
  muted: "#f2f1ef",
  "muted-foreground": "#706c68",
  border: "#e4e2df",
} as const;

type ThemeColor = keyof typeof theme;

// ---------------------------------------------------------------------------
// Fonts

const geistRegular = readFile(join(process.cwd(), "node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf"));

async function loadGeist(weight: number) {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Geist:wght@${weight}`)).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) throw new Error("no font url");
    return await (await fetch(url)).arrayBuffer();
  } catch {
    // Offline build: fall back to the regular cut bundled with Next.
    return (await geistRegular).buffer as ArrayBuffer;
  }
}

let fonts: Promise<{ name: string; data: ArrayBuffer; weight: 400 | 600; style: "normal" }[]> | undefined;

function getFonts() {
  fonts ??= Promise.all([geistRegular, loadGeist(600)]).then(([regular, semibold]) => [
    { name: "Geist", data: regular.buffer as ArrayBuffer, weight: 400, style: "normal" },
    { name: "Geist", data: semibold, weight: 600, style: "normal" },
  ]);
  return fonts;
}

// ---------------------------------------------------------------------------
// Pattern thumbnails → plain SVG

/**
 * Thumbnails are drawn with Tailwind classes (`fill-muted-foreground/35`,
 * `stroke-border`, `[stop-color:var(--background)]`…) so they follow the
 * site theme. Satori only understands presentation attributes, so turn each
 * `className` into the equivalent `fill` / `stroke` / `stopColor` props.
 */
function classToProps(className: string) {
  const props: Record<string, string | number> = {};
  for (const token of className.split(/\s+/)) {
    const paint = token.match(/^(fill|stroke)-([a-z-]+?)(?:\/(\d+))?$/);
    if (paint && paint[2] in theme) {
      const [, prop, color, opacity] = paint;
      props[prop] = theme[color as ThemeColor];
      if (opacity) props[`${prop}Opacity`] = Number(opacity) / 100;
      continue;
    }
    const stop = token.match(/^\[stop-color:var\(--([a-z-]+)\)\]$/);
    if (stop && stop[1] in theme) props.stopColor = theme[stop[1] as ThemeColor];
  }
  return props;
}

/** Render function components away and swap theme classes for SVG paint props. */
function toPlainSvg(node: ReactNode): ReactNode {
  if (!isValidElement(node)) return Array.isArray(node) ? Children.map(node, toPlainSvg) : node;
  const el = node as ReactElement<{ className?: string; children?: ReactNode }>;
  if (typeof el.type === "function") {
    return toPlainSvg((el.type as (props: object) => ReactNode)(el.props));
  }
  if ((el.type as unknown) === Fragment) return Children.map(el.props.children, toPlainSvg);
  const { className, children, ...rest } = el.props;
  const props = { ...rest, ...(className ? classToProps(className) : {}), className: undefined };
  return cloneElement(el, props, Children.map(children, toPlainSvg));
}

/** A pattern's `thumbnail.tsx`, as an `<svg>` Satori can draw at `width`×`height`. */
export function plainThumbnail(Thumbnail: ComponentType, width: number, height: number) {
  const svg = toPlainSvg(createElement(Thumbnail)) as ReactElement<{ width?: number; height?: number }>;
  return cloneElement(svg, { width, height });
}

// ---------------------------------------------------------------------------
// Card

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <svg width="44" height="44" viewBox="0 0 32 32">
        <rect width="32" height="32" rx="7.5" fill={theme.foreground} />
        <g
          transform="translate(16 16.2) scale(1.18) translate(-11.95 -12)"
          fill="none"
          stroke={theme.background}
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 12V4a1 1 0 0 1 1-1h6.297a1 1 0 0 1 .651 1.759l-4.696 4.025" />
          <path d="m12 21-7.414-7.414A2 2 0 0 1 4 12.172V6.415a1.002 1.002 0 0 1 1.707-.707L20 20.009" />
          <path d="m12.214 3.381 8.414 14.966a1 1 0 0 1-.167 1.199l-1.168 1.163a1 1 0 0 1-.706.291H6.351a1 1 0 0 1-.625-.219L3.25 18.8a1 1 0 0 1 .631-1.781l4.165.027" />
        </g>
      </svg>
      <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.6, color: theme.foreground }}>AI Patterns</div>
    </div>
  );
}

/** A pattern thumbnail on its card surface, at `scale` × the 200×120 canvas. */
export function ThumbnailCard({ Thumbnail, scale }: { Thumbnail: ComponentType; scale: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: theme.muted,
        border: `1px solid ${theme.border}`,
        borderRadius: 12 * scale,
        width: 200 * scale,
        height: 120 * scale,
      }}
    >
      {plainThumbnail(Thumbnail, 176 * scale, 105.6 * scale)}
    </div>
  );
}

export async function ogImage({
  eyebrow,
  title,
  description,
  aside,
  titleSize = title.length > 24 ? 60 : 72,
}: {
  titleSize?: number;
  eyebrow?: string;
  title: string;
  description: string;
  aside: ReactNode;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: theme.background,
          fontFamily: "Geist",
          padding: 72,
          gap: 56,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
          <Logo />
          <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", marginBottom: "auto" }}>
            {eyebrow ? (
              <div style={{ fontSize: 26, color: theme["muted-foreground"], marginBottom: 16 }}>{eyebrow}</div>
            ) : null}
            <div
              style={{
                fontSize: titleSize,
                fontWeight: 600,
                letterSpacing: -titleSize * 0.032,
                lineHeight: 1.04,
                color: theme.foreground,
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 28,
                lineHeight: 1.4,
                color: theme["muted-foreground"],
                marginTop: 24,
                display: "block",
                lineClamp: 3,
              }}
            >
              {/* Geist has no ⌘ glyph. */}
              {description.replaceAll("⌘", "Cmd-")}
            </div>
          </div>
          <div style={{ fontSize: 24, color: theme["muted-foreground"] }}>ai-patterns.app</div>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>{aside}</div>
      </div>
    ),
    { ...OG_SIZE, fonts: await getFonts() },
  );
}
