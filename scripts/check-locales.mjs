import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cache = new Map();

// Load the project's data-only TypeScript dictionaries without a second runtime dependency.
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

function shape(value) {
  if (typeof value === "string") return "string";
  if (Array.isArray(value)) return value.map(shape);
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, shape(item)]));
}

function leaves(value, prefix = "") {
  if (typeof value === "string") return [[prefix, value]];
  return Object.entries(value).flatMap(([key, item]) => leaves(item, `${prefix}.${key}`));
}

const { translations } = load("src/locales/translations.ts");
const {
  DEFAULT_LANGUAGE,
  isLanguage,
  languageOptions,
  getLanguageOption,
  parseLanguageTag,
  resolveInitialLanguage,
} = load("src/locales/config.ts");
const { formatGalleryDate, formatGalleryLocation } = load("src/locales/media.ts");
assert.deepEqual(Object.keys(translations), ["zh", "en", "ja", "ko"]);
const expected = shape(translations.en);

for (const option of languageOptions) {
  const dictionary = translations[option.value];
  assert.deepEqual(shape(dictionary), expected, `${option.value}: mismatched keys or array lengths`);
  for (const [key, value] of leaves(dictionary)) {
    assert.ok(value.trim(), `${option.value}${key}: empty translation`);
    assert.ok(!value.includes("\uFFFD"), `${option.value}${key}: broken character encoding`);
  }
  assert.ok(isLanguage(option.value));
  assert.equal(getLanguageOption(option.value).htmlLang, option.htmlLang);
  console.log(`${option.value}: ${leaves(dictionary).length} strings, complete structure, no empty values`);
}

for (const invalid of [null, undefined, "", "fr", "ja-JP", "__proto__", {}, 0]) {
  assert.equal(isLanguage(invalid), false);
}

const deviceLanguageCases = [
  ["zh", "zh"], ["zh-CN", "zh"], ["zh-SG", "zh"], ["zh-TW", "zh"],
  ["zh-HK", "zh"], ["zh-MO", "zh"], ["zh-Hans", "zh"], ["zh-Hant", "zh"],
  ["zh-Hant-TW", "zh"], ["zh-Hans-CN", "zh"], ["ZH_hant_HK", "zh"],
  ["en", "en"], ["en-US", "en"], ["en-GB", "en"], ["en-US-u-hc-h12", "en"],
  ["ja", "ja"], ["ja-JP", "ja"], [" JA_jp ", "ja"],
  ["ko", "ko"], ["ko-KR", "ko"], ["ko-KP", "ko"],
];
for (const [tag, expectedLanguage] of deviceLanguageCases) {
  assert.equal(parseLanguageTag(tag), expectedLanguage, `Device tag ${tag}`);
  assert.equal(resolveInitialLanguage(null, [tag]), expectedLanguage, `First visit with ${tag}`);
  if (expectedLanguage === "zh") {
    assert.equal(getLanguageOption(parseLanguageTag(tag)).htmlLang, "zh-CN");
  }
}
for (const invalid of [null, undefined, "", "   ", "fr-FR", "de", "english", "en,ja", "zh CN", "ja-", {}, [], 0]) {
  assert.equal(parseLanguageTag(invalid), undefined, `Unsupported or invalid device tag: ${String(invalid)}`);
}

assert.equal(DEFAULT_LANGUAGE, "en");
for (const option of languageOptions) {
  const differentPreference = option.value === "ja" ? "ko-KR" : "ja-JP";
  assert.equal(
    resolveInitialLanguage(option.value, [differentPreference], "en-US"),
    option.value,
    "A saved manual choice must override all device preferences",
  );
}
for (const invalidSaved of [null, undefined, "", "fr", "ja-JP", "__proto__", {}, 0]) {
  assert.equal(resolveInitialLanguage(invalidSaved, ["fr-FR", "ko-KR", "ja-JP"], "en-US"), "ko");
}
assert.equal(resolveInitialLanguage(null, ["fr-FR", "ja-JP", "zh-TW"], "ko-KR"), "ja");
assert.equal(resolveInitialLanguage(null, ["zh-Hant", "ja-JP"], "en-US"), "zh");
assert.equal(resolveInitialLanguage(null, ["en-GB", "ko-KR"], "ja-JP"), "en");
assert.equal(resolveInitialLanguage(null, [], "ja-JP"), "ja");
assert.equal(resolveInitialLanguage(null, undefined, "ko-KR"), "ko");
assert.equal(resolveInitialLanguage(null, ["fr-FR", "de-DE"], "zh-HK"), "zh");
assert.equal(resolveInitialLanguage(null, [undefined, "", "unknown", "ja-JP"], "ko-KR"), "ja");
assert.equal(resolveInitialLanguage(null, ["fr-FR", "de-DE"], "es-ES"), "en");
assert.equal(resolveInitialLanguage(null), "en");
console.log("Device language parsing and saved-choice/device-list/fallback priority checks passed.");

assert.equal(formatGalleryDate("FEB 20", "ja"), "2月20日");
assert.equal(formatGalleryDate("FEB 20", "ko"), "2월 20일");
assert.equal(formatGalleryDate("OTC 9", "en"), "Oct 9");
assert.equal(formatGalleryDate("FEB 31", "en"), "FEB 31");
assert.equal(formatGalleryDate("Unknown", "ja"), "不明");
assert.equal(formatGalleryLocation("Jeju", "ko"), "제주");
assert.equal(formatGalleryLocation("GE NIE", "ja"), "GE NIE");
console.log("Locale configuration and gallery formatting checks passed.");
