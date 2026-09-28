#!/usr/bin/env node
// Records /reel to an MP4, frame by frame.
//
// Real-time screen capture drops frames at 1080p (backdrop blur is expensive
// in headless Chromium), so instead we freeze time: Playwright's fake clock
// drives setTimeout/rAF/performance.now, and every WAAPI/CSS animation is
// paused and stepped by hand. Each frame is advanced exactly 1/fps seconds
// and captured, so the video is smooth no matter how slow rendering is.
//
// Usage (with the site running, ideally `npm run build && npm start`):
//   node scripts/record-reel.mjs [--url http://localhost:3000] [--out reel.mp4] [--fps 60] [--vertical]
//
// --vertical records the 1080×1920 Instagram cut from /reel/vertical.
//
// Needs Playwright (local or global install) and ffmpeg (on PATH or $FFMPEG).

import { execSync, spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1]]] : acc), [])
);
const vertical = "vertical" in args;
const origin = (args.url ?? "http://localhost:3000").replace(/\/reel.*$/, "").replace(/\/$/, "");
const url = `${origin}/reel${vertical ? "/vertical" : ""}?record`;
const out = args.out ?? `public/reel/ai-patterns-reel${vertical ? "-vertical" : ""}.mp4`;
const viewport = vertical ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 };
const fps = Number(args.fps ?? 60);
const ffmpeg = process.env.FFMPEG ?? "ffmpeg";

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch {
    const root = execSync("npm root -g").toString().trim();
    return await import(join(root, "playwright", "index.mjs"));
  }
}

// Pauses every document animation and advances it by `dt` ms per call.
// Animations first seen in this call start from 0; ones that reach their end
// are finish()ed so `finished` promises (AnimatePresence exits, Motion's
// transitionEnd) still resolve.
const STEP_ANIMATIONS = `
window.__stepAnimations = (dt) => {
  for (const a of document.getAnimations()) {
    if (a.playState === "finished") continue;
    if (!a.__stepped) {
      a.__stepped = true;
      a.pause();
      a.currentTime = 0;
      continue;
    }
    const end = a.effect?.getComputedTiming().endTime;
    const next = (a.currentTime ?? 0) + dt * (a.playbackRate || 1);
    if (typeof end === "number" && isFinite(end) && next >= end) a.finish();
    else a.currentTime = next;
  }
};
`;

const { chromium } = await loadPlaywright();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
await page.addInitScript(STEP_ANIMATIONS);
await page.clock.install();
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForFunction(() => typeof window.__reelPlay === "function", null, { timeout: 120_000 });
await page.evaluate(() => document.fonts.ready);

const cdp = await page.context().newCDPSession(page);
const now = await page.evaluate(() => Date.now());
await page.clock.pauseAt(now + 1000);
await page.evaluate(() => window.__reelPlay());

mkdirSync(dirname(out), { recursive: true });
const enc = spawn(
  ffmpeg,
  [
    "-loglevel", "error", "-y",
    "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "slow",
    "-movflags", "+faststart", out,
  ],
  { stdio: ["pipe", "inherit", "inherit"] }
);

const total = await page.evaluate(() => window.__reel.totalMs);
const frames = Math.ceil((total / 1000) * fps);
let elapsed = 0;
for (let i = 1; i <= frames; i++) {
  const target = Math.round((i * 1000) / fps);
  const dt = target - elapsed;
  elapsed = target;
  await page.clock.runFor(dt);
  await page.evaluate((d) => window.__stepAnimations(d), dt);
  const { data } = await cdp.send("Page.captureScreenshot", { format: "jpeg", quality: 92 });
  if (!enc.stdin.write(Buffer.from(data, "base64"))) await new Promise((r) => enc.stdin.once("drain", r));
  if (i % fps === 0) process.stdout.write(`\r${(i / fps).toFixed(0)}s / ${(frames / fps).toFixed(1)}s`);
}

enc.stdin.end();
await new Promise((r, j) => enc.on("close", (code) => (code === 0 ? r() : j(new Error(`ffmpeg exited ${code}`)))));
await browser.close();
console.log(`\nWrote ${out} (${frames} frames @ ${fps}fps)`);
