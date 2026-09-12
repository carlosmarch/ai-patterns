"use client";

import { TerminalSquare } from "lucide-react";

import { ToolApproval } from "./component";

export default function ToolApprovalDemo() {
  return (
    <ToolApproval
      icon={TerminalSquare}
      toolName="Bash"
      summary="Run a shell command"
      detail="npm install lodash"
      className="w-full max-w-sm"
    />
  );
}
