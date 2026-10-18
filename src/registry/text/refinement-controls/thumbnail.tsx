import { Frame, Box, Button, Line, tone } from "@/components/thumbnail";

export default function RefinementControlsThumbnail() {
  return (
    <Frame>
      <Box x={24} y={14} w={152} h={46} r={8} />
      <Line x={36} y={26} w={124} />
      <Line x={36} y={38} w={110} />
      <Line x={36} y={48} w={70} />
      <Button x={24} y={70} w={34} outline />
      <Button x={62} y={70} w={30} outline />
      <Button x={96} y={70} w={40} outline />
      <Box x={24} y={88} w={152} h={18} r={9} />
      <Line x={36} y={95} w={60} className={tone.faint} />
    </Frame>
  );
}
