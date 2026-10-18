import { Frame, Box, Dot, Line, tone } from "@/components/thumbnail";

export default function AttachmentChipThumbnail() {
  return (
    <Frame>
      <Box x={20} y={20} w={160} h={84} r={12} />
      <Box x={30} y={30} w={28} h={28} r={6} className="fill-sky-500/30 stroke-sky-500/40" />
      <path d="M33 54 l8 -10 l6 6 l4 -4 l5 8 z" className="fill-sky-500/60" />
      <Box x={62} y={30} w={60} h={28} r={6} />
      <Box x={68} y={36} w={10} h={12} r={2} className="fill-red-500/70" />
      <Line x={82} y={37} w={34} className={tone.strong} />
      <Line x={82} y={45} w={22} h={3} />
      <Line x={68} y={52} w={48} h={2} className={tone.faint} />
      <Line x={68} y={52} w={30} h={2} className="fill-sky-500" />
      <Box x={126} y={30} w={28} h={28} r={6} className={tone.card} dashed />
      <path d="M140 40 v8 M136 44 h8" className="stroke-muted-foreground" strokeWidth={1.2} />
      <Line x={30} y={72} w={80} />
      <Dot cx={164} cy={90} r={6} className={tone.strong} />
    </Frame>
  );
}
