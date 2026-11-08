import { Frame, Box, Button, Line, tone } from "@/components/thumbnail";

export default function PromptWizardThumbnail() {
  return (
    <Frame>
      <Box x={30} y={16} w={140} h={88} r={10} />
      <Line x={40} y={26} w={28} h={3} className={tone.strong} />
      <Line x={71} y={26} w={28} h={3} className={tone.strong} />
      <Line x={102} y={26} w={28} h={3} className={tone.faint} />
      <Line x={133} y={26} w={27} h={3} className={tone.faint} />
      <Line x={40} y={38} w={70} className={tone.mid} />
      <Button x={40} y={50} w={24} h={10} outline />
      <Button x={68} y={50} w={28} h={10} className={tone.strong} />
      <Button x={100} y={50} w={24} h={10} outline />
      <Line x={40} y={72} w={100} h={3} className={tone.faint} />
      <Line x={40} y={88} w={18} h={4} />
      <Button x={130} y={85} w={30} h={10} />
    </Frame>
  );
}
