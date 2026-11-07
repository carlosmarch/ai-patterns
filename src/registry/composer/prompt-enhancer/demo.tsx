"use client";

import * as React from "react";

import { PromptEnhancer } from "./component";

const SAMPLE = "a logo for my coffee shop";

// A canned rewrite standing in for a model call.
function fakeEnhance(prompt: string) {
  return new Promise<string>((resolve) =>
    setTimeout(
      () =>
        resolve(
          prompt.toLowerCase().includes("logo")
            ? "Design a minimal, modern logo for my independent coffee shop: a single-colour mark that works at small sizes, warm earthy tones, with a subtle coffee bean or steam motif."
            : `${prompt.trim().replace(/\.$/, "")}, written in a clear, friendly tone with three concrete examples and a short summary at the end.`
        ),
      1400
    )
  );
}

export default function PromptEnhancerDemo() {
  const [value, setValue] = React.useState(SAMPLE);
  const [sent, setSent] = React.useState<string | null>(null);

  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <PromptEnhancer
        value={value}
        onChange={setValue}
        onEnhance={fakeEnhance}
        onSubmit={(prompt) => {
          setSent(prompt);
          setValue("");
        }}
      />
      {sent && (
        <p className="px-1 text-xs text-muted-foreground">
          Sent: <span className="text-foreground">{sent}</span>{" "}
          <button type="button" className="underline underline-offset-2" onClick={() => { setValue(SAMPLE); setSent(null); }}>
            Reset
          </button>
        </p>
      )}
    </div>
  );
}
