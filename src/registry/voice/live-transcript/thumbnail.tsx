import { Frame, Box, Dot, Line, tone } from "@/components/thumbnail";

export default function LiveTranscriptThumbnail() {
  return (
    <Frame>
      {[0, 1, 2].map((i) => {
        const y = 22 + i * 28;
        return (
          <g key={i}>
            <Dot cx={32} cy={y + 2} r={4} className={i === 1 ? tone.mid : tone.strong} />
            <Line x={44} y={y} w={[120, 100, 70][i]} className={i === 2 ? tone.faint : tone.text} />
            {i < 2 && <Line x={44} y={y + 10} w={[80, 110][i]} />}
          </g>
        );
      })}
      <Box x={117} y={76} w={3} h={8} r={1} className={tone.strong} />
    </Frame>
  );
}
