import { Frame, Box, Button, Dot, Line, tone } from "@/components/thumbnail";

export default function PromptBarProThumbnail() {
  return (
    <Frame>
      <Line x={60} y={14} w={80} className={tone.strong} />
      <Button x={26} y={28} w={44} outline />
      <Button x={74} y={28} w={52} outline />
      <Button x={130} y={28} w={44} outline />
      <Box x={20} y={48} w={160} h={60} r={12} />
      <Line x={32} y={60} w={100} />
      <Button x={32} y={90} w={34} outline />
      <Dot cx={39} cy={95} r={2} className="fill-emerald-500" />
      <Line x={44} y={93.5} w={18} h={3} />
      <Button x={70} y={90} w={38} outline />
      <Dot cx={77} cy={95} r={2} className="fill-violet-500" />
      <Line x={82} y={93.5} w={20} h={3} />
      <Dot cx={164} cy={95} r={6} className={tone.strong} />
      <path d="M164 98 V92 M161.5 94.5 L164 92 L166.5 94.5" className="stroke-background" strokeWidth={1.2} strokeLinecap="round" />
    </Frame>
  );
}
