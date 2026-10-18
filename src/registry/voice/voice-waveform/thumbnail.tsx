import { Frame, tone } from "@/components/thumbnail";

export default function VoiceWaveformThumbnail() {
  return (
    <Frame>
      {[10, 18, 30, 22, 40, 56, 34, 62, 44, 28, 50, 36, 20, 30, 14, 8].map((h, i) => (
        <rect key={i} x={40 + i * 7.5} y={60 - h / 2} width={4} height={h} rx={2} className={i > 3 && i < 12 ? "fill-violet-500" : tone.text} />
      ))}
    </Frame>
  );
}
