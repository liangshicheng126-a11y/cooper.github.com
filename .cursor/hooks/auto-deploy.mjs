#!/usr/bin/env node
import { spawnSync } from "node:child_process";

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: process.env.GIT_AUTHOR_NAME || "Cursor Auto Deploy",
      GIT_AUTHOR_EMAIL: process.env.GIT_AUTHOR_EMAIL || "cursor-auto-deploy@local.dev",
      GIT_COMMITTER_NAME: process.env.GIT_COMMITTER_NAME || "Cursor Auto Deploy",
      GIT_COMMITTER_EMAIL: process.env.GIT_COMMITTER_EMAIL || "cursor-auto-deploy@local.dev",
    },
  });
  return {
    code: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function getCurrentBranch() {
  const branch = run("git", ["branch", "--show-current"]);
  if (branch.code !== 0) return "";
  return branch.stdout.trim();
}

function parseChangedFiles(porcelainOutput) {
  return porcelainOutput
    .split("\n")
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => {
      const rawPath = line.slice(3).trim();
      if (rawPath.includes(" -> ")) {
        return rawPath.split(" -> ").pop()?.trim() ?? "";
      }
      return rawPath;
    })
    .filter(Boolean);
}

function shouldIgnore(path) {
  const normalized = path.replace(/\\/g, "/");
  return (
    normalized.startsWith(".next/") ||
    normalized.startsWith("out/") ||
    normalized.startsWith("node_modules/") ||
    normalized.startsWith(".git/")
  );
}

const status = run("git", ["status", "--porcelain"]);
if (status.code !== 0) {
  process.stdout.write('{ "continue": false }');
  process.exit(0);
}

const changedFiles = parseChangedFiles(status.stdout);
const deployableFiles = changedFiles.filter((file) => !shouldIgnore(file));

if (deployableFiles.length === 0) {
  process.stdout.write('{ "continue": false }');
  process.exit(0);
}

const branch = getCurrentBranch();
if (!branch) {
  process.stdout.write('{ "continue": false }');
  process.exit(0);
}

const add = run("git", ["add", "-A", "--", ...deployableFiles]);
if (add.code !== 0) {
  process.stdout.write('{ "continue": false }');
  process.exit(0);
}

const timestamp = new Date().toISOString().replace("T", " ").replace(/\..+/, " UTC");
const commitMessage = `chore: auto deploy after chat (${timestamp})`;
const commit = run("git", ["commit", "-m", commitMessage]);

if (commit.code !== 0) {
  process.stdout.write('{ "continue": false }');
  process.exit(0);
}

run("git", ["push", "origin", branch]);
process.stdout.write('{ "continue": false }');
