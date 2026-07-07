#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { platform } from "node:process";

const args = process.argv.slice(2);
const cmd = platform === "win32" ? "mvnw.cmd" : "./mvnw";

const result = spawnSync(cmd, args, {
  stdio: "inherit",
  shell: true,
  cwd: "services/payment-service",
});

process.exit(result.status ?? 1);