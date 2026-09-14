import { track } from "@vercel/analytics";

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
