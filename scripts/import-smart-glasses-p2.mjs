import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "photos", "portfolio", "p2", "smart-glasses");
const SOURCE_DIR = process.argv[2] ?? "X:/A";

const IMPORTS = [
  { src: "主页面.png", dest: "home-dashboard.png" },
  { src: "眼镜详情.png", dest: "glasses-detail.png" },
  { src: "我的.png", dest: "profile.png" },
  { src: "个人信息.png", dest: "personal-info.png" },
  { src: "日历.png", dest: "calendar-day.png" },
  { src: "日历周.png", dest: "calendar-week.png" },
  { src: "日历年.png", dest: "calendar-year.png" },
  { src: "文件 提词器.png", dest: "files-teleprompter.png" },
  { src: "文件 详情页.png", dest: "files-detail.png" },
  { src: "文件 地图.png", dest: "files-map.png" },
  { src: "文件 翻译.png", dest: "files-translate.png" },
  { src: "文件 视频.png", dest: "files-video.png" },
  { src: "数据量化 月.png", dest: "data-month.png" },
  { src: "数据量化 年.png", dest: "data-year.png" },
  { src: "数据量化 详情.png", dest: "data-detail.png" },
];

const MAX_WIDTH = 1200;

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  for (const { src, dest } of IMPORTS) {
    const sourcePath = path.join(SOURCE_DIR, src);
    const targetPath = path.join(OUT_DIR, dest);
    const meta = await sharp(sourcePath).metadata();
    let pipeline = sharp(sourcePath);
    if (meta.width > MAX_WIDTH) {
      pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
    }
    await pipeline.png({ compressionLevel: 9 }).toFile(targetPath);
    const outMeta = await sharp(targetPath).metadata();
    console.log(`  ${dest}: ${outMeta.width}×${outMeta.height}`);
  }

  console.log(`\nDone. ${IMPORTS.length} image(s) → ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
