import { createServer, IncomingMessage, ServerResponse } from "http";
import { readFile, stat } from "fs/promises";
import { createReadStream } from "fs";
import { join, extname, resolve } from "path";
import { spawn, ChildProcess } from "child_process";

const MIME: Record<string, string> = {
  ".html": "text/html",
  ".json": "application/json",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg",
  ".js": "text/javascript",
  ".css": "text/css",
  ".ass": "text/plain",
};

// --- Spawn job management ---
interface SpawnJob {
  id: string;
  niche: string;
  config?: any;
  status: "queued" | "running" | "done" | "error";
  logs: string[];
  outputPath: string | null;
  process: ChildProcess | null;
}

const jobs = new Map<string, SpawnJob>();
const MAX_CONCURRENT = 2;
const ALLOWED_NICHES = new Set([
  "stoic",
  "productivity",
  "ai",
  "psychology",
  "money",
]);

function activeJobCount(): number {
  let count = 0;
  for (const job of jobs.values()) {
    if (job.status === "running") count++;
  }
  return count;
}

function startJob(job: SpawnJob): void {
  job.status = "running";
  job.logs.push(`[${ts()}] Starting generation for niche: ${job.niche}`);

  const isPreset = ALLOWED_NICHES.has(job.niche);
  const args = ["tsx", "src/index.ts", "run"];
  if (isPreset) {
    args.push("--niche", job.niche);
  } else {
    args.push("--custom-niche", job.niche);
  }
  if (job.config) {
    args.push("--config", JSON.stringify(job.config));
  }

  const child = spawn("npx", args, {
    cwd: process.cwd(),
    env: { ...process.env },
    stdio: ["ignore", "pipe", "pipe"],
  });

  job.process = child;

  child.stdout?.on("data", (chunk: Buffer) => {
    const lines = chunk.toString().split("\n").filter(Boolean);
    for (const line of lines) {
      // Strip ANSI codes for clean display
      const clean = line.replace(/\x1b\[[0-9;]*m/g, "").trim();
      if (clean) job.logs.push(clean);
    }
    // Keep last 100 log lines
    if (job.logs.length > 100) job.logs = job.logs.slice(-100);
  });

  child.stderr?.on("data", (chunk: Buffer) => {
    const lines = chunk.toString().split("\n").filter(Boolean);
    for (const line of lines) {
      const clean = line.replace(/\x1b\[[0-9;]*m/g, "").trim();
      if (clean) job.logs.push("[stderr] " + clean);
    }
    if (job.logs.length > 100) job.logs = job.logs.slice(-100);
  });

  child.on("close", (code) => {
    if (code === 0) {
      job.status = "done";
      job.logs.push(`[${ts()}] Generation complete!`);
      // Try to find the output path from memory.json
      findLatestOutput(job);
    } else {
      job.status = "error";
      job.logs.push(`[${ts()}] Process exited with code ${code}`);
    }
    job.process = null;
    // Start next queued job
    processQueue();
  });
}

function processQueue(): void {
  if (activeJobCount() >= MAX_CONCURRENT) return;
  for (const job of jobs.values()) {
    if (job.status === "queued") {
      startJob(job);
      break;
    }
  }
}

async function findLatestOutput(job: SpawnJob): Promise<void> {
  try {
    const memData = await readFile(
      join(process.cwd(), "output", "memory.json"),
      "utf-8",
    );
    const memory = JSON.parse(memData);
    if (memory.videos && memory.videos.length > 0) {
      const latest = memory.videos[memory.videos.length - 1];
      job.outputPath = latest.outputPath || null;
    }
  } catch {
    // memory.json might not exist yet
  }
}

function ts(): string {
  return new Date().toLocaleTimeString();
}

// --- Request parsing helpers ---
function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function jsonResponse(
  res: ServerResponse,
  status: number,
  data: unknown,
): void {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
    "Access-Control-Allow-Origin": "*",
  });
  res.end(body);
}

