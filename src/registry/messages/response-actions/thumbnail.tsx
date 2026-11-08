import { Frame, Box, Button, Line, tone } from "@/components/thumbnail";

export default function ResponseActionsThumbnail() {
  return (
    <Frame>
      <Line x={30} y={24} w={140} />
      <Line x={30} y={32} w={128} />
      <Line x={30} y={40} w={96} />
      <Box x={30} y={50} w={8} h={8} r={2} className={tone.muted} />
      <Box x={44} y={50} w={8} h={8} r={2} className={tone.muted} />
      <Box x={58} y={50} w={8} h={8} r={2} className={tone.mid} />
      <Button x={72} y={49} w={30} h={10} outline />
      <Box x={30} y={66} w={140} h={36} r={6} />
      <Line x={38} y={73} w={40} className={tone.mid} />
      <Button x={38} y={84} w={26} h={8} outline />
      <Button x={68} y={84} w={30} h={8} className={tone.strong} />
      <Button x={102} y={84} w={22} h={8} outline />
    </Frame>
  );
}
