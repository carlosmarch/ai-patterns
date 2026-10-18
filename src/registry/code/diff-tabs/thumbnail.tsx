import { Frame, Box, Button, Line, tone } from "@/components/thumbnail";

export default function DiffTabsThumbnail() {
  return (
    <Frame>
      <Button x={28} y={14} w={36} h={12} />
      <Button x={68} y={14} w={40} h={12} outline />
      <Button x={112} y={14} w={32} h={12} outline />
      <Box x={24} y={34} w={152} h={72} r={8} />
      <rect x={25} y={60} width={150} height={10} className="fill-muted-foreground/10" />
      <rect x={25} y={72} width={150} height={10} className="fill-muted-foreground/20" />
      {[0, 1, 2, 3, 4].map((i) => (
        <Line key={i} x={36} y={44 + i * 12 + (i > 0 ? 1 : 0)} w={[70, 100, 84, 60, 92][i]} h={3} className={i === 2 || i === 3 ? tone.mid : tone.text} />
      ))}
    </Frame>
  );
}
