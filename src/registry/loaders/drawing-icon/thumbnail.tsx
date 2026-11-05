import { Frame, Line, tone } from "@/components/thumbnail";

export default function DrawingIconThumbnail() {
  return (
    <Frame>
      {/* Faint full shape, with the stroke partway through being drawn over it. */}
      <path d="M70 44 L100 76 L130 44 Z" className="stroke-muted-foreground/25" strokeWidth={3} strokeLinejoin="round" />
      <path
        d="M70 44 L100 76 L130 44 Z"
        pathLength={1}
        strokeDasharray="0.6 1"
        className="stroke-foreground"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line x={78} y={90} w={44} className={tone.text} />
    </Frame>
  );
}
