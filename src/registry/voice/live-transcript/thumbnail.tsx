import { Frame, Box, Dot, Line, tone } from "@/components/thumbnail";

export default function LiveTranscriptThumbnail() {
  return (
    <Frame>
      {(
        [
          ["fill-violet-500", 120, 80],
          ["fill-sky-500", 100, 130],
          ["fill-violet-500", 90, 0],
        ] as const
      ).map(([c, w1, w2], i) => {
        const y = 14 + i * 34;
        return (
          <g key={i}>
            <Dot cx={28} cy={y + 5} r={6} className={c} />
            <Line x={40} y={y + 1} w={30} h={3} className={tone.strong} />
            <Line x={40} y={y + 10} w={w1} className={i === 2 ? tone.faint : tone.text} />
            {w2 > 0 && <Line x={40} y={y + 19} w={w2} />}
          </g>
        );
      })}
      <Box x={133} y={89} w={2.5} h={8} r={1} className="fill-sky-500" />
    </Frame>
  );
}
