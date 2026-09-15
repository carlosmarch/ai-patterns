"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BadgeCheck,
  ChevronDown,
  ExternalLink,
  Plus,
  Search,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type ToolPermission = "allow" | "always-ask" | "disable";

export interface ConnectorTool {
  id: string;
  name: string;
  description: string;
  badge?: string;
  permission: ToolPermission;
}

export interface ConnectorToolGroup {
  id: string;
  label: string;
  tools: ConnectorTool[];
}

export interface ConnectorLink {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface ConnectorPanelProps {
  appName: string;
  appDescription: string;
  appIcon?: React.ReactNode;
  verified?: boolean;
  overview?: string[];
  links?: ConnectorLink[];
  toolGroups: ConnectorToolGroup[];
  onAddConnector?: () => void;
  onClose?: () => void;
  onPermissionChange?: (toolId: string, permission: ToolPermission) => void;
  onGroupAllow?: (groupId: string) => void;
  className?: string;
}

// ─── Permission toggle ────────────────────────────────────────────────────────

function PermissionToggle({
  value,
  onChange,
  toolName,
}: {
  value: ToolPermission;
  onChange: (p: ToolPermission) => void;
  toolName: string;
}) {
  const options: { value: ToolPermission; label: string }[] = [
    { value: "disable", label: "Disable" },
    { value: "always-ask", label: "Always ask" },
    { value: "allow", label: "Allow" },
  ];

  return (
    <div
      role="group"
      aria-label={`Permission for ${toolName}`}
      className="flex shrink-0 items-center gap-1"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            value === opt.value
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Tool row ─────────────────────────────────────────────────────────────────

function ToolRow({
  tool,
  onPermissionChange,
}: {
  tool: ConnectorTool;
  onPermissionChange: (p: ToolPermission) => void;
}) {
  return (
    <div className="flex items-start gap-3 border-t px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold">{tool.name}</span>
          {tool.badge && (
            <span className="rounded-full border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {tool.badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {tool.description}
        </p>
      </div>
      <PermissionToggle
        value={tool.permission}
        onChange={onPermissionChange}
        toolName={tool.name}
      />
    </div>
  );
}

// ─── Tool group section ───────────────────────────────────────────────────────

function ToolGroupSection({
  group,
  onPermissionChange,
  onGroupAllow,
}: {
  group: ConnectorToolGroup & { tools: ConnectorTool[] };
  onPermissionChange: (toolId: string, p: ToolPermission) => void;
  onGroupAllow: (groupId: string) => void;
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const allAllowed = group.tools.every((t) => t.permission === "allow");

  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-2">
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          className="flex flex-1 items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronDown
            className={cn(
              "size-3.5 shrink-0 transition-transform",
              collapsed && "-rotate-90",
            )}
            aria-hidden
          />
          {group.label}
        </button>
        {!allAllowed && (
          <button
            type="button"
            onClick={() => onGroupAllow(group.id)}
            className="rounded-md bg-foreground px-2.5 py-1 text-xs font-medium text-background transition-opacity hover:opacity-80"
          >
            Allow
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            {group.tools.map((tool) => (
              <ToolRow
                key={tool.id}
                tool={tool}
                onPermissionChange={(p) => onPermissionChange(tool.id, p)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

function FilterBar({
  groups,
  activeGroup,
  onGroupChange,
  query,
  onQueryChange,
}: {
  groups: ConnectorToolGroup[];
  activeGroup: string | null;
  onGroupChange: (id: string | null) => void;
  query: string;
  onQueryChange: (q: string) => void;
}) {
  const [dropOpen, setDropOpen] = React.useState(false);
  const dropRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!dropOpen) return;
    function handle(e: MouseEvent) {
      if (!dropRef.current?.contains(e.target as Node)) setDropOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [dropOpen]);

  const currentLabel =
    groups.find((g) => g.id === activeGroup)?.label ?? "All";

  return (
    <div className="flex items-center gap-2 border-b px-4 py-2.5">
      <div ref={dropRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setDropOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={dropOpen}
          className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
        >
          {currentLabel}
          <ChevronDown
            className={cn(
              "size-3 opacity-60 transition-transform",
              dropOpen && "rotate-180",
            )}
            aria-hidden
          />
        </button>

        <AnimatePresence>
          {dropOpen && (
            <motion.ul
              role="listbox"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.1 }}
              className="absolute left-0 top-full z-10 mt-1 min-w-[140px] overflow-hidden rounded-xl border bg-popover shadow-lg"
            >
              <li>
                <button
                  type="button"
                  role="option"
                  aria-selected={activeGroup === null}
                  onClick={() => {
                    onGroupChange(null);
                    setDropOpen(false);
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-left text-xs transition-colors hover:bg-accent",
                    activeGroup === null && "font-semibold",
                  )}
                >
                  All
                </button>
              </li>
              {groups.map((g) => (
                <li key={g.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={activeGroup === g.id}
                    onClick={() => {
                      onGroupChange(g.id);
                      setDropOpen(false);
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-left text-xs transition-colors hover:bg-accent",
                      activeGroup === g.id && "font-semibold",
                    )}
                  >
                    {g.label}
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      <div className="relative flex-1">
        <Search
          className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search tools"
          aria-label="Search tools"
          className="w-full rounded-md border bg-background py-1.5 pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ConnectorPanel({
  appName,
  appDescription,
  appIcon,
  verified = false,
  overview = [],
  links = [],
  toolGroups: initialGroups,
  onAddConnector,
  onClose,
  onPermissionChange,
  onGroupAllow,
  className,
}: ConnectorPanelProps) {
  const [toolGroups, setToolGroups] = React.useState(initialGroups);
  const [query, setQuery] = React.useState("");
  const [activeGroup, setActiveGroup] = React.useState<string | null>(null);

  function handlePermissionChange(toolId: string, permission: ToolPermission) {
    setToolGroups((prev) =>
      prev.map((group) => ({
        ...group,
        tools: group.tools.map((t) =>
          t.id === toolId ? { ...t, permission } : t,
        ),
      })),
    );
    onPermissionChange?.(toolId, permission);
  }

  function handleGroupAllow(groupId: string) {
    setToolGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              tools: group.tools.map((t) => ({
                ...t,
                permission: "allow" as ToolPermission,
              })),
            }
          : group,
      ),
    );
    onGroupAllow?.(groupId);
  }

  const filteredGroups = toolGroups
    .filter((g) => !activeGroup || g.id === activeGroup)
    .map((g) => ({
      ...g,
      tools: g.tools.filter(
        (t) =>
          !query ||
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.description.toLowerCase().includes(query.toLowerCase()),
      ),
    }))
    .filter((g) => g.tools.length > 0);

  return (
    <div
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-2xl border bg-background shadow-xl",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 border-b px-5 py-4">
        {appIcon && (
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
            {appIcon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold">{appName}</span>
            {verified && (
              <BadgeCheck
                className="size-4 shrink-0 text-blue-500"
                aria-label="Verified"
              />
            )}
          </div>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {appDescription}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onAddConnector}
            className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-80"
          >
            <Plus className="size-3.5" aria-hidden />
            Add connector
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <aside
          aria-label="Connector overview"
          className="w-44 shrink-0 border-r px-4 py-4"
        >
          {overview.length > 0 && (
            <div className="mb-5">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Overview
              </p>
              <ul className="space-y-2">
                {overview.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/40"
                      aria-hidden
                    />
                    <span className="text-xs leading-relaxed text-muted-foreground">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {links.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Links
              </p>
              <ul className="space-y-1.5">
                {links.map((link, i) => {
                  const Icon = link.icon ?? ExternalLink;
                  return (
                    <li key={i}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Icon className="size-3.5 shrink-0" aria-hidden />
                        {link.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </aside>

        {/* Tools column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="px-4 py-2.5">
            <h2 className="text-xs font-semibold">Tools</h2>
          </div>

          <FilterBar
            groups={toolGroups}
            activeGroup={activeGroup}
            onGroupChange={setActiveGroup}
            query={query}
            onQueryChange={setQuery}
          />

          <div className="flex-1 overflow-y-auto">
            {filteredGroups.length === 0 ? (
              <p className="px-4 py-10 text-center text-xs text-muted-foreground">
                No tools match your search.
              </p>
            ) : (
              filteredGroups.map((group) => (
                <ToolGroupSection
                  key={group.id}
                  group={group}
                  onPermissionChange={handlePermissionChange}
                  onGroupAllow={handleGroupAllow}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
