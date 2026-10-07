"use client";

import { ChevronRight } from "lucide-react";

import { ImagePeek, type PeekImage } from "./component";

function glyph(bg: string, shapes: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 200'><rect width='320' height='200' fill='${bg}'/>${shapes}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const line = "stroke='#171717' stroke-width='4' stroke-linecap='round' fill='none'";
const dot = (x: number, y: number) => `<circle cx='${x}' cy='${y}' r='6' fill='#171717'/>`;

const IMAGES: PeekImage[] = [
  {
    id: "1",
    alt: "Circle glyph on a blue background",
    label: "Read",
    src: glyph("#bfdbfe", `<circle cx='160' cy='100' r='52' fill='#fff'/>`),
  },
  {
    id: "2",
    alt: "Two squares joined by a line on a pink background",
    label: "Read",
    src: glyph(
      "#fbcfe8",
      `<rect x='70' y='70' width='60' height='60' fill='#fff'/><rect x='190' y='70' width='60' height='60' fill='#fff'/><path d='M100 100 L220 100' ${line}/>${dot(100, 100)}${dot(220, 100)}`
    ),
  },
  {
    id: "3",
    alt: "Horizontal stroke on a green background",
    label: "Generated",
    src: glyph("#bbf7d0", `<path d='M70 100 Q160 60 250 100' ${line}/>${dot(70, 100)}${dot(250, 100)}`),
  },
  {
    id: "4",
    alt: "Crossed lines on a lilac background",
    label: "Read",
    src: glyph(
      "#ddd6fe",
      `<path d='M90 50 L230 150 M230 50 L90 150' ${line}/>${dot(90, 50)}${dot(230, 150)}${dot(230, 50)}${dot(90, 150)}`
    ),
  },
  {
    id: "5",
    alt: "Triangle connecting a circle, a triangle and a square on a yellow background",
    label: "Read",
    src: glyph(
      "#fef08a",
      `<polygon points='160,30 200,90 120,90' fill='#fff'/><circle cx='95' cy='150' r='28' fill='#fff'/><rect x='205' y='122' width='56' height='56' fill='#fff'/><path d='M160 62 L225 150 L95 150 Z' ${line}/>${dot(160, 62)}${dot(225, 150)}${dot(95, 150)}`
    ),
  },
];

export default function ImagePeekDemo() {
  return (
    <div className="flex h-[300px] w-full max-w-lg items-start pt-4">
      <div className="flex w-full items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2">
        <button
          type="button"
          className="flex min-w-0 items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="truncate">Ran 16 commands, read 5 files</span>
          <ChevronRight className="size-3.5 shrink-0" />
        </button>
        <ImagePeek images={IMAGES} />
      </div>
    </div>
  );
}
