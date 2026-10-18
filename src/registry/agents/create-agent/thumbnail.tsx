import { Frame, Box, Button, Check, Line, tone } from "@/components/thumbnail";

export default function CreateAgentThumbnail() {
  return (
    <Frame>
      <Box x={44} y={12} w={112} h={96} />
      <Line x={56} y={22} w={14} h={3} className={tone.strong} />
      <Line x={73} y={22} w={14} h={3} />
      <Box x={56} y={34} w={18} h={18} r={5} className="fill-violet-500" />
      <Line x={80} y={38} w={50} className={tone.strong} />
      <Line x={80} y={46} w={32} />
      <Box x={56} y={60} w={6} h={6} r={1.5} className={tone.strong} />
      <Check cx={59} cy={63} s={1.6} />
      <Line x={67} y={61} w={48} />
      <Box x={56} y={72} w={6} h={6} r={1.5} />
      <Line x={67} y={73} w={36} />
      <Button x={86} y={90} w={26} outline />
      <Button x={116} y={90} w={30} />
    </Frame>
  );
}
