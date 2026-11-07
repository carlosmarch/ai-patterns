import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import bash from "@shikijs/langs/bash";
import markdown from "@shikijs/langs/markdown";
import tsx from "@shikijs/langs/tsx";
import githubDark from "@shikijs/themes/github-dark";

// One shared highlighter, loaded with only the grammars the site uses and
// the pure-JS regex engine. The default `codeToHtml` from "shiki" loads the
// Oniguruma WASM engine at runtime, which Cloudflare Workers can't do — so
// any page rendered on demand there 500'd.

export type HighlightLang = "tsx" | "markdown" | "bash";

let highlighter: Promise<HighlighterCore> | undefined;

function getHighlighter() {
  highlighter ??= createHighlighterCore({
    themes: [githubDark],
    langs: [tsx, markdown, bash],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

export async function highlight(code: string, lang: HighlightLang) {
  return (await getHighlighter()).codeToHtml(code, { lang, theme: "github-dark" });
}
