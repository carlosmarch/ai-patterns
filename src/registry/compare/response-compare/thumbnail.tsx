import { Frame, Box, Line, tone } from "@/components/thumbnail";

export default function ResponseCompareThumbnail() {
  return (
    <Frame>
      {[0, 1].map((i) => {
        const x = 22 + i * 82;
        return (
          <g key={i}>
            <Box x={x} y={16} w={74} h={88} r={8} className={i === 1 ? "fill-card stroke-foreground" : tone.card} />
            <Line x={x + 10} y={28} w={30} className={tone.strong} />
            <Line x={x + 10} y={42} w={54} h={3} />
            <Line x={x + 10} y={50} w={48} h={3} />
            <Line x={x + 10} y={58} w={34 + i * 12} h={3} />
          </g>
        );
      })}
    </Frame>
  );
}
