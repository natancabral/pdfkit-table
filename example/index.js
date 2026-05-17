"use strict";

/**
 * Runs every example script found in this directory, except:
 *   - itself (index.js)
 *   - server scripts (those that never exit on their own, e.g. Express servers)
 *
 * Usage (from project root):
 *   node example/index.js
 *   yarn examples
 *   npm run examples
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const DIR = __dirname;

/** Scripts that should never be auto-executed (they block the process). */
const SKIP = new Set(["index.js", "document-00-server.js"]);

const scripts = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith(".js") && !SKIP.has(f))
  .sort();

if (scripts.length === 0) {
  console.log("No example scripts found.");
  process.exit(0);
}

console.log(`Running ${scripts.length} example(s):\n`);

let allOk = true;

for (const script of scripts) {
  const file = path.join(DIR, script);
  process.stdout.write(`  • ${script} … `);

  const result = spawnSync(process.execPath, [file], {
    cwd: DIR,
    env: { ...process.env, NODE_PATH: path.resolve(DIR, "../..") },
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.status === 0) {
    console.log("✓");
  } else {
    console.log("✗  FAILED");
    const errOutput = (result.stderr || result.stdout || "").toString().trim();
    if (errOutput) console.error(`    ${errOutput.split("\n").join("\n    ")}`);
    allOk = false;
  }
}

console.log("");
process.exit(allOk ? 0 : 1);
