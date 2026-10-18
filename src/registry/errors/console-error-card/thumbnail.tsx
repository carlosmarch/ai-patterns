import { Frame, Box, Line, tone } from "@/components/thumbnail";

export default function ConsoleErrorCardThumbnail() {
  return (
    <Frame>
      <Box x={20} y={10} w={160} h={100} r={8} className="fill-card stroke-red-500/50" />
      <Line x={30} y={20} w={60} className="fill-red-500" />
      <path d="M150 18 l-3 3 l3 3 M164 18 l3 3 l-3 3" className="stroke-muted-foreground" strokeWidth={1.1} strokeLinecap="round" />
      <Line x={30} y={30} w={110} h={3} />
      <Box x={30} y={40} w={140} h={36} r={4} className={tone.muted} />
      {[46, 54, 62].map((y, i) => (
        <g key={y}>
          {i === 1 && <rect x={31} y={y - 2.5} width={138} height={8} className="fill-red-500/15" />}
          <Line x={36} y={y} w={6} h={3} className={tone.faint} />
          <Line x={46} y={y} w={[80, 96, 60][i]} h={3} className={i === 1 ? "fill-red-500/70" : "fill-muted-foreground/50"} />
        </g>
      ))}
      <Line x={30} y={84} w={90} h={3} />
      <Line x={30} y={92} w={70} h={3} className={tone.faint} />
      <Line x={30} y={100} w={80} h={3} className={tone.faint} />
    </Frame>
  );
}
