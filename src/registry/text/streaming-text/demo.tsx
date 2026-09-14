"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { StreamingText, type StreamSegment } from "./component";
import { SourcesStack, type Source } from "@/registry/text/sources-stack/component";

function favicon(domain: string) {
  return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
}

const sources: Source[] = [
  {
    title: "Next.js Docs — App Router",
    domain: "nextjs.org",
    url: "https://nextjs.org/docs/app",
    faviconUrl: favicon("nextjs.org"),
  },
  {
    title: "Motion for React",
    domain: "motion.dev",
    url: "https://motion.dev",
    faviconUrl: favicon("motion.dev"),
  },
  {
    title: "shadcn/ui",
    domain: "ui.shadcn.com",
    url: "https://ui.shadcn.com",
    faviconUrl: favicon("ui.shadcn.com"),
  },
];

const segments: StreamSegment[] = [
  {
    type: "text",
    content:
      "For a multi-step agent, pair the thinking loader with an expandable trace — it collapses into a one-line summary and expands into the full step list. ",
  },
  { type: "source", label: "docs" },
  {
    type: "text",
    content:
      " Add a stop-generation button so people can bail out mid-stream, and a follow-up list once the reply lands.",
  },
];

const followUps = ["Show me expandable-trace", "Show me thinking-loader", "How do I install the skill?"];

export default function StreamingTextDemo() {
  const [run, setRun] = React.useState(0);
  const [done, setDone] = React.useState(false);

  function replay() {
    setDone(false);
    setRun((r) => r + 1);
  }

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={run}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            <StreamingText segments={segments} followUps={followUps} onComplete={() => setDone(true)} />
          </motion.div>
        </AnimatePresence>
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
            >
              <SourcesStack sources={sources} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <button
        type="button"
        onClick={replay}
        className="mx-auto flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <RotateCcw className="size-3" />
        Replay
      </button>
    </div>
  );
}
