/**
 * The site-wide share image, exported from src/app/opengraph-image.tsx.
 * Pages that set their own `openGraph` metadata lose the file-based image
 * from the root segment, so they point at it explicitly.
 */
export const SITE_SHARE_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "AI Patterns — production components for AI agent UIs",
  type: "image/png",
};
