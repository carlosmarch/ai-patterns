"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ChevronDown,
  Globe,
  Lock,
  Mail,
  PlusCircle,
  RefreshCw,
  UserPlus,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

export interface Role {
  id: string;
  label: string;
}

export interface OrgMember {
  id: string;
  name: string;
  email: string;
}

export interface Assignee {
  id: string;
  name: string;
  email: string;
  status: "confirmed" | "invited" | "awaiting";
  roleId: string;
}

export interface PendingChip {
  key: string;
  type: "user" | "email";
  id?: string;
  name: string;
  email: string;
  roleId: string;
}

export type GeneralAccessLevel = "restricted" | "anyone";

export interface InviteMembersProps {
  /** Ordered least-privileged first. Defaults the role selector to index 0. */
  roles: Role[];
  orgMembers?: OrgMember[];
  initialAssignees?: Assignee[];
  defaultMessage?: string;
  initialGeneralAccess?: GeneralAccessLevel;
  onSend?: (chips: PendingChip[], message: string) => void;
  onAssigneesChange?: (assignees: Assignee[]) => void;
  onGeneralAccessChange?: (level: GeneralAccessLevel) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-indigo-500",
];

function avatarColor(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function useMounted() {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

// ─── Avatar ─────────────────────────────────────────────────────────────────

function Avatar({
  id,
  name,
  emailOnly,
  size = "md",
}: {
  id: string;
  name: string;
  emailOnly?: boolean;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full border-2 border-background font-medium text-white",
        size === "sm" ? "size-7 text-[10px]" : "size-8 text-xs",
        emailOnly ? "bg-muted" : avatarColor(id),
      )}
    >
      {emailOnly ? (
        <Mail
          className={cn("text-muted-foreground", size === "sm" ? "size-3" : "size-3.5")}
          aria-hidden
        />
      ) : (
        initials(name)
      )}
    </span>
  );
}

// ─── Role picker (portal-based so it's never clipped) ────────────────────────

