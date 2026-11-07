import { Frame, Box, Line, tone } from "@/components/thumbnail";

export default function MemoryPanelThumbnail() {
  return (
    <Frame>
      <Box x={36} y={14} w={128} h={92} r={8} />
      <Line x={48} y={25} w={40} className={tone.strong} />
      <Box x={136} y={23} w={18} h={9} r={4.5} className={tone.strong} />
      {[44, 62, 80].map((y, i) => (
        <g key={y}>
          <Line x={48} y={y} w={[84, 64, 74][i]} />
          <Line x={48} y={y + 7} w={36} h={3} className={tone.faint} />
        </g>
      ))}
      <Box x={140} y={60} w={14} h={12} r={3} className={tone.muted} />
    </Frame>
  );
}
