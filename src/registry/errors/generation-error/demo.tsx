"use client";

import * as React from "react";

import { GenerationError, type GenerationErrorReason } from "./component";

const errorCodes: Record<GenerationErrorReason, string> = {
  network: "ERR_CONNECTION_RESET at stream.read (chunk 12)",
  server: "ERR_UPSTREAM_500 request_id=req_8f2c1a",
  timeout: "ERR_DEADLINE_EXCEEDED after 30000ms",
  filtered: "ERR_CONTENT_POLICY category=safety",
};

const reasons: { value: GenerationErrorReason; label: string }[] = [
  { value: "network", label: "Network" },
  { value: "server", label: "Server" },
  { value: "timeout", label: "Timeout" },
  { value: "filtered", label: "Filtered" },
];

export default function GenerationErrorDemo() {
  const [reason, setReason] = React.useState<GenerationErrorReason>("server");
  const [retrying, setRetrying] = React.useState(false);
  const [key, setKey] = React.useState(0);

  function handleRetry() {
    setRetrying(true);
    window.setTimeout(() => {
      setRetrying(false);
      setKey((k) => k + 1);
    }, 1600);
  }

  function selectReason(r: GenerationErrorReason) {
    setReason(r);
    setRetrying(false);
    setKey((k) => k + 1);
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {reasons.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => selectReason(value)}
            className={[
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              reason === value
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      <GenerationError
        key={key}
        reason={reason}
        errorCode={errorCodes[reason]}
        onRetry={handleRetry}
        retrying={retrying}
      />
    </div>
  );
}
