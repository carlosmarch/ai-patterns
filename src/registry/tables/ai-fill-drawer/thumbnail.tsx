import { Frame, Box, Line, tone } from "@/components/thumbnail";

export default function AiFillDrawerThumbnail() {
  return (
    <Frame>
      {/* The table behind */}
      {[22, 36, 50, 64].map((y) => (
        <Line key={y} x={16} y={y} w={64} className={tone.faint} />
      ))}
      {/* Drawer: key/value rows — set, AI-suggested (highlighted), filling, empty */}
      <Box x={96} y={8} w={96} h={104} r={8} />
      <Line x={106} y={18} w={50} className={tone.strong} />
      {[34, 50, 66, 82].map((y, i) => (
        <g key={y}>
          {i === 1 && <Box x={101} y={y - 4} w={86} h={12} r={4} className={tone.muted} />}
          <Line x={106} y={y} w={22} className={tone.faint} />
          {i === 0 && <Line x={136} y={y} w={40} className={tone.mid} />}
          {i === 1 && <Line x={136} y={y} w={34} className={tone.strong} />}
          {i === 2 && <Line x={136} y={y} w={30} className={tone.faint} />}
          {i === 3 && <Box x={136} y={y - 1} w={22} h={6} r={3} className={tone.card} dashed />}
        </g>
      ))}
    </Frame>
  );
}
