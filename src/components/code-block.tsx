import { codeToHtml } from "shiki";

import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/copy-button";

export async function CodeBlock({
  code,
  lang = "tsx",
  wrap = false,
}: {
  code: string;
  lang?: string;
  /** Wrap long lines instead of scrolling horizontally — use for prose-like content (e.g. markdown). */
  wrap?: boolean;
}) {
  const html = await codeToHtml(code, {
    lang,
    theme: "github-dark",
  });

  return (
    <div className="relative">
      <CopyButton text={code} className="absolute right-3 top-3" />
      <div
        className={cn(
          "max-h-[520px] overflow-auto rounded-lg border text-sm [&_pre]:p-4",
          wrap && "[&_code]:whitespace-pre-wrap [&_code]:break-words"
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
