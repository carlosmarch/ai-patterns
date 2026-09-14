"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CollaborativePresence, type Collaborator } from "./component";

const TEAM: Collaborator[] = [
  {
    id: "u1",
    name: "Sarah Chen",
    role: "Admin",
    initials: "SC",
    color: "bg-violet-500",
    isOnline: true,
  },
  {
    id: "u2",
    name: "Marcus Webb",
    role: "Editor",
    initials: "MW",
    color: "bg-sky-500",
    isOnline: false,
  },
  {
    id: "u3",
    name: "Priya Nair",
    role: "Editor",
    initials: "PN",
    color: "bg-amber-500",
    isOnline: true,
  },
  {
    id: "u4",
    name: "James Okafor",
    role: "Viewer",
    initials: "JO",
    color: "bg-rose-500",
    isOnline: false,
  },
  {
    id: "u5",
    name: "Lin Zhang",
    role: "Viewer",
    initials: "LZ",
    color: "bg-teal-500",
    isOnline: false,
  },
];

export default function CollaborativePresenceDemo() {
  const [collaborators, setCollaborators] = React.useState(TEAM);

  function toggle(id: string) {
    setCollaborators((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isOnline: !c.isOnline } : c)),
    );
  }

  return (
    <div className="flex w-full max-w-lg flex-col gap-6">
      <CollaborativePresence collaborators={collaborators} />

      {/* Presence controls */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          Simulate who&apos;s viewing the record
        </p>
        <div className="flex flex-wrap gap-2">
          {TEAM.map((person) => {
            const current = collaborators.find((c) => c.id === person.id)!;
            return (
              <button
                key={person.id}
                type="button"
                onClick={() => toggle(person.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-all",
                  current.isOnline
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "border-border bg-background text-muted-foreground hover:bg-accent/50",
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full transition-colors",
                    current.isOnline ? "bg-emerald-400" : "bg-muted-foreground/40",
                  )}
                />
                {person.name.split(" ")[0]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
