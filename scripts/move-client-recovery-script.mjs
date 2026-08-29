import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const outputDirectory = path.resolve("out");
const recoveryPattern = /<script id="cooper-client-asset-recovery">[\s\S]*?<\/script>/g;

async function listHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return listHtmlFiles(entryPath);
      return entry.isFile() && entry.name.endsWith(".html") ? [entryPath] : [];
    }),
  );
  return nested.flat();
}

const htmlFiles = await listHtmlFiles(outputDirectory);
if (htmlFiles.length === 0) {
  throw new Error(`No exported HTML files found in ${outputDirectory}`);
}

for (const htmlFile of htmlFiles) {
  const html = await readFile(htmlFile, "utf8");
  const matches = html.match(recoveryPattern) ?? [];

  if (matches.length !== 1) {
    throw new Error(`Expected one client recovery script in ${htmlFile}; found ${matches.length}`);
  }
  if (!html.includes("<head>")) {
    throw new Error(`Missing <head> in ${htmlFile}`);
  }

  const recoveryScript = matches[0];
  const withoutRecoveryScript = html.replace(recoveryScript, "");
  const reorderedHtml = withoutRecoveryScript.replace("<head>", `<head>${recoveryScript}`);
  await writeFile(htmlFile, reorderedHtml, "utf8");
}

console.log(`Moved the client recovery script before static assets in ${htmlFiles.length} HTML file(s).`);
