import { Frame, Box, Button, Dot, Line, tone } from "@/components/thumbnail";

export default function ConnectivityErrorThumbnail() {
  return (
    <Frame>
      <Box x={36} y={18} w={128} h={84} r={10} />
      <path d="M150 28 l6 6 m0 -6 l-6 6" className="stroke-muted-foreground" strokeWidth={1.1} strokeLinecap="round" />
      <path d="M50 42 a14 14 0 0 1 20 0 M54 46 a8 8 0 0 1 12 0" className="stroke-red-500" strokeWidth={1.6} strokeLinecap="round" />
      <Dot cx={60} cy={50} r={1.8} className="fill-red-500" />
      <path d="M48 32 L72 54" className="stroke-red-500" strokeWidth={1.6} strokeLinecap="round" />
      <Line x={80} y={36} w={56} className={tone.strong} />
      <Line x={80} y={46} w={64} h={3} />
      <Line x={48} y={64} w={100} h={3} />
      <Line x={48} y={71} w={70} h={3} />
      <Button x={92} y={84} w={30} outline />
      <Button x={126} y={84} w={28} />
    </Frame>
  );
}
