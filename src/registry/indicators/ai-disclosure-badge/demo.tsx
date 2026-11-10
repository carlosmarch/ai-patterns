"use client";

import * as React from "react";

import { VoiceOrb } from "@/registry/voice/voice-orb/component";

import { AiDisclosureBadge } from "./component";

/** Banded steel, light and dark, sampled by the SVG filter that tints the orb. */
const STEEL = {
  light: ["#0b0f14", "#6b7280", "#1f2937", "#a3a9b3", "#111827", "#4b5563", "#d1d5db", "#1f2937", "#6b7280"],
  dark: ["#ffffff", "#6b7280", "#f3f4f6", "#374151", "#e5e7eb", "#9ca3af", "#ffffff", "#4b5563", "#d1d5db"],
};

function steelImage(stops: string[]) {
  const s = stops.map((c, i) => `<stop offset='${i / (stops.length - 1)}' stop-color='${c}'/>`).join("");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1' preserveAspectRatio='none'><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>${s}</linearGradient><rect width='1' height='1' fill='url(#g)'/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export default function AiDisclosureBadgeDemo() {
  const [edited, setEdited] = React.useState(false);

  const details = {
    model: "Atlas",
    generatedAt: "Today, 14:02",
    editedBy: edited ? "Maya Chen" : undefined,
    note: "May contain mistakes. Check important facts.",
  };

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-4 pb-28">
      <div className="flex gap-2">
        {[false, true].map((value) => (
          <button
            key={String(value)}
            type="button"
            onClick={() => setEdited(value)}
            className={[
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              edited === value ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {value ? "Edited by a person" : "Unedited"}
          </button>
        ))}
      </div>

      <figure className="relative aspect-square w-full overflow-visible rounded-2xl border bg-gradient-to-br from-muted/40 to-muted">
        {/* The generated image: a steel particle orb, as on the research page. */}
        <div aria-hidden className="absolute inset-0 overflow-hidden rounded-2xl">
          <svg className="absolute size-0">
            {(["light", "dark"] as const).map((theme) => (
              <filter
                key={theme}
                id={`disclosure-orb-steel-${theme}`}
                x="0"
                y="0"
                width="1"
                height="1"
                primitiveUnits="objectBoundingBox"
                colorInterpolationFilters="sRGB"
              >
                <feImage
                  href={steelImage(STEEL[theme])}
                  x="-0.25"
                  y="-0.25"
                  width="1.5"
                  height="1.5"
                  preserveAspectRatio="none"
                  result="steel"
                />
                <feComposite in="steel" in2="SourceGraphic" operator="in" />
              </filter>
            ))}
          </svg>
          <div className="absolute inset-[22%] rounded-full bg-[radial-gradient(circle_at_35%_30%,rgb(148_163_184/0.45),rgb(203_213_225/0.18)_40%,transparent_70%)] dark:bg-[radial-gradient(circle_at_35%_30%,rgb(255_255_255/0.16),rgb(148_163_184/0.06)_40%,transparent_70%)]" />
          <VoiceOrb
            state="idle"
            particles={2400}
            className="absolute inset-0 size-full text-foreground [filter:url(#disclosure-orb-steel-light)] dark:[filter:url(#disclosure-orb-steel-dark)]"
          />
        </div>
        <AiDisclosureBadge variant="overlay" details={details} className="absolute top-2 left-2" />
      </figure>
    </div>
  );
}
