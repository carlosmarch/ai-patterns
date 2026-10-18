import { Frame, Box, Dot, Line, tone } from "@/components/thumbnail";

export default function MultiAgentTraceThumbnail() {
  return (
    <Frame>
      <Dot cx={40} cy={22} r={5} className={tone.strong} />
      <Line x={52} y={20} w={70} className={tone.strong} />
      <path d="M40 28 V94 M40 46 H56 M40 70 H56 M40 94 H56" className="stroke-border" strokeWidth={1.2} />
      {[46, 70, 94].map((y, i) => (
        <g key={y}>
          <Box x={56} y={y - 9} w={110} h={18} r={5} />
          {i === 0 && <Dot cx={66} cy={y} r={3.5} className="fill-emerald-500" />}
          {i === 1 && <Dot cx={66} cy={y} r={3.5} className="stroke-sky-500" dashed />}
          {i === 2 && <Dot cx={66} cy={y} r={3.5} className={tone.faint} />}
          <Line x={75} y={y - 4} w={50 - i * 8} className={tone.strong} />
          <Line x={75} y={y + 1.5} w={70} h={3} />
        </g>
      ))}
    </Frame>
  );
}
