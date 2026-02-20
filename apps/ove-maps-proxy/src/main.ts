import cors from "cors";
import path from "node:path";
import * as client from "prom-client";
import { promises as fs } from "node:fs";
import promBundle from "express-prom-bundle";
import express, { Request, Response, NextFunction } from "express";

const VALID_KEYS = (process.env.API_KEYS || "")
  .split(",")
  .map((k) => k.trim())
  .filter((k) => k.length > 0);

export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  // try query param first, then header
  const key =
    typeof req.query.api_key === "string"
      ? req.query.api_key
      : req.header("x-api-key");

  if (!key || !VALID_KEYS.includes(key)) {
    return res
      .status(401)
      .json({ error: "Unauthorized: invalid or missing API key" });
  }

  next();
}

// where on disk we store tiles
const CACHE_DIR =
  process.env.CACHE_DIR ?? path.resolve(__dirname, "..", "cache");
const USAGE_FILE = path.join(CACHE_DIR, "usage.json");
// holds usage counts keyed by relative path e.g. "12/3456/7890.png"
let usageMap: Record<string, number> = {};

// load usage map from disk (if exists)
async function loadUsageMap(): Promise<void> {
  try {
    const data = await fs.readFile(USAGE_FILE, "utf8");
    usageMap = JSON.parse(data);
  } catch {
    usageMap = {};
  }
}

loadUsageMap().catch(console.error);

// write usage map back
async function saveUsageMap(): Promise<void> {
  try {
    await fs.writeFile(USAGE_FILE, JSON.stringify(usageMap), "utf8");
  } catch (e) {
    console.warn("Failed to write usage map:", e);
  }
}
// record an access
function recordAccess(relPath: string): void {
  usageMap[relPath] = (usageMap[relPath] || 0) + 1;
  // you may debounce this in prod
  saveUsageMap().catch(() => {});
}

const MAX_CACHE_SIZE_BYTES = parseInt(
  process.env.MAX_CACHE_SIZE_BYTES ?? "1073741824",
  10
);
// interval between cleanup runs in ms (default 6 h)
const CLEANUP_INTERVAL_MS = parseInt(
  process.env.CLEANUP_INTERVAL_MS ?? String(1000 * 60 * 60 * 6),
  10
);

const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  metricsPath: `${process.env.BASE_PATH ?? ""}/metrics`,
});

const cacheSizeGauge = new client.Gauge({
  name: "tile_cache_size_bytes",
  help: "Total size of tile cache on disk in bytes",
});
const cacheMaxGauge = new client.Gauge({
  name: "tile_cache_max_size_bytes",
  help: "Configured maximum tile cache size in bytes",
});

cacheMaxGauge.set(0);

cacheMaxGauge.set(MAX_CACHE_SIZE_BYTES);

// initial current cache size
(async () => {
  const total = await calculateDirectorySize(CACHE_DIR);
  cacheSizeGauge.set(total);
})();

let isCleaning = false;

interface FileInfo {
  path: string;
  mtime: number;
  size: number;
}

async function getFilesInfo(
  dir: string,
  files: FileInfo[] = []
): Promise<FileInfo[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        await getFilesInfo(full, files);
      } else if (e.isFile() && e.name.endsWith(".png")) {
        const st = await fs.stat(full);
        files.push({ path: full, mtime: st.mtimeMs, size: st.size });
      }
    }
    return files;
  } catch {
    return [];
  }
}

async function calculateDirectorySize(dir: string): Promise<number> {
  const files = await getFilesInfo(dir);
  return files.reduce((sum, f) => sum + f.size, 0);
}

async function removeEmptyDirs(dir: string): Promise<void> {
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return;
  }
  if (entries.length === 0) {
    await fs.rmdir(dir);
    return;
  }
  for (const name of entries) {
    const full = path.join(dir, name);
    try {
      const st = await fs.stat(full);
      if (st.isDirectory()) {
        await removeEmptyDirs(full);
      }
    } catch {
      // ignore
    }
  }
  // try again
  entries = await fs.readdir(dir);
  if (entries.length === 0) {
    await fs.rmdir(dir);
  }
}

