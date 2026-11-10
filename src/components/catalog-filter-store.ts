"use client";

import { useSyncExternalStore } from "react";

// The job the catalogue is filtered to (?job=), shared from the page that owns
// the filter (/patterns, /gallery) with the patterns sidebar, which lives in
// the layout and so can't read the page's state. null when not filtered to a
// job ("All", "New", or a page without a filter).
let activeJob: string | null = null;
const listeners = new Set<() => void>();

export function setCatalogJob(job: string | null) {
  if (job === activeJob) return;
  activeJob = job;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useCatalogJob() {
  return useSyncExternalStore(subscribe, () => activeJob, () => null);
}
