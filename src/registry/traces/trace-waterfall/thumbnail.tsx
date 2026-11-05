import { Frame, Box, Line, tone } from "@/components/thumbnail";

const ROWS = [
  { x: 76, w: 14, c: tone.mid },
  { x: 92, w: 4, c: tone.strong },
  { x: 94, w: 5, c: tone.strong },
  { x: 100, w: 12, c: tone.mid },
  { x: 114, w: 16, dashed: true },
  { x: 132, w: 26, c: tone.strong },
];

export default function TraceWaterfallThumbnail() {
  return (
    <Frame>
      <Box x={18} y={14} w={164} h={92} r={8} />
      {/* Summary: total + toggle */}
      <Line x={28} y={23} w={30} h={6} className={tone.strong} />
      <Line x={64} y={25} w={40} h={3} />
      <Box x={148} y={21} w={24} h={10} r={5} />
      <rect x={18} y={38} width={164} height={0.75} className="fill-border" />
      {/* Rows: name + timing bar on a shared axis */}
      {ROWS.map((r, i) => {
        const y = 46 + i * 9.5;
        return (
          <g key={i}>
            <Line x={28} y={y + 1} w={i % 2 ? 26 : 34} h={3} />
            {r.dashed ? (
              <Box x={r.x} y={y} w={r.w} h={5} r={1.5} className={tone.muted} dashed />
            ) : (
              <rect x={r.x} y={y} width={r.w} height={5} rx={1.5} className={r.c} />
            )}
          </g>
        );
      })}
    </Frame>
  );
}
