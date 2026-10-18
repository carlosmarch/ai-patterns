import { Frame, Box, Button, Dot, Line, tone } from "@/components/thumbnail";

export default function PromptBarThumbnail() {
  return (
    <Frame>
      <Line x={40} y={20} w={80} className={tone.faint} />
      <Line x={40} y={30} w={56} className={tone.faint} />
      <Box x={20} y={50} w={160} h={56} r={12} />
      <Line x={32} y={62} w={90} />
      <Button x={32} y={88} w={20} outline />
      <Line x={37} y={91.5} w={10} h={3} />
      <Button x={56} y={88} w={30} outline />
      <Line x={61} y={91.5} w={20} h={3} />
      <Dot cx={146} cy={93} r={6} className={tone.card} />
      <Line x={144.5} y={89.5} w={3} h={6} className={tone.text} />
      <Dot cx={162} cy={93} r={6} className={tone.strong} />
      <path d="M162 96 V90 M159.5 92.5 L162 90 L164.5 92.5" className="stroke-background" strokeWidth={1.2} strokeLinecap="round" />
    </Frame>
  );
}
