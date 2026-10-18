import { Frame, tone } from "@/components/thumbnail";

export default function VoiceWaveformThumbnail() {
  return (
    <Frame>
      {[8, 14, 24, 18, 32, 46, 28, 52, 36, 22, 40, 28, 16, 22, 12, 6].map((h, i) => (
        <rect key={i} x={42 + i * 7.5} y={60 - h / 2} width={4} height={h} rx={2} className={i > 3 && i < 12 ? tone.strong : tone.text} />
      ))}
    </Frame>
  );
}
