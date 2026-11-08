import { Frame, Box, Button, Line, tone } from "@/components/thumbnail";

export default function AccessRequestThumbnail() {
  return (
    <Frame>
      <Box x={22} y={14} w={156} h={92} r={8} />
      <Box x={32} y={23} w={11} h={11} r={3} className={tone.strong} />
      <Line x={48} y={24} w={52} className={tone.strong} />
      <Line x={48} y={31} w={26} h={3} className={tone.text} />
      <Box x={32} y={41} w={136} h={14} r={3} className={tone.muted} />
      <Line x={37} y={46.5} w={84} h={3} className={tone.text} />
      <Line x={32} y={62} w={26} h={3} className={tone.text} />
      <Line x={72} y={62} w={30} h={3} className={tone.faint} />
      <Line x={112} y={62} w={24} h={3} className={tone.mid} />
      <Line x={32} y={71} w={22} h={3} className={tone.text} />
      <Line x={72} y={71} w={22} h={3} className={tone.faint} />
      <Line x={112} y={71} w={28} h={3} className={tone.mid} />
      <Line x={32} y={91} w={60} h={3} className={tone.text} />
      <Button x={118} y={87} w={18} h={10} outline />
      <Button x={140} y={87} w={28} h={10} />
    </Frame>
  );
}
