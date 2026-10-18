import { Frame, Box, Button, Dot, Line, tone } from "@/components/thumbnail";

export default function SourceTrustCardThumbnail() {
  return (
    <Frame>
      <Box x={30} y={10} w={140} h={74} r={8} />
      <Dot cx={46} cy={26} r={6} className="fill-sky-500" />
      <Line x={58} y={22} w={40} h={3} />
      <Button x={120} y={20} w={38} h={11} className="fill-emerald-500/15 stroke-emerald-500/50" />
      <Dot cx={128} cy={25.5} r={2} className="fill-emerald-500" />
      <Line x={133} y={24} w={20} h={3} className="fill-emerald-600/70" />
      <Line x={42} y={42} w={110} className={tone.strong} />
      <Line x={42} y={54} w={116} h={3} />
      <Line x={42} y={62} w={90} h={3} />
      <Line x={42} y={70} w={70} h={3} />
      <Button x={36} y={94} w={38} h={12} />
      <Button x={78} y={94} w={42} h={12} outline />
      <Button x={124} y={94} w={36} h={12} outline />
    </Frame>
  );
}