function RolePicker({
  roles,
  value,
  onChange,
  compact = false,
}: {
  roles: Role[];
  value: string;
  onChange: (id: string) => void;
  compact?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [dropPos, setDropPos] = React.useState<{ top: number; right: number } | null>(null);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const mounted = useMounted();
  const current = roles.find((r) => r.id === value);

  React.useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (!btnRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  function toggle() {
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) setDropPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    setOpen((o) => !o);
  }

  return (
    <div className="shrink-0">
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-0.5 rounded font-medium transition-colors",
          compact
            ? "px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-accent hover:text-foreground"
            : "gap-1 rounded-md border px-2.5 py-1.5 text-sm hover:bg-accent",
        )}
      >
        {current?.label ?? ""}
        <ChevronDown className="size-3 shrink-0 opacity-60" aria-hidden />
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && dropPos && (
              <motion.ul
                role="listbox"
                style={{ position: "fixed", top: dropPos.top, right: dropPos.right, zIndex: 200 }}
                initial={{ opacity: 0, y: -4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.1 }}
                className="min-w-[120px] overflow-hidden rounded-lg border bg-popover shadow-md"
              >
                {roles.map((role) => (
                  <li key={role.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={role.id === value}
                      onClick={() => {
                        onChange(role.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                        role.id === value && "font-semibold",
                      )}
                    >
                      {role.label}
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}

// ─── Chip ────────────────────────────────────────────────────────────────────

function Chip({ chip, onRemove }: { chip: PendingChip; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border bg-muted/60 py-0.5 pl-0.5 pr-1 text-xs">
      <Avatar
        id={chip.id ?? chip.email}
        name={chip.name}
        emailOnly={chip.type === "email"}
        size="sm"
      />
      <span className="max-w-[100px] truncate font-medium">{chip.name}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${chip.name}`}
        className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <X className="size-3" aria-hidden />
      </button>
    </span>
  );
}

// ─── Status badge ────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  confirmed: "Confirmed",
  invited: "Invite sent",
  awaiting: "Awaiting",
};

const STATUS_CLASS: Record<string, string> = {
  confirmed:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  invited:
    "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800",
  awaiting:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
};

// ─── Assignee row ─────────────────────────────────────────────────────────────

function AssigneeRow({
  assignee,
  roles,
  resending,
  onRoleChange,
  onResend,
  onRemove,
}: {
  assignee: Assignee;
  roles: Role[];
  resending: boolean;
  onRoleChange: (roleId: string) => void;
  onResend: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent/40">
      <Avatar
        id={assignee.id}
        name={assignee.name}
        emailOnly={assignee.status === "invited"}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-medium">{assignee.name}</div>
        <div className="truncate text-xs text-muted-foreground">{assignee.email}</div>
      </div>
      <RolePicker roles={roles} value={assignee.roleId} onChange={onRoleChange} compact />
      <span
        className={cn(
          "shrink-0 rounded-full border px-2 py-0.5 text-[10px]",
          STATUS_CLASS[assignee.status],
        )}
      >
        {STATUS_LABEL[assignee.status]}
      </span>
      <button
        type="button"
        onClick={onResend}
        aria-label={resending ? "Invite resent" : "Resend invite"}
        title={resending ? "Invite resent!" : "Resend invite"}
        className={cn(
          "shrink-0 rounded p-1 transition-colors",
          resending
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-muted-foreground hover:bg-accent hover:text-foreground",
        )}
      >
        <RefreshCw className={cn("size-3.5", resending && "animate-spin")} aria-hidden />
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${assignee.name}`}
        className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <X className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}

// ─── General access ──────────────────────────────────────────────────────────

const GENERAL_ACCESS_OPTIONS = [
  {
    level: "restricted" as const,
    label: "Restricted",
    description: "Only people added can access this project",
    Icon: Lock,
  },
  {
    level: "anyone" as const,
    label: "Anyone with the link",
    description: "Anyone with the link can view this project",
    Icon: Globe,
  },
];

function GeneralAccessSection({
  roles,
  value,
  onValueChange,
  roleId,
  onRoleChange,
}: {
  roles: Role[];
  value: GeneralAccessLevel;
  onValueChange: (v: GeneralAccessLevel) => void;
  roleId: string;
  onRoleChange: (id: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [dropPos, setDropPos] = React.useState<{ top: number; left: number } | null>(null);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const mounted = useMounted();
  const current = GENERAL_ACCESS_OPTIONS.find((o) => o.level === value)!;
  const Icon = current.Icon;

  React.useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (!btnRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  function toggle() {
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) setDropPos({ top: rect.bottom + 4, left: rect.left });
    setOpen((o) => !o);
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <Icon className="size-4 text-muted-foreground" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <button
          ref={btnRef}
          type="button"
          onClick={toggle}
          className="inline-flex items-center gap-0.5 rounded text-xs font-medium transition-colors hover:text-muted-foreground"
        >
          {current.label}
          <ChevronDown className="size-3 opacity-60" aria-hidden />
        </button>
        <p className="text-xs text-muted-foreground">{current.description}</p>
      </div>
      {value === "anyone" && (
        <RolePicker roles={roles} value={roleId} onChange={onRoleChange} compact />
      )}

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && dropPos && (
              <motion.ul
                style={{ position: "fixed", top: dropPos.top, left: dropPos.left, zIndex: 200 }}
                initial={{ opacity: 0, y: -4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.1 }}
                className="min-w-[200px] overflow-hidden rounded-lg border bg-popover shadow-md"
              >
                {GENERAL_ACCESS_OPTIONS.map((opt) => (
                  <li key={opt.level}>
                    <button
                      type="button"
                      onClick={() => {
                        onValueChange(opt.level);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-accent",
                        opt.level === value && "font-semibold",
                      )}
                    >
                      <opt.Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                      <span>
                        <span className="block text-sm">{opt.label}</span>
                        <span className="block text-xs text-muted-foreground">{opt.description}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────

interface InviteModalProps {
  roles: Role[];
  orgMembers: OrgMember[];
  assignees: Assignee[];
  defaultMessage: string;
  generalAccess: GeneralAccessLevel;
  onSend: (chips: PendingChip[], message: string) => void;
  onRoleChange: (id: string, roleId: string) => void;
  onRemove: (id: string) => void;
  onGeneralAccessChange: (level: GeneralAccessLevel) => void;
  onClose: () => void;
}

function InviteModal({
  roles,
  orgMembers,
  assignees,
  defaultMessage,
  generalAccess,
  onSend,
  onRoleChange,
  onRemove,
  onGeneralAccessChange,
  onClose,
}: InviteModalProps) {
  const [step, setStep] = React.useState<1 | 2>(1);
  const [query, setQuery] = React.useState("");
  const [chips, setChips] = React.useState<PendingChip[]>([]);
  const [roleForNext, setRoleForNext] = React.useState(roles[0]?.id ?? "");
  const [message, setMessage] = React.useState(defaultMessage);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [removeConfirm, setRemoveConfirm] = React.useState<string | null>(null);
  const [resendFeedback, setResendFeedback] = React.useState<string | null>(null);
  const [generalAccessRole, setGeneralAccessRole] = React.useState(roles[0]?.id ?? "");

  const inputRef = React.useRef<HTMLInputElement>(null);
  const chipKeyRef = React.useRef(0);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, [step]);

  React.useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (removeConfirm) { setRemoveConfirm(null); return; }
        onClose();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [removeConfirm, onClose]);

  const excludedIds = new Set([
    ...assignees.map((a) => a.id),
    ...chips.filter((c) => c.id).map((c) => c.id!),
  ]);

  const filtered = orgMembers.filter(
    (m) =>
      !excludedIds.has(m.id) &&
      (m.name.toLowerCase().includes(query.toLowerCase()) ||
        m.email.toLowerCase().includes(query.toLowerCase())),
  );

  function addChip(chip: Omit<PendingChip, "key" | "roleId">) {
    const key = `chip-${chipKeyRef.current++}`;
    setChips((prev) => [...prev, { ...chip, key, roleId: roleForNext }]);
    setQuery("");
    setDropdownOpen(false);
    if (step === 1) setStep(2);
  }

  function addEmailChip() {
    const email = query.trim();
    if (!email) return;
    const match = orgMembers.find(
      (m) => m.email.toLowerCase() === email.toLowerCase() && !excludedIds.has(m.id),
    );
    if (match) {
      addChip({ type: "user", id: match.id, name: match.name, email: match.email });
    } else {
      addChip({ type: "email", name: email, email });
    }
  }

  function removeChip(key: string) {
    const next = chips.filter((c) => c.key !== key);
    setChips(next);
    if (next.length === 0) setStep(1);
  }

  function handleResend(id: string) {
    setResendFeedback(id);
    window.setTimeout(() => setResendFeedback(null), 2000);
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden
      />

      {/* Dialog */}
      <motion.div
        role="dialog"
        aria-modal
        aria-label="Invite members"
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-background shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-1 px-4 py-3">
          <AnimatePresence mode="popLayout">
            {step === 2 && (
              <motion.button
                key="back"
                type="button"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                onClick={() => { setChips([]); setQuery(""); setStep(1); }}
                aria-label="Back to search"
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <ArrowLeft className="size-4" aria-hidden />
              </motion.button>
            )}
          </AnimatePresence>
          <h2 className="flex-1 text-sm font-semibold">Invite members</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        {/* Search area — outside scroll container so dropdown is never clipped */}
        <div className="px-4 py-3">
          <div className="flex items-start gap-2">
            {/* Chip + search field */}
            <div
              className="relative flex min-h-[38px] flex-1 cursor-text flex-wrap items-center gap-1 rounded-lg border bg-background px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring"
              onClick={() => inputRef.current?.focus()}
            >
              {chips.map((chip) => (
                <Chip key={chip.key} chip={chip} onRemove={() => removeChip(chip.key)} />
              ))}

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setDropdownOpen(true); }}
                onFocus={() => setDropdownOpen(true)}
                onBlur={() => window.setTimeout(() => setDropdownOpen(false), 150)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); if (query.trim()) addEmailChip(); }
                  if (e.key === "Backspace" && !query && chips.length > 0) {
                    removeChip(chips[chips.length - 1].key);
                  }
                }}
                placeholder={chips.length === 0 ? "Search by name or invite by email…" : "Add more people…"}
                aria-label="Search members or enter email"
                className="min-w-[140px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />

              {/* Dropdown — not clipped since parent has no overflow restriction */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.1 }}
                    className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border bg-popover shadow-lg"
                  >
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); addEmailChip(); }}
                      disabled={!query.trim()}
                      className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-muted">
                        <PlusCircle className="size-3.5 text-muted-foreground" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {query.trim() ? query.trim() : "Type an email to invite"}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          They&apos;ll receive an email invitation to join.
                        </span>
                      </span>
                    </button>

                    {filtered.length > 0 && (
                      <div className="border-t">
                        {filtered.slice(0, 8).map((member) => (
                          <button
                            key={member.id}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              addChip({ type: "user", id: member.id, name: member.name, email: member.email });
                            }}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-accent"
                          >
                            <Avatar id={member.id} name={member.name} size="sm" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium">{member.name}</span>
                              <span className="block truncate text-xs text-muted-foreground">{member.email}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Role selector for pending invitees */}
            <AnimatePresence>
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <RolePicker roles={roles} value={roleForNext} onChange={setRoleForNext} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Invite message */}
          <AnimatePresence>
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  aria-label="Invite message"
                  className="mt-3 w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* People with access — step 1 only */}
        {step === 1 && assignees.length > 0 && (
          <div className="max-h-52 overflow-y-auto">
            <p className="px-4 pb-1 pt-2.5 text-xs font-medium text-muted-foreground">
              People with access
            </p>
            <div className="px-2 pb-2">
              <AnimatePresence initial={false}>
                {assignees.map((assignee) => (
                  <motion.div
                    key={assignee.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <AssigneeRow
                      assignee={assignee}
                      roles={roles}
                      resending={resendFeedback === assignee.id}
                      onRoleChange={(roleId) => onRoleChange(assignee.id, roleId)}
                      onResend={() => handleResend(assignee.id)}
                      onRemove={() => setRemoveConfirm(assignee.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* General access — step 1 only */}
        {step === 1 && (
          <GeneralAccessSection
            roles={roles}
            value={generalAccess}
            onValueChange={onGeneralAccessChange}
            roleId={generalAccessRole}
            onRoleChange={setGeneralAccessRole}
          />
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {step === 1 ? "Done" : "Cancel"}
          </button>
          {step === 2 && (
            <button
              type="button"
              onClick={() => onSend(chips, message)}
              disabled={chips.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Send invite
            </button>
          )}
        </div>

        {/* Remove confirmation overlay */}
        <AnimatePresence>
          {removeConfirm && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 rounded-2xl bg-background/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-x-6 top-1/2 z-20 -translate-y-1/2 rounded-xl border bg-background p-4 shadow-lg"
              >
                <p className="text-sm font-semibold">Remove member?</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {assignees.find((a) => a.id === removeConfirm)?.name ?? "This person"} will be
                  will lose access to this project.
                </p>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRemoveConfirm(null)}
                    className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => { onRemove(removeConfirm); setRemoveConfirm(null); }}
                    className="rounded-md bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90"
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

// ─── Entry point trigger ──────────────────────────────────────────────────────

function Trigger({ assignees, onClick }: { assignees: Assignee[]; onClick: () => void }) {
  const visible = assignees.slice(0, 4);
  const overflow = assignees.length - 4;

  if (assignees.length === 0) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1.5 rounded-md border border-dashed px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
      >
        <UserPlus className="size-4" aria-hidden />
        Invite users
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${assignees.length} member${assignees.length === 1 ? "" : "s"} — click to manage`}
      className="flex items-center -space-x-1.5 transition-opacity hover:opacity-80"
    >
      {visible.map((a) => (
        <Avatar key={a.id} id={a.id} name={a.name} emailOnly={a.status === "invited"} size="sm" />
      ))}
      {overflow > 0 && (
        <span className="relative z-10 flex size-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium text-muted-foreground">
          +{overflow}
        </span>
      )}
    </button>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function InviteMembers({
  roles,
  orgMembers = [],
  initialAssignees = [],
  defaultMessage = "I'd like to invite you to collaborate on this project.",
  initialGeneralAccess = "restricted",
  onSend,
  onAssigneesChange,
  onGeneralAccessChange,
}: InviteMembersProps) {
  const [open, setOpen] = React.useState(false);
  const [assignees, setAssignees] = React.useState<Assignee[]>(initialAssignees);
  const [generalAccess, setGeneralAccess] = React.useState<GeneralAccessLevel>(initialGeneralAccess);
  const mounted = useMounted();

  function handleSend(chips: PendingChip[], msg: string) {
    const next: Assignee[] = chips.map((chip) => ({
      id: chip.id ?? `email:${chip.email}`,
      name: chip.name,
      email: chip.email,
      status: chip.type === "user" ? "awaiting" : "invited",
      roleId: chip.roleId,
    }));
    const updated = [...assignees, ...next];
    setAssignees(updated);
    onAssigneesChange?.(updated);
    onSend?.(chips, msg);
    setOpen(false);
  }

  function handleRoleChange(id: string, roleId: string) {
    const updated = assignees.map((a) => (a.id === id ? { ...a, roleId } : a));
    setAssignees(updated);
    onAssigneesChange?.(updated);
  }

  function handleRemove(id: string) {
    const updated = assignees.filter((a) => a.id !== id);
    setAssignees(updated);
    onAssigneesChange?.(updated);
  }

  function handleGeneralAccessChange(level: GeneralAccessLevel) {
    setGeneralAccess(level);
    onGeneralAccessChange?.(level);
  }

  const trigger = <Trigger assignees={assignees} onClick={() => setOpen(true)} />;

  if (!mounted) return trigger;

  return (
    <>
      {trigger}
      {createPortal(
        <AnimatePresence>
          {open && (
            <InviteModal
              roles={roles}
              orgMembers={orgMembers}
              assignees={assignees}
              defaultMessage={defaultMessage}
              generalAccess={generalAccess}
              onSend={handleSend}
              onRoleChange={handleRoleChange}
              onRemove={handleRemove}
              onGeneralAccessChange={handleGeneralAccessChange}
              onClose={() => setOpen(false)}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
