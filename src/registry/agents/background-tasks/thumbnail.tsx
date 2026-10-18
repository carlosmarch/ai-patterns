import { Frame, Box, Dot, Line, tone } from "@/components/thumbnail";

export default function BackgroundTasksThumbnail() {
  return (
    <Frame>
      <Line x={16} y={20} w={60} />
      <Line x={16} y={30} w={74} className={tone.faint} />
      <Line x={16} y={38} w={52} className={tone.faint} />
      <Box x={104} y={6} w={90} h={108} r={8} />
      <Line x={114} y={16} w={40} className={tone.strong} />
      {[32, 50].map((y) => (
        <g key={y}>
          <Dot cx={119} cy={y + 4} r={4} className="stroke-sky-500" dashed />
          <Line x={128} y={y} w={36} className={tone.strong} />
          <Line x={128} y={y + 6} w={22} h={3} />
          <Box x={176} y={y} w={8} h={8} r={2} className={tone.muted} />
        </g>
      ))}
      <Line x={114} y={70} w={70} h={0.75} className={tone.faint} />
      {[78, 90, 102].map((y) => (
        <g key={y}>
          <Dot cx={119} cy={y + 2} r={3} className="fill-emerald-500" />
          <Line x={128} y={y} w={44} />
        </g>
      ))}
    </Frame>
  );
}
