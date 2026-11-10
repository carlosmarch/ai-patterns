import { Box, Dot, Frame, Line, tone } from "@/components/thumbnail";

// A particle sphere (dots on a few latitude rings, brighter on the near side),
// the state word above it, the transcript and the call pill below it.
const CX = 100;
const CY = 44;
const R = 26;

const DOTS = (() => {
  const dots: { x: number; y: number; r: number; front: boolean }[] = [];
  const rings = 7;
  for (let i = 1; i < rings; i++) {
    const lat = (i / rings) * Math.PI;
    const ringR = Math.sin(lat);
    const y = Math.cos(lat);
    const count = Math.round(4 + ringR * 9);
    for (let j = 0; j < count; j++) {
      const lon = (j / count) * Math.PI * 2 + i * 0.4;
      const z = Math.sin(lon) * ringR;
      dots.push({ x: CX + Math.cos(lon) * ringR * R, y: CY - y * R, r: z > 0 ? 1.3 : 0.8, front: z > 0 });
    }
  }
  return dots;
})();

export default function VoiceOrbThumbnail() {
  return (
    <Frame>
      <Line x={88} y={7} w={24} h={3} className={tone.text} />
      {DOTS.map((d, i) => (
        <circle key={i} cx={d.x.toFixed(2)} cy={d.y.toFixed(2)} r={d.r} className={d.front ? tone.strong : tone.text} />
      ))}
      <Line x={64} y={80} w={72} h={4} className={tone.text} />
      <Line x={70} y={88} w={60} h={4} className={tone.mid} />
      <Box x={76} y={100} w={48} h={14} r={7} />
      <Dot cx={84} cy={107} r={2.5} className={tone.mid} />
      <Line x={93} y={105.5} w={14} h={3} className={tone.text} />
      <Dot cx={116} cy={107} r={3.5} className={tone.mid} />
    </Frame>
  );
}