async function cleanupCache(): Promise<void> {
  if (isCleaning) return;
  isCleaning = true;
  try {
    const total = await calculateDirectorySize(CACHE_DIR);
    cacheSizeGauge.set(total);
    if (total <= MAX_CACHE_SIZE_BYTES) {
      return;
    }
    console.log(
      `Cache at ${total} bytes exceeds limit ` +
      `${MAX_CACHE_SIZE_BYTES}, pruning…`
    );
    const files = await getFilesInfo(CACHE_DIR);
    type FI = FileInfo & { usage: number; rel: string };
    const arr: FI[] = files.map((f) => {
      const rel = path.relative(CACHE_DIR, f.path);
      return { ...f, rel, usage: usageMap[rel] || 0 };
    });
    arr.sort((a, b) => a.usage - b.usage); // oldest first
    let size = total;
    for (const f of arr) {
      if (size <= MAX_CACHE_SIZE_BYTES) break;
      try {
        await fs.unlink(f.path);
        delete usageMap[f.rel];
        size -= f.size;
        console.log(`Deleted ${f.path}, freed ${f.size} bytes`);
      } catch (e) {
        console.warn(`Failed to delete ${f.path}:`, e);
      }
    }
    await removeEmptyDirs(CACHE_DIR);
    cacheSizeGauge.set(total);
    await saveUsageMap();
    console.log(`LFU cleanup done, new cache size ${size} bytes`);
  } catch (e) {
    console.error("Error during cache cleanup:", e);
  } finally {
    isCleaning = false;
  }
}

// run cleanup on startup, then schedule
cleanupCache().catch((e) => console.error("Initial cache cleanup error:", e));
setInterval(
  () => cleanupCache().catch((e) => console.error(e)),
  CLEANUP_INTERVAL_MS
);

const app = express();

app.use(metricsMiddleware);
app.use(cors());

const router = express.Router();
const PORT = process.env.PORT ?? 80;

// Helper to build remote URL
function buildRemoteUrl(
  tileURL: string,
  z: string,
  y: string,
  x: string
): string {
  return tileURL.replace("{:z:}", z).replace("{:y:}", y).replace("{:x:}", x);
}

// No auth in dev
if (process.env.NODE_ENV === "production") {
  router.use("/tiles", apiKeyAuth as Parameters<typeof router.use>[1]);
}
router.get("/tiles/:z/:y/:x", (async (req: Request, res: Response) => {
  const { z, y, x } = req.params;
  const tileURL = req.query.tileURL as string;

  // local path: cache/{z}/{y}/{x}.png
  const tileDir = path.join(CACHE_DIR, encodeURIComponent(tileURL), z ?? "0", y ?? "0");
  const tilePath = path.join(tileDir, `${x}.png`);
  const rel = path.relative(CACHE_DIR, tilePath);

  try {
    // 1) If cached, serve directly
    await fs.access(tilePath);
    // file exists
    res.type("image/png");
    // tell client they can cache for up to one year
    res.set("Cache-Control", "public, max-age=31536000");
    recordAccess(rel);
    return res.send(await fs.readFile(tilePath));
  } catch {
    // file does not exist → fetch from remote
  }

  const remoteUrl = buildRemoteUrl(tileURL, z ?? "0", y ?? "0", x ?? "0");

  let upstreamResponse;
  try {
    upstreamResponse = await fetch(remoteUrl);
  } catch (err) {
    console.error("fetch error:", err);
    return res.sendStatus(502);
  }

  if (!upstreamResponse.ok) {
    return res
      .status(upstreamResponse.status)
      .send(`Upstream error: ${upstreamResponse.statusText}`);
  }

  // read body as buffer
  const arrayBuffer = await upstreamResponse.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // ensure cache directory exists
  await fs.mkdir(tileDir, { recursive: true });
  await loadUsageMap();
  // write file (ignore errors)
  fs.writeFile(tilePath, buffer).catch((e) => {
    console.warn("warning: failed to write cache file", e);
  });

  // forward content-type header (usually image/png)
  const contentType =
    upstreamResponse.headers.get("content-type") || "application/octet-stream";
  res.type(contentType);
  res.set("Cache-Control", "public, max-age=31536000");
  recordAccess(rel);
  return res.send(buffer);
}) as Parameters<typeof router.get>[1]);

app.use(process.env.BASE_PATH ?? "/", router);

app.listen(PORT, () => {
  console.log(`DO maps proxy listening on http://0.0.0.0:${PORT}`);
});
