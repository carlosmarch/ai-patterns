import { Frame, Box, Line } from "@/components/thumbnail";

export default function TerminalStreamThumbnail() {
  return (
    <Frame>
      <Box x={24} y={16} w={152} h={88} r={8} className="fill-foreground stroke-foreground" />
      {[30, 42, 54, 66, 78].map((y, i) => (
        <Line key={y} x={36} y={y} w={[90, 60, 110, 74, 40][i]} h={3} className="fill-background/40" />
      ))}
      <Box x={80} y={76.5} w={4} h={6} r={0.5} className="fill-background/80" />
    </Frame>
  );
}
