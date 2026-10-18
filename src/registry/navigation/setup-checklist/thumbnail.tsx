import { Frame, Box, Check, Dot, Line, tone } from "@/components/thumbnail";

export default function SetupChecklistThumbnail() {
  return (
    <Frame>
      <Box x={30} y={10} w={140} h={100} r={10} />
      <Dot cx={50} cy={30} r={9} className="stroke-muted-foreground/25" />
      <path d="M50 21 a9 9 0 0 1 8.6 11.7" className="stroke-emerald-500" strokeWidth={2} strokeLinecap="round" />
      <Line x={66} y={24} w={60} className={tone.strong} />
      <Line x={66} y={32} w={40} h={3} />
      {[50, 66, 82, 98].map((y, i) => (
        <g key={y}>
          {i < 2 ? (
            <>
              <Dot cx={46} cy={y} r={4.5} className="fill-emerald-500" />
              <Check cx={46} cy={y} s={2} className="stroke-white" />
              <Line x={56} y={y - 2} w={70 - i * 10} className={tone.faint} />
              <Line x={56} y={y - 0.5} w={70 - i * 10} h={1} className={tone.text} />
            </>
          ) : (
            <>
              <Dot cx={46} cy={y} r={4.5} className="stroke-muted-foreground/60" dashed />
              <Line x={56} y={y - 2} w={80 - i * 10} className={i === 2 ? tone.strong : tone.text} />
            </>
          )}
        </g>
      ))}
    </Frame>
  );
}
