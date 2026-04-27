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
