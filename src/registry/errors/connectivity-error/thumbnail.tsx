import { Frame, Box, Button, Line, tone } from "@/components/thumbnail";

export default function ConnectivityErrorThumbnail() {
  return (
    <Frame>
      <Box x={44} y={22} w={112} h={76} r={10} dashed />
      <Line x={58} y={36} w={56} className={tone.strong} />
      <Line x={58} y={48} w={80} h={3} />
      <Line x={58} y={56} w={60} h={3} />
      <Button x={90} y={76} w={26} outline />
      <Button x={120} y={76} w={24} />
    </Frame>
  );
}
