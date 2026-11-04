import { Frame, Box, Dot, Line, tone } from "@/components/thumbnail";

export default function TaskListThumbnail() {
  return (
    <Frame>
      <Box x={24} y={30} w={152} h={60} r={8} />
      {/* Completed */}
      <Dot cx={38} cy={46} r={4} className={tone.mid} />
      <Line x={48} y={44} w={100} className={tone.faint} />
      {/* In progress */}
      <Dot cx={38} cy={60} r={4} className="stroke-muted-foreground/25" />
      <path d="M38 56 a4 4 0 0 1 4 4" className="stroke-foreground" strokeWidth={1.5} strokeLinecap="round" fill="none" />
      <Line x={48} y={58} w={112} className={tone.strong} />
      {/* Pending */}
      <Dot cx={38} cy={74} r={4} className="stroke-muted-foreground/60" dashed />
      <Line x={48} y={72} w={80} />
    </Frame>
  );
}
