import { Frame, Box, Line, tone } from "@/components/thumbnail";

export default function ProcedureBuilderThumbnail() {
  return (
    <Frame>
      <Box x={30} y={14} w={140} h={92} />
      <Line x={42} y={26} w={90} />
      <Line x={42} y={40} w={14} className={tone.strong} />
      <Line x={60} y={40} w={60} />
      <Line x={44} y={52} w={1.5} h={20} className={tone.faint} />
      <Line x={52} y={54} w={80} />
      <Line x={52} y={66} w={60} />
      <Line x={42} y={82} w={20} className={tone.strong} />
      <Line x={66} y={82} w={50} />
    </Frame>
  );
}
