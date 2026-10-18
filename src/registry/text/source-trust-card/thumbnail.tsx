import { Frame, Box, Button, Line, tone } from "@/components/thumbnail";

export default function SourceTrustCardThumbnail() {
  return (
    <Frame>
      <Box x={36} y={14} w={128} h={66} r={8} />
      <Line x={48} y={26} w={40} h={3} />
      <Button x={124} y={23} w={28} h={9} outline />
      <Line x={48} y={42} w={96} className={tone.strong} />
      <Line x={48} y={54} w={100} h={3} />
      <Line x={48} y={62} w={70} h={3} />
      <Button x={40} y={92} w={36} />
      <Button x={80} y={92} w={40} outline />
      <Button x={124} y={92} w={36} outline />
    </Frame>
  );
}
