"use client";

import * as React from "react";

import { ConnectivityError } from "./component";

export default function ConnectivityErrorDemo() {
  const [key, setKey] = React.useState(0);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <ConnectivityError
        key={key}
        title="Connection lost"
        description="Check your internet connection, VPN or proxy and try again."
        onViewDetails={() => {}}
        onRetry={() => setKey((k) => k + 1)}
        onClose={() => setKey((k) => k + 1)}
      />
    </div>
  );
}
