import { Box, Button, Dot, Frame, Line, tone } from "@/components/thumbnail";

export default function BorderBeamThumbnail() {
  return (
    <Frame>
      {/* Composer */}
      <Box x={30} y={34} w={140} h={52} r={10} />
      <Line x={40} y={46} w={60} />
      <Dot cx={42} cy={74} r={4} className={tone.faint} />
      <Button x={50} y={69} w={28} h={10} outline />
      <Dot cx={159} cy={74} r={5} className={tone.faint} />
      {/* The beam: brighter arcs riding the composer's border */}
      <path d="M 30 62 V 44 A 10 10 0 0 1 40 34 H 82" className="stroke-foreground" strokeWidth={1.75} strokeLinecap="round" />
      <path d="M 118 86 H 160 A 10 10 0 0 0 170 76 V 70" className="stroke-foreground" strokeWidth={1.75} strokeLinecap="round" opacity={0.5} />
    </Frame>
  );
}
