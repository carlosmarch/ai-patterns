import { Frame, Box, Button, Line, tone } from "@/components/thumbnail";

// A readable transcript above, and a muted bar with one button where the
// composer would be.
export default function ArchivedSessionThumbnail() {
  return (
    <Frame>
      <Box x={96} y={18} w={74} h={14} r={7} className={tone.muted} />
      <Line x={30} y={42} w={120} />
      <Line x={30} y={51} w={90} />
      <Box x={22} y={74} w={156} h={28} r={9} className="fill-muted stroke-none" />
      <Line x={32} y={86} w={88} className={tone.mid} />
      <Button x={134} y={82} w={34} h={12} outline />
    </Frame>
  );
}
