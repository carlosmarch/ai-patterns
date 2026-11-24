type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

// Events are pushed to Google Tag Manager's dataLayer, which the root layout
// creates only on the production host; elsewhere (dev, previews) they're dropped.
// In GTM, a Custom Event trigger on the event name picks them up.
function track(event: string, props?: Props) {
  if (typeof window !== "undefined") window.dataLayer?.push({ event, ...props });
}

export type CodeCopiedType = "component" | "spec" | "install_command" | "mcp_config";

export function trackCodeCopied(props: { type: CodeCopiedType; category?: string; slug?: string }) {
  track("code_copied", props);
}

export function trackTabChanged(props: { tab: string; category: string; slug: string }) {
  track("tab_changed", props);
}

export function trackSpecDownloaded(props: { category: string; slug: string }) {
  track("spec_downloaded", props);
}

export function trackDemoPromptSubmitted(props: { is_suggestion: boolean; suggestion_id?: string }) {
  track("demo_prompt_submitted", props);
}

export function trackMcpInstallClicked(props: { client: string; page: string }) {
  track("mcp_install_clicked", props);
}

export function trackGithubClicked(props: { page: string }) {
  track("github_clicked", props);
}

export type SearchResultType = "pattern" | "recent" | "page" | "job";

/** A result picked in site search (⌘K); `search_term` is empty when picked from the open state. */
export function trackSearchResultSelected(props: {
  search_term: string;
  result_type: SearchResultType;
  href: string;
  position: number;
  new_tab: boolean;
}) {
  track("search_result_selected", props);
}

/** A job filter pill on /patterns (`all`, `new` or a job id). */
export function trackJobFilterChanged(props: { job: string }) {
  track("job_filter_changed", props);
}

export function trackSkillCtaClicked(props: { page: string }) {
  track("skill_cta_clicked", props);
}

export function trackStarToast(props: { action: "shown" | "clicked" | "dismissed" }) {
  track("star_toast", props);
}

/** Prev/next between pattern pages, by click or ←/→. */
export function trackPatternNav(props: { direction: "prev" | "next"; via: "click" | "keyboard"; to: string }) {
  track("pattern_nav", props);
}
