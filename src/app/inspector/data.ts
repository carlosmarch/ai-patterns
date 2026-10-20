// The Inspector scans a (fictional) customer codebase — Lumen, an AI support
// assistant — and checks each AI surface it finds against the matching
// pattern's real UX spec. The clauses come straight from the registry; only
// the codebase, the verdicts and the evidence below are made up.

export type Verdict = "pass" | "fail" | "unknown";

export interface Finding {
  /** A substring of the spec bullet this finding is about. */
  match: string;
  status: Verdict;
  /** 1-indexed, inclusive line range in the surface's file. */
  lines?: [number, number];
  note: string;
  /**
   * A text replacement that resolves the finding. `before` must occur in
   * the file, and stay there whatever other fixes are applied first.
   */
  fix?: { before: string; after: string };
  /** `match` of another finding whose fix also resolves this one. */
  fixedBy?: string;
}

export interface Surface {
  id: string;
  name: string;
  file: string;
  /** Registry path (`category/slug`) of the matched pattern. */
  pattern: string;
  confidence: number;
  code: string;
  findings: Finding[];
}

export interface Gap {
  id: string;
  title: string;
  reason: string;
  pattern: string;
}

export const REPO = "acme/lumen-web";
export const BRANCH = "main";

export const SURFACES: Surface[] = [
  {
    id: "composer",
    name: "Composer",
    file: "src/components/chat/Composer.tsx",
    pattern: "composer/prompt-bar",
    confidence: 0.94,
    code: `import { useState } from "react";
import { Mic, Paperclip, Sparkles } from "lucide-react";
import { SendButton } from "./SendButton";
import { MentionMenu } from "./MentionMenu";

export function Composer({ onSend, generating, onStop }: ComposerProps) {
  const [value, setValue] = useState("");
  const [menu, setMenu] = useState<"mention" | "command" | null>(null);
  const [listening, setListening] = useState(false);

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "@") setMenu("mention");
    if (e.key === "/") setMenu("command");
    if (e.key === "Escape") { setMenu(null); setValue(""); }
    if (e.key === "Enter" && !e.shiftKey && !menu) {
      e.preventDefault();
      onSend(value);
    }
  }

  return (
    <div className="composer">
      <button onClick={attach} aria-label="Attach file"><Paperclip /></button>
      <textarea value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={onKeyDown} />
      {menu && <MentionMenu kind={menu} query={value} onPick={insert} />}
      <button className="model-picker"><Sparkles /></button>
      <button onClick={() => setListening(!listening)}>
        <Mic className={listening ? "animate-ping text-red-500" : ""} />
      </button>
      <SendButton disabled={!value} generating={generating} onSend={() => onSend(value)} onStop={onStop} />
    </div>
  );
}`,
    findings: [
      { match: "opens a source/context picker", status: "pass", lines: [12, 13], note: "Both triggers open the picker, and MentionMenu filters on the live query." },
      {
        match: "Arrow keys move the highlighted suggestion",
        status: "fail",
        lines: [14, 14],
        note: "Escape closes the menu but also wipes the draft. The spec says dismiss without clearing what was typed.",
        fix: {
          before: `    if (e.key === "Escape") { setMenu(null); setValue(""); }`,
          after: `    if (e.key === "Escape") setMenu(null);`,
        },
      },
      { match: "Plain Enter (no popover open) submits", status: "pass", lines: [15, 18], note: "Enter submits only when no popover is open; Shift+Enter falls through to a newline." },
      {
        match: "visually inactive until there is non-whitespace",
        status: "fail",
        lines: [30, 30],
        note: "`!value` lets a draft of only spaces enable Send.",
        fix: {
          before: `      <SendButton disabled={!value} generating={generating} onSend={() => onSend(value)} onStop={onStop} />`,
          after: `      <SendButton disabled={!value.trim()} generating={generating} onSend={() => onSend(value)} onStop={onStop} />`,
        },
      },
      { match: "independent of the text content", status: "pass", lines: [26, 29], note: "Neither control reads or resets the draft." },
      { match: "unambiguous \"listening\" state", status: "pass", lines: [28, 28], note: "The mic pulses red while live." },
      { match: "fully operable from the keyboard", status: "unknown", note: "Keyboard handling lives in MentionMenu.tsx, which this scan couldn't resolve. Run a browser check to verify." },
      {
        match: "need explicit",
        status: "fail",
        lines: [26, 27],
        note: "The model picker and dictation toggle are icon-only buttons with no accessible name.",
        fix: {
          before: `      <button className="model-picker"><Sparkles /></button>
      <button onClick={() => setListening(!listening)}>`,
          after: `      <button className="model-picker" aria-label="Choose model"><Sparkles /></button>
      <button onClick={() => setListening(!listening)} aria-label={listening ? "Stop dictation" : "Start dictation"} aria-pressed={listening}>`,
        },
      },
      {
        match: "for the dictation pulse",
        status: "fail",
        lines: [28, 28],
        note: "`animate-ping` runs regardless of `prefers-reduced-motion`.",
        fix: {
          before: `        <Mic className={listening ? "animate-ping text-red-500" : ""} />`,
          after: `        <Mic className={listening ? "text-red-500 motion-safe:animate-ping" : ""} />`,
        },
      },
    ],
  },
  {
    id: "send",
    name: "Send / Stop",
    file: "src/components/chat/SendButton.tsx",
    pattern: "buttons/stop-generation-button",
    confidence: 0.97,
    code: `import { ArrowUp, Square } from "lucide-react";
import { cn } from "@/lib/cn";

export function SendButton({ disabled, generating, onSend, onStop }: Props) {
  if (generating) {
    return (
      <button onClick={onStop} className="send stop">
        <Square />
      </button>
    );
  }

  return (
    <div
      role="button"
      onClick={disabled ? undefined : onSend}
      className={cn("send", disabled && "opacity-40 pointer-events-none")}
    >
      <ArrowUp />
    </div>
  );
}`,
    findings: [
      { match: "Clicking while idle", status: "unknown", note: "`generating` comes from useChat(); a static scan can't tell whether it flips before the first token. Run a browser check to verify." },
      { match: "Clicking while generating cancels", status: "pass", lines: [7, 7], note: "Stop calls onStop directly, with no intermediate loading state." },
      { match: "Disabled only in the idle state", status: "pass", lines: [5, 11], note: "The generating branch never reads `disabled`." },
      {
        match: "The morph plays every transition",
        status: "fail",
        lines: [5, 21],
        note: "Send and Stop are two different elements swapped by an early return, so nothing morphs; the button just jumps. This needs a restructure, not a one-line patch.",
      },
      {
        match: "updates with state",
        status: "fail",
        lines: [7, 14],
        note: "Neither state has an accessible name, so assistive tech announces an unlabeled button.",
        fix: {
          before: `      <button onClick={onStop} className="send stop">`,
          after: `      <button onClick={onStop} className="send stop" aria-label="Stop generating">`,
        },
      },
      {
        match: "Remains a real, focusable",
        status: "fail",
        lines: [14, 16],
        note: "The idle state is a `div` with `role=\"button\"`: no tab stop and no Enter/Space handling.",
        fix: {
          before: `    <div
      role="button"
      onClick={disabled ? undefined : onSend}`,
          after: `    <button
      type="button"
      aria-label="Send message"
      onClick={onSend}`,
        },
      },
      {
        match: "Disabled state uses the",
        status: "fail",
        lines: [17, 17],
        note: "Disabled is opacity plus pointer-events only; it isn't programmatically detectable.",
        fix: {
          before: `      className={cn("send", disabled && "opacity-40 pointer-events-none")}`,
          after: `      disabled={disabled}
      className="send disabled:opacity-40"`,
        },
      },
    ],
  },
  {
    id: "answer",
    name: "Answer stream",
    file: "src/components/chat/AnswerStream.tsx",
    pattern: "text/streaming-text",
    confidence: 0.91,
    code: `import { useTypewriter } from "@/hooks/useTypewriter";
import { SourceChip } from "./SourceChip";
import { AnswerActions } from "./AnswerActions";

export function AnswerStream({ message }: { message: StreamingMessage }) {
  const text = useTypewriter(message.text, { charsPerTick: 3, tickMs: 16 });

  return (
    <article className="answer">
      <div className="prose">
        {renderWithSources(text, message.sources, (s) => <SourceChip source={s} />)}
        {!message.done && <span className="cursor">▍</span>}
      </div>
      <AnswerActions message={message} />
      {message.followUps?.map((f) => (
        <button key={f} className="chip" onClick={() => ask(f)}>{f}</button>
      ))}
    </article>
  );
}`,
    findings: [
      { match: "constant, fast pace", status: "pass", lines: [6, 6], note: "A fixed 3 chars per 16 ms tick (about 190 chars/s)." },
      { match: "A source chip appears as a whole unit", status: "pass", lines: [11, 11], note: "Chips render as components between text runs, never typed." },
      { match: "The cursor disappears the instant", status: "pass", lines: [12, 12], note: "Unmounted as soon as `done` flips." },
      {
        match: "The action row and follow-up chips appear only after",
        status: "fail",
        lines: [14, 17],
        note: "Actions and follow-ups render mid-stream and compete with the text being read.",
        fix: {
          before: `      <AnswerActions message={message} />
      {message.followUps?.map((f) => (
        <button key={f} className="chip" onClick={() => ask(f)}>{f}</button>
      ))}`,
          after: `      {message.done && (
        <>
          <AnswerActions message={message} />
          {message.followUps?.map((f) => (
            <button key={f} className="chip" onClick={() => ask(f)}>{f}</button>
          ))}
        </>
      )}`,
        },
      },
      { match: "Follow-up chips are optional", status: "pass", lines: [15, 17], note: "Plain buttons; nothing blocks the composer." },
      {
        match: "streaming region should be an",
        status: "fail",
        lines: [10, 10],
        note: "No live region, so screen-reader users aren't told an answer arrived.",
        fix: {
          before: `      <div className="prose">`,
          after: `      <div className="prose" aria-live="polite" aria-busy={!message.done}>`,
        },
      },
      {
        match: "by rendering the full text immediately",
        status: "fail",
        lines: [6, 6],
        note: "The typewriter runs even when the user prefers reduced motion.",
        fix: {
          before: `  const text = useTypewriter(message.text, { charsPerTick: 3, tickMs: 16 });`,
          after: `  const reduce = useReducedMotion();
  const text = useTypewriter(message.text, { charsPerTick: 3, tickMs: 16, instant: reduce });`,
        },
      },
      {
        match: "The cursor is decorative",
        status: "fail",
        lines: [12, 12],
        note: "The ▍ glyph is read aloud.",
        fix: {
          before: `        {!message.done && <span className="cursor">▍</span>}`,
          after: `        {!message.done && <span className="cursor" aria-hidden>▍</span>}`,
        },
      },
    ],
  },
  {
    id: "approval",
    name: "Tool approval",
    file: "src/components/agent/ApprovalPrompt.tsx",
    pattern: "permissions/tool-approval",
    confidence: 0.88,
    code: `import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ScopeMenu } from "./ScopeMenu";

export function ApprovalPrompt({ call, onDecide }: Props) {
  const [scopeOpen, setScopeOpen] = useState(false);

  return (
    <div className="approval">
      <p className="title">Lumen wants to {describe(call)}</p>
      <p className="detail">{summarize(call.args)}</p>
      <div className="actions">
        <button onClick={() => onDecide("deny")}>Deny</button>
        <button onClick={() => onDecide("once")}>Allow once</button>
        <div className="split">
          <button onClick={() => onDecide("always", "project")}>Always allow</button>
          <button aria-haspopup="menu" aria-expanded={scopeOpen} aria-label="More scopes" onClick={() => setScopeOpen(!scopeOpen)}>
            <ChevronDown />
          </button>
        </div>
        {scopeOpen && <ScopeMenu onPick={(s) => onDecide("always", s)} onClose={() => setScopeOpen(false)} />}
      </div>
    </div>
  );
}`,
    findings: [
      { match: "is a split control", status: "pass", lines: [15, 20], note: "The label applies the project scope; the chevron opens narrower and wider scopes." },
      {
        match: "A decision is terminal",
        status: "fail",
        lines: [13, 16],
        note: "The buttons stay live after a decision, so a second click can fire onDecide again.",
        fix: {
          before: `        <button onClick={() => onDecide("deny")}>Deny</button>
        <button onClick={() => onDecide("once")}>Allow once</button>`,
          after: `        <button disabled={!!call.decision} onClick={() => onDecide("deny")}>Deny</button>
        <button disabled={!!call.decision} onClick={() => onDecide("once")}>Allow once</button>`,
        },
      },
      { match: "Deny doesn't carry a scope", status: "pass", lines: [13, 13], note: "Deny always applies to this one call." },
      {
        match: "verbatim",
        status: "fail",
        lines: [11, 11],
        note: "`summarize()` paraphrases the arguments. Users approve a description, not the real command.",
        fix: {
          before: `      <p className="detail">{summarize(call.args)}</p>`,
          after: `      <pre className="detail">{call.raw}</pre>`,
        },
      },
      { match: "must be real, focusable buttons", status: "pass", lines: [13, 18], note: "All actions are native buttons." },
      { match: "disclosure pattern", status: "unknown", note: "The trigger is wired correctly, but ScopeMenu.tsx wasn't resolved, so Escape and outside-click handling are unverified." },
      { match: "Don't rely on color alone", status: "pass", lines: [13, 14], note: "Labels carry the meaning." },
    ],
  },
  {
    id: "citation",
    name: "Citations",
    file: "src/components/chat/Citation.tsx",
    pattern: "text/inline-citation",
    confidence: 0.83,
    code: `import { useState } from "react";
import { SourcePreview } from "./SourcePreview";

export function Citation({ index, source }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <span className="citation" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <span className="marker">{index}</span>
      {open && (
        <div className="popover" style={{ top: -120 }}>
          <SourcePreview source={source} />
        </div>
      )}
    </span>
  );
}`,
    findings: [
      {
        match: "Hovering or focusing the marker",
        status: "fail",
        lines: [8, 8],
        note: "Only mouse enter/leave are handled; focus, blur and Escape do nothing.",
        fix: {
          before: `    <span className="citation" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>`,
          after: `    <span className="citation" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} onKeyDown={(e) => e.key === "Escape" && setOpen(false)}>`,
        },
      },
      { match: "On touch devices", status: "fail", lines: [9, 9], note: "Hover never fires on touch, so the popover is unreachable on phones.", fixedBy: "The marker is a real focusable element" },
      { match: "repositions to stay on-screen", status: "fail", lines: [11, 11], note: "A fixed `top: -120` clips at the top of the viewport.", fix: { before: `style={{ top: -120 }}`, after: `style={floatingStyles}` } },
      { match: "Numerals count up", status: "pass", note: "Indexes are assigned in order of first appearance upstream, in renderWithSources." },
      {
        match: "The marker is a real focusable element",
        status: "fail",
        lines: [9, 9],
        note: "The marker is a bare `span`.",
        fix: {
          before: `      <span className="marker">{index}</span>`,
          after: `      <button type="button" className="marker" aria-describedby={id} onClick={() => setOpen((o) => !o)}>{index}</button>`,
        },
      },
      { match: "The popover content is associated via", status: "fail", lines: [11, 11], note: "No `aria-describedby` link between the marker and the popover.", fix: { before: `<div className="popover"`, after: `<div className="popover" id={id} role="tooltip"` } },
      { match: "Never rely on hover alone", status: "fail", lines: [8, 9], note: "Hover is the only way in.", fixedBy: "Hovering or focusing the marker" },
    ],
  },
  {
    id: "error",
    name: "Generation error",
    file: "src/components/chat/ErrorBanner.tsx",
    pattern: "errors/generation-error",
    confidence: 0.9,
    code: `import { useState } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

export function ErrorBanner({ error, onRetry }: Props) {
  const [details, setDetails] = useState(false);
  const [retrying, setRetrying] = useState(false);

  return (
    <div className="error-banner" role="alert">
      <AlertTriangle aria-hidden />
      <p>{error.message ?? COPY[error.reason]}</p>
      <button aria-expanded={details} onClick={() => setDetails(!details)}>Show details</button>
      {details && <pre>{error.detail}</pre>}
      <button disabled={retrying} onClick={() => { setRetrying(true); onRetry(); }}>
        <RotateCw className={retrying ? "animate-spin" : ""} /> {retrying ? "Retrying…" : "Retry"}
      </button>
    </div>
  );
}`,
    findings: [
      { match: "Details panel animates", status: "fail", lines: [13, 13], note: "The details panel pops in without a height transition.", fix: { before: `      {details && <pre>{error.detail}</pre>}`, after: `      <Collapse open={details}><pre>{error.detail}</pre></Collapse>` } },
      { match: "Retry enters a disabled", status: "pass", lines: [14, 15], note: "Disables immediately and spins the icon." },
      {
        match: "Non-retryable reasons",
        status: "fail",
        lines: [14, 16],
        note: "Retry shows for `filtered` errors too, inviting a retry that can only fail the same way.",
        fix: {
          before: `<button disabled={retrying}`,
          after: `<button hidden={error.reason === "filtered"} disabled={retrying}`,
        },
      },
      { match: "overrides the default hint text", status: "pass", lines: [11, 11], note: "A server message wins over the per-reason copy." },
      { match: "has `role=\"alert\"`", status: "pass", lines: [9, 9], note: "Announced on mount." },
      { match: "uses `aria-expanded`", status: "pass", lines: [12, 12], note: "Reflects the panel state." },
      {
        match: "switches to \"Retrying\"",
        status: "fail",
        lines: [14, 14],
        note: "No `aria-label` change while in flight.",
        fix: { before: `disabled={retrying} onClick`, after: `disabled={retrying} aria-label={retrying ? "Retrying" : "Retry"} onClick` },
      },
      { match: "The alert icon is", status: "pass", lines: [10, 10], note: "Marked `aria-hidden`." },
    ],
  },
  {
    id: "thinking",
    name: "Thinking",
    file: "src/components/chat/Thinking.tsx",
    pattern: "loaders/thinking-loader",
    confidence: 0.96,
    code: `import { useCycle, useElapsed } from "@/hooks/time";
import { RollingNumber } from "@/components/RollingNumber";

const WORDS = ["Thinking", "Reading", "Drafting"];

export function Thinking({ step }: { step?: string }) {
  const seconds = useElapsed();
  const word = useCycle(WORDS, 6000);

  return (
    <div className="thinking" aria-live="polite">
      <span className="shimmer motion-reduce:animate-none">{step ?? word}</span>
      <RollingNumber value={seconds} suffix="s" />
    </div>
  );
}`,
    findings: [
      { match: "Starts counting the instant", status: "pass", lines: [7, 7], note: "useElapsed starts on mount." },
      { match: "every 6 seconds", status: "pass", lines: [8, 8], note: "Cycles at 6000 ms." },
      { match: "If real sub-step information", status: "pass", lines: [12, 12], note: "A real `step` wins over the generic word." },
      { match: "changed digit animates in place", status: "pass", lines: [13, 13], note: "RollingNumber animates per digit." },
      { match: "On completion, replace the whole component", status: "unknown", note: "The swap happens in the parent (MessageList.tsx), outside this scan." },
      { match: "Wrap in an", status: "pass", lines: [11, 11], note: "A polite live region." },
      { match: "Don't rely on the animated counter alone", status: "pass", lines: [12, 12], note: "The label sits inside the live region." },
      { match: "keep the counter", status: "pass", lines: [12, 12], note: "The shimmer stops; the counter stays." },
    ],
  },
];

export const GAPS: Gap[] = [
  {
    id: "tool-progress",
    title: "Tool calls run silently",
    reason: "useAgent() emits tool_start and tool_end events, but nothing renders them, so the answer just pauses.",
    pattern: "loaders/tool-call-chip",
  },
  {
    id: "partial",
    title: "Cut-off answers look finished",
    reason: "The stream handler drops `finish_reason: \"length\"`. A truncated answer renders like a complete one.",
    pattern: "errors/partial-response",
  },
];

export const UNMATCHED = [{ file: "src/components/chat/VoiceButton.tsx", closest: "voice/listening-state", confidence: 0.41 }];
