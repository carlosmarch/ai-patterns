import { ToolApproval } from "./component";

export default function ToolApprovalDemo() {
  return (
    <ToolApproval
      toolName="run_command"
      description="Wants to run a shell command in this project."
      command="rm -rf node_modules && npm install"
      destructive
    />
  );
}
