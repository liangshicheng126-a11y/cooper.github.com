#!/usr/bin/env node
import { spawnSync } from "node:child_process";

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return {
    code: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

const status = run("git", ["status", "--porcelain"]);
if (status.code !== 0) {
  process.stdout.write('{ "continue": false }');
  process.exit(0);
}

if (!status.stdout.trim()) {
  process.stdout.write('{ "continue": false }');
  process.exit(0);
}

run("git", ["add", "-A"]);

const timestamp = new Date().toISOString().replace("T", " ").replace(/\..+/, " UTC");
const commitMessage = `chore: auto deploy after chat (${timestamp})`;
const commit = run("git", ["commit", "-m", commitMessage]);

if (commit.code !== 0) {
  process.stdout.write('{ "continue": false }');
  process.exit(0);
}

run("git", ["push", "origin", "HEAD"]);
process.stdout.write('{ "continue": false }');
