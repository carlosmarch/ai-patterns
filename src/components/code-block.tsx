import { highlight, type HighlightLang } from "@/lib/highlight";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/copy-button";
import { DownloadButton } from "@/components/download-button";
import type { CodeCopiedType } from "@/lib/analytics";

export async function CodeBlock({
  code,
  lang = "tsx",
  wrap = false,
  trackAs,
  download,
}: {
  code: string;
  lang?: HighlightLang;
  /** Wrap long lines instead of scrolling horizontally — use for prose-like content (e.g. markdown). */
  wrap?: boolean;
  /** Passed through to CopyButton for analytics. */
  trackAs?: CodeCopiedType;
  /** File name to offer the code as a download, next to the Copy button. */
  download?: string;
}) {
  const html = await highlight(code, lang);

  return (
    <div className="relative">
      <div className="absolute right-3 top-3 flex items-center gap-1.5">
        {download && <DownloadButton iconOnly filename={download} content={code} />}
        <CopyButton text={code} trackAs={trackAs} />
      </div>
      <div
        data-code-scroll
        className={cn(
          "max-h-[520px] overflow-auto rounded-lg border text-sm [&_pre]:p-4",
          wrap && "[&_code]:whitespace-pre-wrap [&_code]:break-words"
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
