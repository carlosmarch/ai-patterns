import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          borderRadius: 7,
        }}
      >
        <svg
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fafafa"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Same crane as src/components/origami-mark.tsx (inlined: next/og can't import client code). */}
          <path d="M7 16.5 12 12v8z" fill="#fafafa" fillOpacity={0.25} stroke="none" />
          <path d="M5 3.5 7 16.5 12 20l5.5-3.5L21.5 4" />
          <path d="M5 3.5 10 14" />
          <path d="M21.5 4 14 14" />
          <path d="M2.5 7 5 3.5" />
          <path d="M7 16.5 12 12l5.5 4.5" />
          <path d="M12 12v8" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
