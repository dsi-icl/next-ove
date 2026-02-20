import express from "express";
import jwt from "jsonwebtoken";
import * as path from "node:path";
import cookieParser from "cookie-parser";
import {
  S3Client,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { env } from "./env";
import { Readable } from "stream";

const app = express();
app.use(express.json());
app.use(cookieParser());

const s3 = new S3Client({
  endpoint: env.S3.ENDPOINT,
  credentials: {
    accessKeyId: env.S3.ACCESS_KEY,
    secretAccessKey: env.S3.SECRET_KEY,
  },
  forcePathStyle: true, // required for MinIO
});

/**
 * Create a short-lived magic link for a prefix (e.g. dzi folder)
 */
app.post("/generate-link", (req, res) => {
  const { prefix, bucket, expiresInSeconds = 300 } = req.body as { prefix: string; bucket: string; expiresInSeconds?: number };

  if (!prefix || !bucket) {
    res.status(400).json({ error: "prefix and bucket is required" });
    return
  }

  const token = jwt.sign({ prefix, bucket }, env.COOKIE.JWT_SECRET, {
    expiresIn: expiresInSeconds,
  });

  const link = `/auth?token=${token}&redirect=${encodeURIComponent(
    `/content/${bucket}/${prefix}`
  )}`;

  res.json({ link });
});

/**
 * Magic link endpoint
 * Sets secure HTTP-only cookie then redirects
 */
app.get("/auth", (req, res) => {
  const { token, redirect } = req.query;

  if (!token || typeof token !== "string") {
    res.status(400).send("Missing token");
    return;
  }

  try {
    const payload = jwt.verify(token, env.COOKIE.JWT_SECRET) as { prefix: string; bucket: string; };

    const sessionToken = jwt.sign(
      { prefix: payload.prefix, bucket: payload.bucket },
      env.COOKIE.JWT_SECRET,
      { expiresIn: env.COOKIE.EXPIRY } as jwt.SignOptions,
    );

    res.cookie(env.COOKIE.ID, sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      domain: env.COOKIE.DOMAIN,
      path: "/content",
    });

    res.redirect(typeof redirect === "string" ? redirect : "/");
  } catch {
    res.status(401).send("Invalid or expired token");
    return;
  }
});

/**
 * Normalize S3 key safely
 */
function normalizeKey(key: string): string {
  const normalized = path.posix.normalize(key);
  if (normalized.startsWith("..")) {
    throw new Error("Path traversal attempt");
  }
  return normalized;
}

/**
 * Streaming proxy for ALL buckets
 * Route format:
 * /content/:bucket/*
 */
app.get("/content/:bucket/*", async (req, res) => {
  const token = req.cookies.access_token;
  if (!token) {
    res.status(401).send("Unauthorized");
    return;
  }

  let payload: { bucket: string; prefix: string; };
  try {
    payload = jwt.verify(token, env.COOKIE.JWT_SECRET) as typeof payload;
  } catch {
    res.status(401).send("Invalid session");
    return;
  }

  const { bucket } = req.params;
  const requestedKeyRaw = (req.params as unknown as string[])[0] || "";
  let requestedKey: string;

  try {
    requestedKey = normalizeKey(requestedKeyRaw);
  } catch {
    res.status(400).send("Invalid path");
    return;
  }

  // Enforce bucket restriction
  if (bucket !== payload.bucket) {
    res.status(403).send("Forbidden bucket");
    return;
  }

  // Enforce prefix restriction if defined
  if (payload.prefix && !requestedKey.startsWith(payload.prefix)) {
    res.status(403).send("Forbidden key");
    return;
  }

  try {
    const range = req.headers.range;

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: requestedKey,
      Range: range,
    });

    const response = await s3.send(command);

    if (response.ContentType) {
      res.setHeader("Content-Type", response.ContentType);
    }

    if (response.ContentLength) {
      res.setHeader("Content-Length", response.ContentLength.toString());
    }

    if (response.ContentRange) {
      res.setHeader("Content-Range", response.ContentRange);
      res.status(206);
    }

    if (response.ETag) {
      res.setHeader("ETag", response.ETag);
    }

    if (response.LastModified) {
      res.setHeader("Last-Modified", response.LastModified.toUTCString());
    }

    const bodyStream = response.Body as Readable;
    bodyStream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(404).send("Not found");
  }
});

app.listen(env.PORT, () => {
  console.log("Proxy running on http://localhost:3000");
});