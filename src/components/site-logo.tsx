"use client";

import * as React from "react";
import Link from "next/link";

import { OrigamiMarkAnimated } from "@/components/origami-mark";

/** Header brand link: the crane folds in on load and refolds on hover/focus. */
export function SiteLogo() {
  const [replay, setReplay] = React.useState(0);
  const again = () => setReplay((n) => n + 1);
  return (
    <Link
      href="/"
      onPointerEnter={again}
      onFocus={again}
      className="flex items-center gap-2 font-semibold tracking-tight"
    >
      <OrigamiMarkAnimated trigger="mount" replayKey={replay} className="size-5" />
      AI Patterns
    </Link>
  );
}
