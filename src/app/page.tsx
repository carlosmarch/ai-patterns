"use client";

import { useRouter } from "next/navigation";

import { ShinyButton } from "@/registry/buttons/shiny-button/component";

export default function Home() {
  const router = useRouter();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-32 text-center">
      <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-balance">
        Beautiful, copy-paste UI components
      </h1>
      <p className="max-w-md text-muted-foreground">
        A small, growing library of animated React components you own the source to.
      </p>
      <ShinyButton onClick={() => router.push("/components")}>Browse components</ShinyButton>
    </main>
  );
}
