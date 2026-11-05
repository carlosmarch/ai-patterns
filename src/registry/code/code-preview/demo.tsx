"use client";

import { CodePreviewBlock } from "./component";

const SVG = `<svg xmlns="http://www.w3.org/2000/svg"
     width="24" height="24"
     viewBox="0 0 24 24"
     fill="none"
     stroke="currentColor"
     stroke-width="2"
     stroke-linecap="round"
     stroke-linejoin="round"
     class="animated-origami">

  <style>
    .animated-origami path {
      stroke-dasharray: 1;
      stroke-dashoffset: 1;
      animation: fold-draw 3.6s ease-in-out infinite;
    }

    .animated-origami path:nth-child(2) { animation-delay: 0.3s; }
    .animated-origami path:nth-child(3) { animation-delay: 0.6s; }

    @keyframes fold-draw {
      0% { stroke-dashoffset: 1; }
      45%, 65% { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: -1; }
    }
  </style>

  <path pathLength="1" d="M12 12V4a1 1 0 0 1 1-1h6.297a1 1 0 0 1 .651 1.759l-4.696 4.025" />
  <path pathLength="1" d="m12 21-7.414-7.414A2 2 0 0 1 4 12.172V6.415a1.002 1.002 0 0 1 1.707-.707L20 20.009" />
  <path pathLength="1" d="m12.214 3.381 8.414 14.966a1 1 0 0 1-.167 1.199l-1.168 1.163a1 1 0 0 1-.706.291H6.351a1 1 0 0 1-.625-.219L3.25 18.8a1 1 0 0 1 .631-1.781l4.165.027" />
</svg>`;

export default function CodePreviewDemo() {
  return (
    <div className="w-full max-w-xl pt-8">
      <CodePreviewBlock code={SVG} lang="svg" />
    </div>
  );
}
