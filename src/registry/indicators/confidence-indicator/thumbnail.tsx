import { Frame, Box, Line, tone } from "@/components/thumbnail";

export default function ConfidenceIndicatorThumbnail() {
  return (
    <Frame>
      {[3, 2, 1].map((level, i) => {
        const y = 30 + i * 22;
        return (
          <g key={level}>
            <Line x={50} y={y + 3} w={64} />
            {[0, 1, 2].map((s) => (
              <Box key={s} x={124 + s * 9} y={y} w={7} h={10} r={1.5} className={s < level ? tone.strong : tone.faint} />
            ))}
          </g>
        );
      })}
    </Frame>
  );
}
