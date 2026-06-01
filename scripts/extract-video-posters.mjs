#!/usr/bin/env node
/**
 * Regenerate p4 video card posters from first-frame sources.
 * - Local mp4 → ffmpeg frame grab
 * - Bilibili → official first_frame URL (run when bvid cover should refresh)
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const videosDir = path.join(root, "public", "videos");
const thumbsDir = path.join(videosDir, "thumbnails");

const localMp4 = path.join(videosDir, "微信视频2026-04-28_141704_425.mp4");
const fearOut = path.join(thumbsDir, "fear-instinct.jpg");
const bilibiliFirstFrame =
  "https://i2.hdslb.com/bfs/storyff/_00001l9nz303o6bw82bq8dt1di3reob_firsti.jpg";
const colorOut = path.join(thumbsDir, "color-reboot-edit.jpg");

fs.mkdirSync(thumbsDir, { recursive: true });

if (!fs.existsSync(localMp4)) {
  console.error("Missing local mp4:", localMp4);
  process.exit(1);
}

const ffmpeg = spawnSync(
  "ffmpeg",
  ["-y", "-ss", "0.1", "-i", localMp4, "-vframes", "1", "-update", "1", "-q:v", "2", fearOut],
  { stdio: "inherit" },
);
if (ffmpeg.status !== 0) process.exit(ffmpeg.status ?? 1);

const res = await fetch(bilibiliFirstFrame);
if (!res.ok) {
  console.error("Failed to fetch Bilibili first_frame:", res.status);
  process.exit(1);
}
fs.writeFileSync(colorOut, Buffer.from(await res.arrayBuffer()));

console.log("Wrote:", fearOut, colorOut);
