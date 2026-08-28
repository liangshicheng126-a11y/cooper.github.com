import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cache = new Map();

function load(file) {
  const absolute = path.resolve(root, file);
  if (cache.has(absolute)) return cache.get(absolute).exports;
  const module = { exports: {} };
  cache.set(absolute, module);
  const compiled = ts.transpileModule(readFileSync(absolute, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  });
  const nativeRequire = createRequire(absolute);
  const requireLocal = (specifier) => specifier.startsWith(".")
    ? load(path.resolve(path.dirname(absolute), `${specifier}.ts`))
    : nativeRequire(specifier);
  new Function("module", "exports", "require", compiled.outputText)(module, module.exports, requireLocal);
  return module.exports;
}

const { languageOptions } = load("src/locales/config.ts");
const {
  PERSONAL_WEBSITE_SCREENSHOT_GROUPS: groups,
  buildPersonalWebsiteScreenshotGroups: resolveGroups,
  personalWebsiteScreenshotPath: screenshotPath,
} = load("src/lib/p2PersonalWebsiteScreenshotManifest.ts");
const languages = languageOptions.map(({ value }) => value);
const files = groups.flatMap((group) => group.files);
const makeFiles = (values = files) => Object.fromEntries(
  languages.map((language) => [language, new Set(values)]),
);

assert.deepEqual(groups.map(({ groupId, files: groupFiles }) => [groupId, groupFiles.length]), [
  ["pages", 4], ["components", 4],
]);
assert.equal(new Set(files).size, 8);
assert.ok(files.includes("language-menu.webp"));
assert.ok(!files.some((file) => file.includes("task-brief")));

const complete = resolveGroups(makeFiles());
for (const language of languages) {
  assert.deepEqual(
    complete[language].flatMap((group) => group.images),
    files.map((file) => screenshotPath(language, file)),
    `${language}: all eight screenshots must match the selected language`,
  );
}

const oneMissing = makeFiles();
oneMissing.ko.delete("language-menu.webp");
const withFallback = resolveGroups(oneMissing).ko.flatMap((group) => group.images);
assert.equal(withFallback[6], screenshotPath("zh", "language-menu.webp"));
assert.equal(withFallback.filter((src) => src.includes("/localized/ko/")).length, 7);
assert.equal(oneMissing.ko.size, 7, "Resolution must not mutate the source inventory");

oneMissing.zh.delete("language-menu.webp");
const missingBoth = resolveGroups(oneMissing).ko.flatMap((group) => group.images);
assert.equal(missingBoth.length, 7);
assert.ok(!missingBoth.some((src) => src.includes("language-menu")));
assert.ok(missingBoth.every((src) => src.includes("/localized/ko/")));

const missingLocale = makeFiles();
missingLocale.ja.clear();
assert.deepEqual(resolveGroups(missingLocale).ja, complete.zh);
const empty = resolveGroups(makeFiles([]));
for (const language of languages) assert.deepEqual(empty[language], []);

const legacyOnly = makeFiles(["home-hero.png", "task-brief-page.png", "task-brief-page.webp"]);
for (const language of languages) assert.deepEqual(resolveGroups(legacyOnly)[language], []);

const client = readFileSync(path.join(root, "src/app/portfolio/p2/[subId]/P2SubClient.tsx"), "utf8");
assert.match(client, /personalWebsiteGroupsByLanguage\?\.\[language\]/);
assert.match(client, /key=\{`personal-website-\$\{language\}`\}/, "Changing locale must discard stale lightbox state");
console.log("Four-language screenshot ordering, per-file Chinese fallback, omission, and lightbox reset checks passed.");

if (process.argv.includes("--assets")) {
  for (const language of languages) {
    for (const file of files) {
      const assetPath = path.join(root, "public", screenshotPath(language, file));
      assert.ok(statSync(assetPath).isFile(), `Missing screenshot: ${assetPath}`);
      assert.ok(statSync(assetPath).size > 0, `Empty screenshot: ${assetPath}`);
    }
  }
  console.log("All 32 localized screenshot assets are present.");
}
