import type { Metadata } from "next";

import { Reel } from "./reel";

export const metadata: Metadata = {
  title: "Reel — ai-patterns",
  description: "A 16:9 motion reel of the ai-patterns catalogue.",
};

export default function ReelPage() {
  return <Reel />;
}
