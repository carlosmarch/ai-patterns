import { Frame, Box, Dot, Line, tone } from "@/components/thumbnail";

export default function AutonomyModeThumbnail() {
  return (
    <Frame>
      <Box x={30} y={8} w={110} h={68} r={8} />
      {[0, 1, 2].map((i) => {
        const y = 16 + i * 20;
        return (
          <g key={i}>
            {i === 1 && <Box x={34} y={y - 3} w={102} h={18} r={5} className={tone.muted} />}
            {[0, 1, 2].map((b) => (
              <rect
                key={b}
                x={40 + b * 4}
                y={y + 9 - (b + 1) * 3}
                width={2.5}
                height={(b + 1) * 3}
                rx={1}
                className={b <= i ? tone.strong : tone.faint}
              />
            ))}
            <Line x={58} y={y} w={i === 1 ? 36 : 28} className={i === 1 ? tone.strong : tone.mid} />
            <Line x={58} y={y + 7} w={60} h={3} className={tone.faint} />
          </g>
        );
      })}
      <Box x={30} y={84} w={140} h={28} r={9} />
      <Box x={38} y={92} w={36} h={12} r={4} className={tone.muted} />
      <Line x={48} y={96} w={20} className={tone.mid} />
      <Dot cx={158} cy={98} r={6} className={tone.strong} />
    </Frame>
  );
}
