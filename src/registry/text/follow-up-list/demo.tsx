"use client";

import * as React from "react";

import { FollowUpList } from "./component";

const SUGGESTIONS = [
  "Quiero ver cómo configurarlo usando Docker con mi stack Node.js",
  "Explícame los pasos para implementar eventos de seguimiento personalizados",
  "Cómo puedo migrar datos históricos si cambio desde Google Analytics",
  "Cuáles son los requisitos técnicos para hospedar Umami en mi servidor",
  "Prefiero saber más sobre los costos y límites de Umami Cloud Pro",
];

export default function FollowUpListDemo() {
  const [selected, setSelected] = React.useState<string | null>(null);

  return (
    <div className="w-full max-w-md">
      <FollowUpList suggestions={SUGGESTIONS} onSelect={setSelected} />
      {selected && (
        <p className="mt-3 text-xs text-muted-foreground">Selected: &ldquo;{selected}&rdquo;</p>
      )}
    </div>
  );
}
