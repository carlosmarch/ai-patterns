import { Frame, Box, Button, Check, Dot, Line, tone } from "@/components/thumbnail";

export default function ResponseCompareThumbnail() {
  return (
    <Frame>
      {[0, 1].map((i) => {
        const x = 16 + i * 88;
        return (
          <g key={i}>
            <Box x={x} y={12} w={80} h={96} r={8} className={i === 1 ? "fill-card stroke-emerald-500" : tone.card} />
            <Line x={x + 10} y={22} w={28} className={tone.strong} />
            {i === 1 && <Dot cx={x + 66} cy={24} r={5} className="fill-emerald-500" />}
            {i === 1 && <Check cx={x + 66} cy={24} s={2.4} className="stroke-white" />}
            <Line x={x + 10} y={38} w={60} h={3} />
            <Line x={x + 10} y={46} w={54} h={3} />
            <Line x={x + 10} y={54} w={58} h={3} />
            <Line x={x + 10} y={62} w={36 + i * 12} h={3} />
            <Button x={x + 10} y={90} w={26} outline />
            <Button x={x + 40} y={90} w={30} outline={i === 0} />
          </g>
        );
      })}
    </Frame>
  );
}
