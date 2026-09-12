"use client";

import * as React from "react";

import { AttachmentTray, type Attachment } from "./component";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%238b7cf6'/%3E%3C/svg%3E";

const initial: Attachment[] = [
  { id: "1", name: "sunset-photo.png", size: 2_400_000, progress: 62, status: "uploading", previewUrl: PLACEHOLDER_IMAGE },
  { id: "2", name: "quarterly-report-final-v2.pdf", size: 812_000, progress: 30, status: "uploading" },
  { id: "3", name: "notes.txt", size: 4_200, progress: 100, status: "done" },
  { id: "4", name: "archive.zip", size: 15_000_000, progress: 0, status: "error" },
];

export default function AttachmentTrayDemo() {
  const [attachments, setAttachments] = React.useState(initial);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setAttachments((prev) =>
        prev.map((a) => {
          if (a.status !== "uploading") return a;
          if (a.progress >= 100) return { ...a, status: "done" };
          return { ...a, progress: Math.min(100, a.progress + 11) };
        })
      );
    }, 400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <AttachmentTray
      className="w-full max-w-sm"
      attachments={attachments}
      onRemove={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
      onRetry={(id) =>
        setAttachments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: "uploading", progress: 0 } : a))
        )
      }
    />
  );
}
