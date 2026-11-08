import { Frame, Box, Button, Line, tone } from "@/components/thumbnail";

export default function AccessRequestThumbnail() {
  return (
    <Frame>
      <Box x={52} y={8} w={96} h={104} r={10} />
      <Box x={94} y={15} w={12} h={12} r={3} className={tone.strong} />
      <Line x={78} y={32} w={44} className={tone.strong} />
      <Box x={60} y={42} w={80} h={16} r={4} className={tone.muted} />
      <Line x={65} y={48} w={56} h={3} className={tone.text} />
      <Box x={60} y={62} w={80} h={14} r={4} />
      <Line x={65} y={67} w={20} h={3} className={tone.text} />
      <Line x={100} y={67} w={34} h={3} className={tone.mid} />
      <Button x={60} y={84} w={80} h={9} />
      <Button x={60} y={97} w={80} h={9} outline />
    </Frame>
  );
}
