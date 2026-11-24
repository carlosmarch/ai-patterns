"use client";

import { useEffect } from "react";

import { trackFormSubmitted, trackTextCopied, trackUiClick, type UiContext } from "@/lib/analytics";

// Everything a person can click: links, buttons and ARIA controls.
const CLICKABLE =
  'a[href], button, summary, input[type="checkbox"], input[type="radio"], select, [role="button"], [role="link"], [role="tab"], [role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"], [role="option"], [role="switch"], [role="radio"], [role="checkbox"], [role="treeitem"]';

const LANDMARKS: [selector: string, area: string][] = [
  ['[role="dialog"]', "dialog"],
  ["header", "header"],
  ["footer", "footer"],
  ["aside", "sidebar"],
  ["nav", "nav"],
  ["main", "main"],
];

const MAX_LABEL = 100;

function context(el: Element): UiContext {
  const named = el.closest<HTMLElement>("[data-track-area]")?.dataset.trackArea;
  const area = named ?? LANDMARKS.find(([selector]) => el.closest(selector))?.[1] ?? "page";
  const demo = el.closest<HTMLElement>("[data-track-demo]")?.dataset.trackDemo;
  return { page_path: window.location.pathname, area, ...(demo ? { demo } : {}) };
}

function labelOf(el: HTMLElement) {
  const text =
    el.getAttribute("aria-label") ||
    el.getAttribute("title") ||
    el.innerText ||
    (el as HTMLInputElement).value ||
    el.getAttribute("name") ||
    "";
  return text.replace(/\s+/g, " ").trim().slice(0, MAX_LABEL);
}

/**
 * Sends a `ui_click`, `form_submitted` or `text_copied` event (src/lib/analytics.ts)
 * for every interaction on the site — chrome, pages and pattern demos alike —
 * from three document-level listeners, so new UI is tracked without wiring.
 */
export function SiteTracking() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = e.target instanceof Element ? e.target.closest<HTMLElement>(CLICKABLE) : null;
      if (!el || el.matches(":disabled, [aria-disabled='true']")) return;

      const anchor = el instanceof HTMLAnchorElement ? el : null;
      let href: string | undefined;
      let outbound: boolean | undefined;
      if (anchor) {
        const url = new URL(anchor.href, window.location.href);
        outbound = url.origin !== window.location.origin;
        href = outbound ? url.href : url.pathname + url.search + url.hash;
      }

      trackUiClick({
        ...context(el),
        element: el.getAttribute("role") ?? el.tagName.toLowerCase(),
        label: labelOf(el),
        ...(href ? { href, outbound } : {}),
      });
    }

    function onSubmit(e: SubmitEvent) {
      const form = e.target instanceof HTMLFormElement ? e.target : null;
      if (!form) return;
      trackFormSubmitted({
        ...context(form),
        form: form.getAttribute("aria-label") || form.getAttribute("name") || form.id || "form",
      });
    }

    function onCopy(e: ClipboardEvent) {
      const length = window.getSelection()?.toString().length ?? 0;
      const target = e.target instanceof Element ? e.target : document.body;
      if (length > 0) trackTextCopied({ ...context(target), length });
    }

    // Capture phase: still sees clicks that a handler stops from bubbling.
    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    document.addEventListener("copy", onCopy, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
      document.removeEventListener("copy", onCopy, true);
    };
  }, []);

  return null;
}
