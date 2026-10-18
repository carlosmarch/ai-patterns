import { Frame, Box, Line, tone } from "@/components/thumbnail";

export default function ConnectorPanelThumbnail() {
  return (
    <Frame>
      <Box x={30} y={14} w={140} h={92} r={8} />
      <Line x={42} y={26} w={60} className={tone.strong} />
      {[46, 64, 82].map((y, i) => (
        <g key={y}>
          <Line x={42} y={y + 3} w={56 - i * 8} />
          <Box x={114} y={y} w={44} h={10} r={5} className={tone.muted} />
          <Box x={114 + i * 14} y={y} w={16} h={10} r={5} className={tone.strong} />
        </g>
      ))}
    </Frame>
  );
}
