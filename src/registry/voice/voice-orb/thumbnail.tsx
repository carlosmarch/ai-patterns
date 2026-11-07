import { Frame, tone } from "@/components/thumbnail";

// A particle sphere: dots on a few latitude rings, brighter on the near side.
const DOTS = (() => {
  const dots: { x: number; y: number; r: number; front: boolean }[] = [];
  const rings = 9;
  for (let i = 1; i < rings; i++) {
    const lat = (i / rings) * Math.PI;
    const ringR = Math.sin(lat);
    const y = Math.cos(lat);
    const count = Math.round(4 + ringR * 12);
    for (let j = 0; j < count; j++) {
      const lon = (j / count) * Math.PI * 2 + i * 0.4;
      const z = Math.sin(lon) * ringR;
      dots.push({
        x: 100 + Math.cos(lon) * ringR * 44,
        y: 60 - y * 44,
        r: z > 0 ? 1.6 : 1,
        front: z > 0,
      });
    }
  }
  return dots;
})();

export default function VoiceOrbThumbnail() {
  return (
    <Frame>
      {DOTS.map((d, i) => (
        <circle key={i} cx={d.x.toFixed(2)} cy={d.y.toFixed(2)} r={d.r} className={d.front ? tone.strong : tone.text} />
      ))}
    </Frame>
  );
}
