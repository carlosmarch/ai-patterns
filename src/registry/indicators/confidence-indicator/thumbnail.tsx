import { Frame, Button, Dot, Line } from "@/components/thumbnail";

export default function ConfidenceIndicatorThumbnail() {
  return (
    <Frame>
      {(
        [
          ["fill-emerald-500", "fill-emerald-500/10 stroke-emerald-500/40", 64],
          ["fill-amber-500", "fill-amber-500/10 stroke-amber-500/40", 52],
          ["fill-red-500", "fill-red-500/10 stroke-red-500/40", 44],
        ] as const
      ).map(([dot, pill, w], i) => {
        const y = 22 + i * 22;
        return (
          <g key={i}>
            <Button x={40} y={y} w={w + 22} h={14} className={pill} />
            <Dot cx={50} cy={y + 7} r={3} className={dot} />
            <Line x={58} y={y + 5} w={w} />
          </g>
        );
      })}
      <Line x={40} y={96} w={84} />
      <Dot cx={130} cy={98} r={3} className="fill-emerald-500" />
      <Line x={138} y={96} w={24} />
    </Frame>
  );
}
