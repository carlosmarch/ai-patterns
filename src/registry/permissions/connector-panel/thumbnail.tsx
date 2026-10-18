import { Frame, Box, Line, tone } from "@/components/thumbnail";

export default function ConnectorPanelThumbnail() {
  return (
    <Frame>
      <Box x={20} y={10} w={160} h={100} r={8} />
      <Box x={30} y={20} w={18} h={18} r={5} className="fill-sky-500" />
      <Line x={54} y={22} w={50} className={tone.strong} />
      <Line x={54} y={31} w={70} h={3} />
      <Line x={30} y={46} w={30} h={3} className={tone.faint} />
      {[54, 72, 90].map((y, i) => (
        <g key={y}>
          <Line x={30} y={y + 3} w={56 - i * 8} />
          <Box x={124} y={y} w={46} h={10} r={5} className={tone.muted} />
          <Box x={124 + i * 15} y={y} w={16} h={10} r={5} className={tone.strong} />
        </g>
      ))}
    </Frame>
  );
}
