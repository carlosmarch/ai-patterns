"use client";

import * as React from "react";

import { CostEstimate } from "./component";

const BALANCE = 120;

export default function CostEstimateDemo() {
  const [pages, setPages] = React.useState(10);
  const [deep, setDeep] = React.useState(false);

  const perPage = deep ? 4 : 2;
  const base = 6;
  const min = base + pages * perPage;
  const max = Math.round(min * 1.25);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-2xl border bg-muted/40 p-4">
        <label className="flex flex-col gap-2">
          <span className="flex justify-between text-xs font-medium">
            <span>Pages to analyse</span>
            <span className="text-muted-foreground tabular-nums">{pages}</span>
          </span>
          <input
            type="range"
            min={1}
            max={40}
            value={pages}
            onChange={(e) => setPages(Number(e.target.value))}
            className="accent-foreground"
          />
        </label>
        <label className="flex items-center gap-2 text-xs font-medium">
          <input type="checkbox" checked={deep} onChange={(e) => setDeep(e.target.checked)} className="accent-foreground" />
          Deep analysis (checks every table and chart)
        </label>
      </div>

      <CostEstimate
        min={min}
        max={max}
        balance={BALANCE}
        duration={deep ? "~4 min" : "~1 min"}
        breakdown={[
          { label: "Reading the document", amount: base },
          { label: `${pages} pages × ${perPage} credits`, amount: pages * perPage },
        ]}
        actionLabel="Analyse"
        onRun={() => {}}
        onTopUp={() => {}}
      />
    </div>
  );
}
