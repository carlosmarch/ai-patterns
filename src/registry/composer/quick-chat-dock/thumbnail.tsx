import { Frame, Box, Line, tone } from "@/components/thumbnail";

export default function QuickChatDockThumbnail() {
  return (
    <Frame>
      {/* Floating prompt bar */}
      <Box x={30} y={58} w={140} h={22} r={6} />
      <Line x={40} y={67} w={64} />
      <Box x={152} y={63} w={12} h={12} r={3} className={tone.strong} />
      {/* Bottom dock with two actions */}
      <Box x={78} y={90} w={44} h={18} r={5} className={tone.mid} />
      <Box x={82} y={93} w={17} h={12} r={3} className={tone.faint} />
      <Box x={101} y={93} w={17} h={12} r={3} className={tone.faint} />
    </Frame>
  );
}
