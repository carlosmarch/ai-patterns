import { Frame, Check, Dot, Line, tone } from "@/components/thumbnail";

export default function AnalysisListThumbnail() {
  return (
    <Frame>
      <Line x={20} y={14} w={160} h={3} className={tone.faint} />
      <Line x={60} y={14} w={60} h={3} className="fill-sky-500" />
      {[28, 50, 72, 94].map((y, i) => (
        <g key={y}>
          {i < 2 ? (
            <>
              <Dot cx={28} cy={y + 6} r={5} className="fill-emerald-500" />
              <Check cx={28} cy={y + 6} s={2.2} className="stroke-white" />
              <Line x={40} y={y + 1} w={90 - i * 20} className={tone.strong} />
              <Line x={40} y={y + 8} w={120} h={3} />
            </>
          ) : (
            <>
              <Dot cx={28} cy={y + 6} r={5} className={tone.faint} />
              <Line x={40} y={y + 1} w={70} className={tone.faint} />
              <Line x={40} y={y + 8} w={110} h={3} className={tone.faint} />
            </>
          )}
        </g>
      ))}
    </Frame>
  );
}
