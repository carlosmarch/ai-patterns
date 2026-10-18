import { Frame, Box, Dot, Line, tone } from "@/components/thumbnail";

export default function SetupChecklistThumbnail() {
  return (
    <Frame>
      <Box x={40} y={14} w={120} h={92} r={10} />
      <Dot cx={60} cy={32} r={8} className="stroke-muted-foreground/25" />
      <path d="M60 24 a8 8 0 0 1 7.6 10.5" className="stroke-foreground" strokeWidth={2} strokeLinecap="round" fill="none" />
      <Line x={76} y={30} w={56} className={tone.strong} />
      {[52, 66, 80, 94].map((y, i) => (
        <g key={y}>
          {i < 2 ? (
            <>
              <Dot cx={56} cy={y} r={3.5} className={tone.strong} />
              <Line x={66} y={y - 0.5} w={60 - i * 8} h={1} className={tone.text} />
            </>
          ) : (
            <>
              <Dot cx={56} cy={y} r={3.5} className="stroke-muted-foreground/60" dashed />
              <Line x={66} y={y - 2} w={66 - i * 8} />
            </>
          )}
        </g>
      ))}
    </Frame>
  );
}
