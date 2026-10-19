"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";

import { CriteriaDetermination, type Criterion, type Determination } from "./component";

const initialCriteria: Criterion[] = [
  {
    id: "cobalt-crusts",
    label: "Is applying to explore for cobalt-rich crusts on the seabed",
    details:
      "Any entity (company, state enterprise or other legal person) that is an applicant or prospective applicant for approval of a plan of work for exploration for cobalt-rich ferromanganese crusts in the Area under the ISA Regulations on Prospecting and Exploration for Cobalt-rich Ferromanganese Crusts is bound by the procedures on avoiding overlapping application areas. This applies to applications made during the one-year period following adoption of the decision on 26 July 2012.",
    status: "missing",
  },
  {
    id: "public-pool",
    label: "Owns or operates a public pool or spa in the US",
    details:
      "Applies to any owner or operator of a public swimming pool or spa in the United States subject to the Virginia Graeme Baker Pool and Spa Safety Act, including hotels, clubs, and residential communities open to the public.",
    status: "missing",
  },
  {
    id: "annex-iii",
    label: "No AI systems classifiable as high-risk under Annex III or prohibited practices identified in product portfolio",
    status: "not-met",
  },
  {
    id: "gpai-flops",
    label: "GPAI model training compute threshold (10²⁵ FLOPs) not yet calculated for internal foundation models",
    status: "not-met",
  },
  { id: "eu-ai", label: "Develops or deploys AI systems in the EU", status: "met" },
];

export default function CriteriaDeterminationDemo() {
  const [criteria, setCriteria] = React.useState(initialCriteria);
  const [override, setOverride] = React.useState<Determination | undefined>();

  const answer = (id: string, met: boolean) =>
    setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, status: met ? "met" : "not-met" } : c)));

  const reset = () => {
    setCriteria(initialCriteria);
    setOverride(undefined);
  };

  return (
    <div className="flex w-full max-w-3xl flex-col items-end gap-3">
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <RotateCcw className="size-3" aria-hidden />
        Reset
      </button>
      <CriteriaDetermination
        criteria={criteria}
        onAnswer={answer}
        override={override}
        onOverrideChange={setOverride}
      />
    </div>
  );
}
