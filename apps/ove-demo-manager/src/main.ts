import cors from "cors";
import { z } from "zod";
import { execa } from "execa";
import express from "express";
import * as path from "node:path";
import cookieParser from "cookie-parser";
import promBundle from "express-prom-bundle";
import schedule, { Job } from "node-schedule";

import { env } from "./env";

const metricsMiddleware = promBundle({
  includeMethod: true,
  metricsPath: `${env._config.base_path ?? ""}/metrics`,
});

const AuthSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("authenticated"),
    role: z.string(),
  }),
  z.object({ status: z.literal("unauthenticated") }),
]);

const OK = 200;
const BAD_REQUEST = 400;
const ERROR = 500;
const CONFLICT = 409;

let switching = false;
let shutdownJob: Job | null = null;

const log = async <T>(x: T, isError = false) => {
  if (env._config.logging === "off") return;
  isError ? console.error(x) : console.log(x);
};

const updateRunning = async (running: string) => {
  env._config.running = running;
};

const scheduleDown = async () => {
  if (shutdownJob) {
    shutdownJob.cancel();
  }

  const trigger = new Date(Date.now() + env._config.timeout * 1000);

  shutdownJob = schedule.scheduleJob(trigger, async () => {
    await log(`Auto-shutdown triggered`);
    await downService();
    await updateRunning("");
  });

  await log(
    `Scheduled shutdown in ${env._config.timeout}s`
  );
};

const runCommand = async (command: string, cwd: string) => {
  const [cmd, ...args] = command.split(" ");
  return execa(cmd, args, { cwd });
};

const downService = async (): Promise<boolean> => {
  if (!env._config.running) return false;

  const route = env.routes[env._config.running];
  if (!route) return false;

  try {
    await log(`Stopping service: ${env._config.running}`);
    await runCommand(route.down, route.location);
    await updateRunning("");
    return true;
  } catch (e) {
    await log(e, true);
    return false;
  }
};

const upService = async (service: string): Promise<boolean> => {
  const route = env.routes[service];
  if (!route) return false;

  try {
    await log(`Starting service: ${service}`);
    await runCommand(route.up, route.location);

    if (route.healthcheck) {
      const start = Date.now();
      let healthy = false;

      while (
        Date.now() - start <
        env._config.healthcheck_timeout
        ) {
        try {
          const res = await fetch(route.healthcheck);
          const json = (await res.json()) as { status: string };

          if (json.status === "running") {
            healthy = true;
            break;
          }
        } catch {
          await log("Healthcheck retry...", true);
        }

        await new Promise((r) => setTimeout(r, 1000));
      }

      if (!healthy) {
        await log(`Healthcheck failed for ${service}`, true);
        return false;
      }
    }

    await updateRunning(service);
    return true;
  } catch (e) {
    await log(e, true);
    return false;
  }
};

const switchService = async (
  service: string
): Promise<boolean> => {
  if (switching) return false;

  if (!env.routes[service]) return false;

  switching = true;

  try {
    if (service === env._config.running) {
      await scheduleDown();
      return true;
    }

    await downService();

    const success = await upService(service);
    if (!success) return false;

    await scheduleDown();
    return true;
  } finally {
    switching = false;
  }
};

const app = express();

app.use(metricsMiddleware);
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const router = express.Router();

router.use(
  "/",
  express.static(
    env._config.publicDir ??
    path.join(__dirname, "..", "public")
  )
);

const authorize = (role: string) => role === "admin";

router.use(async (req, res, next) => {
  if (!env._config.auth) {
    next();
    return;
  }

  try {
    const response = await fetch(env._config.auth.server, {
      method: "POST",
      body: JSON.stringify(req.cookies),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env._config.auth.key}`,
      },
    });

    const data = AuthSchema.parse(await response.json());

    if (
      data.status !== "authenticated" ||
      !authorize(data.role)
    ) {
      res.sendStatus(403);
      return;
    }

    next();
  } catch (e) {
    console.error(e);
    res.sendStatus(401);
  }
});

router.get("/api", async (req, res) => {
  const header = req.header("X-Original-URI");

  if (!header) {
    return res.sendStatus(400);
  }

  let serviceName: string;

  try {
    const uri = new URL(header, "http://127.0.0.1");
    const parts = uri.pathname.split("/").filter(Boolean);

    if (parts.length === 0) {
      return res.sendStatus(400);
    }

    serviceName = parts[0];
  } catch {
    return res.sendStatus(400);
  }

  if (!config.routes[serviceName]) {
    return res.sendStatus(404);
  }

  if (serviceName === config._config.running) {
    await scheduleDown();
    return res.sendStatus(200);
  }

  const success = await switchService(serviceName);

  return res.sendStatus(success ? 200 : 500);
});

router.get("/status", (_req, res) => {
  res.json({ status: "running" });
});

router.get("/api/live", (_req, res) => {
  res.send(env._config.running);
});

router.get("/api/services", (_req, res) => {
  res.json(
    Object.fromEntries(
      Object.entries(env.routes).toSorted(
        ([a], [b]) => a.localeCompare(b)
      )
    )
  );
});

router.post(
  "/api/service/:serviceId",
  async (req, res) => {
    const service = req.params.serviceId;

    if (!service || !env.routes[service]) {
      res.sendStatus(BAD_REQUEST);
      return;
    }

    if (switching) {
      res.sendStatus(CONFLICT);
      return;
    }

    const success = await switchService(service);
    res.sendStatus(success ? OK : ERROR);
  }
);

router.delete(
  "/api/service/:serviceId",
  async (req, res) => {
    const service = req.params.serviceId;

    if (!service || service !== env._config.running) {
      res.sendStatus(BAD_REQUEST);
      return;
    }

    const success = await downService();
    res.sendStatus(success ? OK : ERROR);
  }
);

app.use(env._config.base_path ?? "/", router);

if (
  env._config.running &&
  env.routes[env._config.running]
) {
  log(
    `Service ${env._config.running} running on startup`
  ).catch();
  scheduleDown().catch();
}

process.on("SIGTERM", async () => {
  await log("SIGTERM received, shutting down...");
  await downService();
  process.exit(0);
});

app.listen(env._config.port, env._config.host, () => {
  log(
    `Serverless demo controller listening on port ${env._config.port}`
  ).catch();
});
