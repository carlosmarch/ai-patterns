import { codeToHtml } from "shiki";

import { CopyButton } from "@/components/copy-button";

export async function CodeBlock({ code, lang = "tsx" }: { code: string; lang?: string }) {
  const html = await codeToHtml(code, {
    lang,
    theme: "github-dark",
  });

  return (
    <div className="relative">
      <CopyButton text={code} className="absolute right-3 top-3" />
      <div
        className="max-h-[520px] overflow-auto rounded-lg border text-sm [&_pre]:p-4"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
