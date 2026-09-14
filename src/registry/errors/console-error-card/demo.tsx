"use client";

import * as React from "react";

import { ConsoleErrorCard } from "./component";

const ERRORS = [
  {
    type: "error" as const,
    message:
      "Encountered a script tag while rendering React component. Scripts inside React components are never executed when rendering on the client. Consider using template tag instead.",
    frame: {
      file: "src/app/layout.tsx (43:9) @ RootLayout",
      lines: [
        { number: 41, content: "      >" },
        { number: 42, content: "        <head>" },
        { number: 43, content: '          <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />', isError: true },
        { number: 44, content: "        </head>" },
        { number: 45, content: '        <body className="flex min-h-full flex-col font-sans">' },
        { number: 46, content: '          <header className="border-b">' },
      ],
    },
    stack: [
      { name: "script", context: "<anonymous>" },
      { name: "RootLayout", file: "src/app/layout.tsx (43:9)" },
    ],
  },
  {
    type: "warning" as const,
    message:
      "Each child in a list should have a unique \"key\" prop. Check the render method of `PatternGrid`.",
    frame: {
      file: "src/components/pattern-grid.tsx (28:6) @ PatternGrid",
      lines: [
        { number: 26, content: "  return (" },
        { number: 27, content: "    <ul>" },
        { number: 28, content: "      {items.map((item) => <PatternCard item={item} />)}", isError: true },
        { number: 29, content: "    </ul>" },
        { number: 30, content: "  );" },
      ],
    },
    stack: [
      { name: "PatternCard", file: "src/components/pattern-card.tsx (12:3)" },
      { name: "PatternGrid", file: "src/components/pattern-grid.tsx (28:6)" },
      { name: "Page", file: "src/app/page.tsx (14:5)" },
    ],
  },
];

export default function ConsoleErrorCardDemo() {
  const [index, setIndex] = React.useState(0);
  const error = ERRORS[index];

  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <ConsoleErrorCard
        key={index}
        type={error.type}
        message={error.message}
        frame={error.frame}
        stack={error.stack}
        current={index + 1}
        total={ERRORS.length}
        onPrev={() => setIndex((i) => Math.max(0, i - 1))}
        onNext={() => setIndex((i) => Math.min(ERRORS.length - 1, i + 1))}
        onCopy={() => navigator.clipboard?.writeText(error.message).catch(() => {})}
        onClose={() => setIndex(0)}
        onOpenFrame={(file) => console.log("open", file)}
        onHelpful={(v) => console.log("helpful:", v)}
      />
    </div>
  );
}
