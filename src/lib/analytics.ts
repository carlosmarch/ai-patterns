type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    umami?: { track: (event: string, props?: Props) => void };
  }
}

// No analytics provider is loaded yet; events go to Umami if its script is
// on the page, and are dropped otherwise.
function track(event: string, props?: Props) {
  if (typeof window !== "undefined") window.umami?.track(event, props);
}

export type CodeCopiedType = "component" | "spec" | "install_command";

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

export function trackGithubClicked(props: { page: string }) {
  track("github_clicked", props);
}
