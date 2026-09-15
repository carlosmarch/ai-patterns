"use client";

import { FileText, Globe } from "lucide-react";

import { ConnectorPanel } from "./component";

function VercelIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 76 65"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
    </svg>
  );
}

export default function ConnectorPanelDemo() {
  return (
    <ConnectorPanel
      appName="Vercel"
      appDescription="Manage teams, projects, and deployments; search documentation and control infrastructure."
      appIcon={<VercelIcon className="size-5" />}
      verified
      overview={[
        "Access deployment logs for debugging",
        "Search Vercel documentation",
        "Retrieve teams and projects data",
      ]}
      links={[
        { label: "Website", href: "https://vercel.com", icon: Globe },
        { label: "Documentation", href: "https://vercel.com/docs", icon: FileText },
      ]}
      toolGroups={[
        {
          id: "read-only",
          label: "Read-only tools",
          tools: [
            {
              id: "check-domain",
              name: "Check domain availability and price",
              description:
                "Check whether one or more domain names are available for purchase and retrieve their pricing information.",
              badge: "MCP",
              permission: "allow",
            },
            {
              id: "get-temp-access",
              name: "Get temporary access to a Vercel URL",
              description:
                "Generate a temporary shareable link (valid ~23 hours) that bypasses authentication for a protected Vercel deployment URL, avoiding 403 errors.",
              badge: "MCP",
              permission: "always-ask",
            },
            {
              id: "get-agent-run-details",
              name: "Get agent run details",
              description:
                "Get detailed metadata for a single agent run, including events, workflow metadata, usage, and subagent breakout data. Requires a run ID.",
              badge: "MCP",
              permission: "allow",
            },
            {
              id: "get-agent-run-trace",
              name: "Get agent run trace",
              description:
                "Get the full trace for a single agent run, including turns, messages, reasoning, tool calls, token usage, and tool input/output.",
              badge: "MCP",
              permission: "allow",
            },
            {
              id: "get-deployment",
              name: "Get a deployment",
              description:
                "Retrieve details for a specific Vercel deployment using its ID or URL, including status, metadata, and configuration.",
              badge: "MCP",
              permission: "disable",
            },
          ],
        },
        {
          id: "write",
          label: "Write tools",
          tools: [
            {
              id: "create-deployment",
              name: "Create a deployment",
              description:
                "Deploy a project by pushing a new build. Accepts environment variables, build settings, and a target environment.",
              badge: "MCP",
              permission: "always-ask",
            },
            {
              id: "update-env-var",
              name: "Update environment variable",
              description:
                "Create or update an environment variable for a project across one or more target environments (production, preview, development).",
              badge: "MCP",
              permission: "always-ask",
            },
            {
              id: "add-domain",
              name: "Add domain to project",
              description:
                "Assign a custom domain to a Vercel project and configure its DNS records automatically.",
              badge: "MCP",
              permission: "always-ask",
            },
          ],
        },
        {
          id: "team",
          label: "Team tools",
          tools: [
            {
              id: "list-team-members",
              name: "List team members",
              description:
                "Return all members of a Vercel team, including their roles, join dates, and access scopes.",
              badge: "MCP",
              permission: "allow",
            },
            {
              id: "invite-team-member",
              name: "Invite team member",
              description:
                "Send an invitation email to add a new member to the team with a specified role.",
              badge: "MCP",
              permission: "always-ask",
            },
            {
              id: "update-member-role",
              name: "Update member role",
              description:
                "Change the role of an existing team member between Owner, Member, and Developer.",
              badge: "MCP",
              permission: "always-ask",
            },
          ],
        },
        {
          id: "destructive",
          label: "Destructive tools",
          tools: [
            {
              id: "delete-deployment",
              name: "Delete a deployment",
              description:
                "Permanently remove a deployment by ID. This action cannot be undone.",
              badge: "MCP",
              permission: "disable",
            },
            {
              id: "remove-domain",
              name: "Remove domain from project",
              description:
                "Detach a custom domain from a project and delete its associated DNS configuration.",
              badge: "MCP",
              permission: "disable",
            },
            {
              id: "remove-team-member",
              name: "Remove team member",
              description:
                "Revoke a member's access to the team. They will lose access to all team projects immediately.",
              badge: "MCP",
              permission: "disable",
            },
          ],
        },
      ]}
      className="h-[560px] max-w-2xl"
    />
  );
}
