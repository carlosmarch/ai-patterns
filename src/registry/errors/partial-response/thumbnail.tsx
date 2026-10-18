import { Frame, Button, Line, tone } from "@/components/thumbnail";

export default function PartialResponseThumbnail() {
  return (
    <Frame>
      <defs>
        <linearGradient id="partial-fade" x1="0" x2="1">
          <stop offset="0" stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id="partial-mask">
          <rect x={24} y={44} width={110} height={8} fill="url(#partial-fade)" />
        </mask>
      </defs>
      <Line x={24} y={22} w={150} />
      <Line x={24} y={34} w={140} />
      <rect x={24} y={46} width={110} height={4} rx={2} className={tone.text} mask="url(#partial-mask)" />
      <Button x={24} y={74} w={40} />
      <Button x={68} y={74} w={32} outline />
    </Frame>
  );
}
