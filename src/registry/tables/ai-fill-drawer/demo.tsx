"use client";

import * as React from "react";
import { PanelRight, RotateCcw } from "lucide-react";

import { AiFillDrawer, type FieldDef, type FillResult } from "./component";

const FIELDS: FieldDef[] = [
  { key: "name", label: "Company", value: "Wayne Industries Ltd", fillable: false },
  { key: "domain", label: "Domain", value: "wayneindustries.com" },
  { key: "industry", label: "Industry", value: null },
  { key: "hq", label: "Headquarters", value: null },
  { key: "employees", label: "Employees", value: null },
  { key: "founded", label: "Founded", value: null },
  { key: "linkedin", label: "LinkedIn", value: null },
  { key: "owner", label: "Account owner", value: "Dana Ruiz", fillable: false },
];

// Stands in for a model call with web/CRM tools. Each field resolves on its
// own clock, and one comes back empty-handed.
const ANSWERS: Record<string, FillResult & { ms: number }> = {
  industry: { value: "Industrial manufacturing", source: "wayneindustries.com/about", ms: 900 },
  hq: { value: "Gotham, NJ", source: "wayneindustries.com/contact", ms: 1400 },
  employees: { value: "1,001–5,000", source: "LinkedIn company page", ms: 2000 },
  founded: { value: null, ms: 2500 },
  linkedin: { value: "linkedin.com/company/wayne-industries", source: "Web search", ms: 1700 },
};

function mockFill(key: string): Promise<FillResult> {
  const a = ANSWERS[key] ?? { value: null, ms: 1000 };
  return new Promise((resolve) => setTimeout(() => resolve({ value: a.value, source: a.source }), a.ms));
}

const ROWS = ["Wayne Industries Ltd", "Sterling Systems Co", "Bluth Industries Ltd", "Pied Piper Inc", "Initech LLC"];

export default function AiFillDrawerDemo() {
  const [open, setOpen] = React.useState(true);
  const [run, setRun] = React.useState(0);

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-4">
      <div className="relative flex h-[520px] w-full overflow-hidden rounded-2xl border bg-card">
        {/* Background: the table this record was opened from */}
        <div className="flex-1 p-4 text-sm">
          <div className="mb-2 grid grid-cols-[1fr_auto] px-2 text-xs text-muted-foreground">
            <span>Company</span>
            <span>Industry</span>
          </div>
          {ROWS.map((name, i) => (
            <button
              key={name}
              type="button"
              onClick={() => setOpen(true)}
              disabled={i !== 0}
              className={
                "grid w-full grid-cols-[1fr_auto] items-center gap-4 rounded-lg px-2 py-2.5 text-left " +
                (i === 0 ? "bg-muted font-medium" : "text-muted-foreground")
              }
            >
              {name}
              <span className="h-2 w-16 rounded-full bg-muted-foreground/15" />
            </button>
          ))}
          {!open && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-4 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
            >
              <PanelRight className="size-3.5" />
              Open record
            </button>
          )}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex w-full justify-end">
          <AiFillDrawer
            key={run}
            open={open}
            onClose={() => setOpen(false)}
            title="Wayne Industries Ltd"
            subtitle="Company · Added Oct 30, 2026"
            fields={FIELDS}
            onFill={mockFill}
            className="pointer-events-auto"
          />
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          setRun((r) => r + 1);
          setOpen(true);
        }}
        className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <RotateCcw className="size-3" />
        Reset
      </button>
    </div>
  );
}
