#!/usr/bin/env node
/**
 * E1.2 - Auto-Rebuild listener (Save -> Live).
 *
 * A tiny HTTP service that a Directus Flow webhook calls when content changes.
 * It DEBOUNCES bursts of saves into a single rebuild and runs deploy/rebuild.ps1.
 *
 * Hardening:
 *  - Binds to LOOPBACK ONLY (127.0.0.1). It is never reachable from the network;
 *    the Directus Flow runs on the same host and calls 127.0.0.1.
 *  - Requires a shared-secret header (X-Joe-Rebuild-Token == JOES_REBUILD_TOKEN),
 *    compared in constant time. Without a matching token -> 401.
 *  - Only POST /rebuild triggers work; GET /health is a liveness probe.
 *  - One rebuild at a time; saves arriving during a run queue exactly one
 *    follow-up build (no pile-up, no overlap).
 *
 * No secrets in code: JOES_REBUILD_TOKEN comes from the environment / .env.
 * Install as a service with deploy/install-rebuild-listener.ps1.
 *
 * Env:
 *   JOES_REBUILD_TOKEN   required shared secret (>= 16 chars recommended)
 *   JOES_REBUILD_PORT    listen port on 127.0.0.1 (default 8787)
 *   JOES_REBUILD_DEBOUNCE_MS  collect window in ms (default 60000)
 *   JOES_REBUILD_SCRIPT  path to rebuild.ps1 (default ./deploy/rebuild.ps1)
 *   JOES_REBUILD_SHELL   powershell executable (default "powershell")
 */
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { timingSafeEqual } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Merge the gitignored repo-root .env into process.env (without overriding
 * already-set vars). Keeps JOES_REBUILD_TOKEN out of any committed file.
 */
function loadEnv() {
  const envPath = join(repoRoot, ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let value = m[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(m[1] in process.env)) process.env[m[1]] = value;
  }
}

loadEnv();

const TOKEN = process.env.JOES_REBUILD_TOKEN ?? "";
const PORT = Number(process.env.JOES_REBUILD_PORT ?? 8787);
const DEBOUNCE_MS = Number(process.env.JOES_REBUILD_DEBOUNCE_MS ?? 60000);
const SCRIPT = resolve(repoRoot, process.env.JOES_REBUILD_SCRIPT ?? "deploy/rebuild.ps1");
const SHELL = process.env.JOES_REBUILD_SHELL ?? "powershell";

if (!TOKEN || TOKEN.length < 16) {
  console.error("[listener] JOES_REBUILD_TOKEN fehlt oder ist zu kurz (>= 16 Zeichen). Abbruch.");
  process.exit(1);
}

function log(msg) {
  console.log(`[${new Date().toISOString()}] [listener] ${msg}`);
}

/** Constant-time token comparison; length-safe. */
function validToken(received) {
  const a = Buffer.from(String(received));
  const b = Buffer.from(TOKEN);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

let debounceTimer = null;
let running = false;
let queuedDuringRun = false;

function scheduleRebuild() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(runRebuild, DEBOUNCE_MS);
  log(`Rebuild in ${Math.round(DEBOUNCE_MS / 1000)}s eingeplant (Debounce).`);
}

function runRebuild() {
  debounceTimer = null;
  if (running) {
    queuedDuringRun = true;
    log("Rebuild laeuft bereits -> ein Folge-Build eingereiht.");
    return;
  }
  running = true;
  log(`Starte: ${SHELL} -File ${SCRIPT}`);
  const child = spawn(SHELL, ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", SCRIPT], {
    cwd: repoRoot,
  });
  child.stdout.on("data", (d) => process.stdout.write(d));
  child.stderr.on("data", (d) => process.stderr.write(d));
  child.on("close", (code) => {
    running = false;
    log(`Rebuild beendet (exit ${code}).`);
    if (queuedDuringRun) {
      queuedDuringRun = false;
      log("Eingereihter Folge-Build wird geplant.");
      scheduleRebuild();
    }
  });
  child.on("error", (err) => {
    running = false;
    log(`Rebuild-Prozessfehler: ${err.message}`);
  });
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);

  if (req.method === "GET" && url.pathname === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ status: "ok", running, scheduled: debounceTimer !== null }));
    return;
  }

  if (req.method === "POST" && url.pathname === "/rebuild") {
    if (!validToken(req.headers["x-joe-rebuild-token"])) {
      log("Abgelehnt: ungueltiges Token.");
      res.writeHead(401, { "content-type": "text/plain" });
      res.end("unauthorized");
      return;
    }
    // Drain and ignore the body; the trigger carries no payload we need.
    req.resume();
    scheduleRebuild();
    res.writeHead(202, { "content-type": "text/plain" });
    res.end("accepted");
    return;
  }

  res.writeHead(404, { "content-type": "text/plain" });
  res.end("not found");
});

// LOOPBACK ONLY: never bind 0.0.0.0.
server.listen(PORT, "127.0.0.1", () => {
  log(
    `Hoert auf http://127.0.0.1:${PORT} (POST /rebuild, GET /health). Debounce ${DEBOUNCE_MS}ms.`,
  );
});
