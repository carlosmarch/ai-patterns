import { Frame, Box, Dot, Line, tone } from "@/components/thumbnail";

export default function SourcesStackThumbnail() {
  return (
    <Frame>
      <Dot cx={40} cy={24} r={8} className="fill-sky-500 stroke-card" />
      <Dot cx={52} cy={24} r={8} className="fill-amber-500 stroke-card" />
      <Dot cx={64} cy={24} r={8} className="fill-emerald-500 stroke-card" />
      <Line x={78} y={22} w={30} className={tone.strong} />
      <Box x={32} y={42} w={136} h={66} r={8} />
      {[52, 70, 88].map((y, i) => (
        <g key={y}>
          <Dot cx={46} cy={y + 4} r={4} className={["fill-sky-500", "fill-amber-500", "fill-emerald-500"][i]} />
          <Line x={56} y={y} w={80 - i * 10} className={tone.strong} />
          <Line x={56} y={y + 7} w={40} h={3} />
        </g>
      ))}
    </Frame>
  );
}
