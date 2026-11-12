import { Frame, Box, Line, Dot, tone } from "@/components/thumbnail";

export default function GeneratedSurfaceThumbnail() {
  return (
    <Frame>
      <Box x={84} y={10} w={92} h={14} r={7} className={tone.muted} />
      <Line x={92} y={15} w={60} className={tone.mid} />
      <Line x={24} y={32} w={96} />
      <Box x={24} y={42} w={152} h={68} r={8} />
      <Box x={32} y={49} w={16} h={7} r={2} className={tone.muted} />
      <Line x={52} y={50.5} w={48} className={tone.strong} />
      <rect x={24} y={61} width={152} height={0.75} className="fill-border" />
      <Box x={32} y={68} w={136} h={32} r={5} dashed className={tone.card} />
      <Line x={40} y={75} w={56} className={tone.mid} />
      <rect x={40} y={86} width={120} height={2} rx={1} className={tone.faint} />
      <Dot cx={92} cy={87} r={3} className={tone.strong} />
    </Frame>
  );
}
