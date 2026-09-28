import type { Metadata } from "next";

import { Reel } from "../reel";

export const metadata: Metadata = {
  title: "Vertical reel — ai-patterns",
  description: "A 9:16 motion reel of the ai-patterns catalogue, sized for Instagram.",
};

export default function VerticalReelPage() {
  return <Reel vertical />;
}
