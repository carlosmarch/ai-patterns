import { Frame, Box, Button, Line, tone } from "@/components/thumbnail";

export default function ProcedureBuilderThumbnail() {
  return (
    <Frame>
      <Box x={24} y={10} w={152} h={100} />
      <Line x={36} y={20} w={60} className={tone.strong} />
      <Line x={36} y={32} w={4} className={tone.text} />
      <Line x={44} y={32} w={100} />
      <Box x={36} y={44} w={22} h={10} r={3} className="fill-sky-500/20 stroke-sky-500" />
      <Line x={41} y={47} w={12} className="fill-sky-500" />
      <Line x={62} y={47} w={60} />
      <Line x={42} y={60} w={1.5} h={18} className={tone.faint} />
      <Line x={50} y={62} w={84} />
      <Line x={50} y={72} w={60} />
      <Box x={36} y={84} w={30} h={10} r={3} className={tone.muted} />
      <Line x={41} y={87} w={20} />
      <Line x={70} y={87} w={50} />
      <Button x={130} y={84} w={34} className="fill-amber-500/80" />
    </Frame>
  );
}