// --- Server ---
const server = createServer(async (req, res) => {
  const rawUrl = req.url || "/";
  const urlObj = new URL(rawUrl, "http://localhost");
  const pathname = urlObj.pathname;

  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  // API: Spawn a new job
  if (req.method === "POST" && pathname === "/api/spawn") {
    try {
      const body = await readBody(req);
      const parsed = JSON.parse(body);
      let niche = String(parsed.niche || "stoic").trim();

      // Sanitize: only allow alphanumeric, spaces, hyphens
      niche = niche.replace(/[^a-zA-Z0-9 \-]/g, "").slice(0, 50);
      if (!niche) niche = "stoic";

      const id = "job_" + Date.now();
      const job: SpawnJob = {
        id,
        niche,
        config: parsed.config ?? undefined,
        status: activeJobCount() >= MAX_CONCURRENT ? "queued" : "running",
        logs: [`[${ts()}] Job created: ${id} (niche: ${niche})`],
        outputPath: null,
        process: null,
      };
      jobs.set(id, job);

      if (job.status === "running") {
        startJob(job);
      }

      jsonResponse(res, 200, { id: job.id, status: job.status });
    } catch {
      jsonResponse(res, 400, { error: "Invalid request body" });
    }
    return;
  }

  // API: Generate script only (synchronous, ~5-10s)
  if (req.method === "POST" && pathname === "/api/generate-script") {
    try {
      const body = await readBody(req);
      const { niche, config: runConfig } = JSON.parse(body);
      const { generateScriptOnly } = await import("./src/studio.js");
      const result = await generateScriptOnly(niche, runConfig);
      jsonResponse(res, 200, result);
    } catch (err: any) {
      jsonResponse(res, 500, { error: err.message });
    }
    return;
  }

  // API: Produce video from existing script (async, returns jobId)
  if (req.method === "POST" && pathname === "/api/produce-video") {
    try {
      const body = await readBody(req);
      const { script, niche, config: runConfig } = JSON.parse(body);

      const id = "job_" + Date.now();
      const job: SpawnJob = {
        id,
        niche: niche?.name || "custom",
        status: "running",
        logs: [`[${ts()}] Starting video production...`],
        outputPath: null,
        process: null,
      };
      jobs.set(id, job);

      (async () => {
        try {
          const { generateFromScript } = await import("./src/studio.js");
          const videoPath = await generateFromScript(script, niche, runConfig);
          job.status = "done";
          job.outputPath = videoPath;
          job.logs.push(`[${ts()}] Video ready: ${videoPath}`);
        } catch (err: any) {
          job.status = "error";
          job.logs.push(`[${ts()}] Error: ${err.message}`);
        }
      })();

      jsonResponse(res, 200, { id });
    } catch {
      jsonResponse(res, 400, { error: "Invalid request" });
    }
    return;
  }

  // API: Regenerate a single segment image (async, returns jobId)
  if (req.method === "POST" && pathname === "/api/regenerate-image") {
    try {
      const body = await readBody(req);
      const { segmentIndex, visualPrompt, runDir, imageModel } =
        JSON.parse(body);

      const id = "job_" + Date.now();
      const job: SpawnJob = {
        id,
        niche: "regenerate-image",
        status: "running",
        logs: [`[${ts()}] Regenerating image for segment ${segmentIndex}...`],
        outputPath: null,
        process: null,
      };
      jobs.set(id, job);

      (async () => {
        try {
          const { regenerateImage } = await import("./src/studio.js");
          const imagePath = await regenerateImage(
            segmentIndex,
            visualPrompt,
            runDir,
            imageModel,
          );
          job.status = "done";
          job.outputPath = imagePath;
          job.logs.push(`[${ts()}] Image ready: ${imagePath}`);
        } catch (err: any) {
          job.status = "error";
          job.logs.push(`[${ts()}] Error: ${err.message}`);
        }
      })();

      jsonResponse(res, 200, { id });
    } catch {
      jsonResponse(res, 400, { error: "Invalid request" });
    }
    return;
  }

  // API: Regenerate voiceover (async, returns jobId)
  if (req.method === "POST" && pathname === "/api/regenerate-voice") {
    try {
      const body = await readBody(req);
      const { script, runDir, voice } = JSON.parse(body);

      const id = "job_" + Date.now();
      const job: SpawnJob = {
        id,
        niche: "regenerate-voice",
        status: "running",
        logs: [`[${ts()}] Regenerating voiceover...`],
        outputPath: null,
        process: null,
      };
      jobs.set(id, job);

      (async () => {
        try {
          const { regenerateVoice } = await import("./src/studio.js");
          const voicePath = await regenerateVoice(script, runDir, voice);
          job.status = "done";
          job.outputPath = voicePath;
          job.logs.push(`[${ts()}] Voiceover ready: ${voicePath}`);
        } catch (err: any) {
          job.status = "error";
          job.logs.push(`[${ts()}] Error: ${err.message}`);
        }
      })();

      jsonResponse(res, 200, { id });
    } catch {
      jsonResponse(res, 400, { error: "Invalid request" });
    }
    return;
  }

  // API: Reassemble video with existing assets (async, returns jobId)
  if (req.method === "POST" && pathname === "/api/reassemble") {
    try {
      const body = await readBody(req);
      const {
        images,
        voiceover,
        script,
        runDir,
        config: runConfig,
      } = JSON.parse(body);

      const id = "job_" + Date.now();
      const job: SpawnJob = {
        id,
        niche: "reassemble",
        status: "running",
        logs: [`[${ts()}] Reassembling video...`],
        outputPath: null,
        process: null,
      };
      jobs.set(id, job);

      (async () => {
        try {
          const { reassembleVideo } = await import("./src/studio.js");
          const videoPath = await reassembleVideo(
            images,
            voiceover,
            script,
            runDir,
            runConfig,
          );
          job.status = "done";
          job.outputPath = videoPath;
          job.logs.push(`[${ts()}] Video ready: ${videoPath}`);
        } catch (err: any) {
          job.status = "error";
          job.logs.push(`[${ts()}] Error: ${err.message}`);
        }
      })();

      jsonResponse(res, 200, { id });
    } catch {
      jsonResponse(res, 400, { error: "Invalid request" });
    }
    return;
  }

  // API: Get video history from memory.json
  if (req.method === "GET" && pathname === "/api/history") {
    try {
      const memData = await readFile(
        join(process.cwd(), "output", "memory.json"),
        "utf-8",
      );
      const memory = JSON.parse(memData);
      jsonResponse(res, 200, memory.videos || []);
    } catch {
      jsonResponse(res, 200, []);
    }
    return;
  }

  // API: Get job status
  const statusMatch = pathname.match(/^\/api\/status\/(.+)$/);
  if (req.method === "GET" && statusMatch) {
    const jobId = statusMatch[1];
    const job = jobs.get(jobId);
    if (!job) {
      jsonResponse(res, 404, { error: "Job not found" });
      return;
    }
    jsonResponse(res, 200, {
      id: job.id,
      status: job.status,
      niche: job.niche,
      logs: job.logs,
      outputPath: job.outputPath,
    });
    return;
  }

  // Static file serving
  let filePath: string;
  if (pathname === "/") {
    filePath = resolve(join(process.cwd(), "index.html"));
  } else {
    filePath = resolve(join(process.cwd(), decodeURIComponent(pathname)));
  }

  if (!filePath.startsWith(process.cwd())) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const fileStat = await stat(filePath);
    const ext = extname(filePath);
    const contentType = MIME[ext] || "application/octet-stream";

    // Handle Range requests for video/audio streaming
    const range = req.headers.range;
    if (range && (ext === ".mp4" || ext === ".mp3")) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileStat.size - 1;
      const chunkSize = end - start + 1;

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileStat.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
      });
      createReadStream(filePath, { start, end }).pipe(res);
    } else {
      const data = await readFile(filePath);
      res.writeHead(200, {
        "Content-Type": contentType,
        "Content-Length": fileStat.size,
        "Accept-Ranges": "bytes",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(data);
    }
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(3333, () => {
  console.log("GhostFeed Dashboard: http://localhost:3333");
  console.log("  /              Landing page");
  console.log("  /dashboard     Video dashboard");
  console.log("  /spawn         Live agent spawning");
  console.log("  /explain       Architecture");
});
