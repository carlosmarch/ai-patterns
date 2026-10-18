import { Frame, Box, Button, Dot, Line, tone } from "@/components/thumbnail";

export default function PromptBarProThumbnail() {
  return (
    <Frame>
      <Button x={30} y={22} w={40} outline />
      <Button x={74} y={22} w={50} outline />
      <Button x={128} y={22} w={42} outline />
      <Box x={24} y={44} w={152} h={56} r={12} />
      <Line x={38} y={58} w={90} />
      <Button x={38} y={82} w={28} outline />
      <Button x={70} y={82} w={32} outline />
      <Dot cx={160} cy={87} r={6} className={tone.strong} />
    </Frame>
  );
}
