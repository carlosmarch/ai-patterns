import { Box, Button, Dot, Frame, Line, tone } from "@/components/thumbnail";

export default function BorderBeamThumbnail() {
  return (
    <Frame>
      {/* Composer */}
      <Box x={30} y={22} w={140} h={52} r={10} />
      <Line x={38} y={36} w={60} />
      <Button x={38} y={58} w={22} h={9} outline />
      <Button x={64} y={58} w={22} h={9} outline />
      <Dot cx={159} cy={62} r={5} className={tone.faint} />
      {/* The beam: a brighter arc riding the composer's top-left border */}
      <path d="M 30 50 V 32 A 10 10 0 0 1 40 22 H 82" className="stroke-foreground" strokeWidth={1.75} strokeLinecap="round" />
      {/* Search pill with its own beam along the bottom edge */}
      <Box x={70} y={84} w={100} h={16} r={8} />
      <Dot cx={80} cy={92} r={3} className={tone.text} />
      <Line x={88} y={90} w={36} />
      <path d="M 104 100 H 150" className="stroke-foreground" strokeWidth={1.75} strokeLinecap="round" />
    </Frame>
  );
}
