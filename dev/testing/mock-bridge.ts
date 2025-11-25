/* global Buffer */

import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import * as fs from "fs";
import * as path from "path";
import { io } from "socket.io-client";
import { z } from "zod";
import type { Bounds, Device } from "@ove/ove-types";

dotenv.config({ path: path.join(import.meta.dirname, ".env") });

const devices = JSON.parse(
  fs
    .readFileSync(path.join(import.meta.dirname, "data", "devices.json"))
    .toString(),
) as Device[];
const geometry = JSON.parse(
  fs
    .readFileSync(path.join(import.meta.dirname, "data", "geometry.json"))
    .toString(),
) as Bounds;
const systemInfo = JSON.parse(
  fs
    .readFileSync(path.join(import.meta.dirname, "data", "system-info.json"))
    .toString(),
) as Record<string, unknown>;
const screenshots = Array.from({ length: 8 })
  .slice(0, 2)
  .map((_x, i) =>
    Buffer.from(
      // @ts-expect-error - TS2345: Argument of type 'string | Buffer' is not assignable to parameter of type 'string | Uint8Array'. Type 'Buffer' is not assignable to type 'string | Uint8Array'.
      fs.readFileSync(
        path.join(
          import.meta.dirname,
          "data",
          "screens",
          `screen-${i + 1}.png`,
        ),
      ),
      "binary",
    ).toString("base64"),
  );

const browserConfigs = new Map(
  devices.map((device) => [
    device.id,
    ["https://www.google.com", "https://www.google.com"],
  ]),
);

const state = {
  reconciliation: true,
  mode: "manual",
  schedule: {
    wake: null,
    sleep: null,
    schedule: [false, false, false, false, false, false, false],
  },
  streamStatus: false,
};

const env = z
  .object({
    CORE_URL: z.string(),
    SERVICE_NAME: z.string(),
    API_KEY: z.string(),
    CORE_API_VERSION: z.string(),
    PORT: z.coerce.number(),
  })
  .parse(process.env);

const error = { status: "error", error: "This is a mocked error" };

const getDevice = (deviceId: string): Device => {
  const device = devices.find((device) => device.id === deviceId);
  if (device === undefined) throw new Error(`Device ${deviceId} not found`);
  return device;
};

const mockHardwareWithCrashing = <T>(
  single: boolean,
  success: (device?: Device) => T,
  filterFn = (_x: Device) => true,
) => {
  const random = Math.random();
  if (random < 0.1 && single) {
    return error;
  } else if (random < 0.05) {
    return error;
  } else if (random < 0.1) {
    return {
      status: "success",
      data: devices.filter(filterFn).map((device) => ({
        deviceId: device.id,
        response:
          Math.random() < 0.5
            ? { status: "success", data: success(device) }
            : error,
      })),
    };
  } else {
    return {
      status: "success",
      data: single
        ? success()
        : devices.filter(filterFn).map((device) => ({
            deviceId: device.id,
            response: { status: "success", data: success(device) },
          })),
    };
  }
};

let cookie: string[] | null = null;

const fetchCookie = async () => {
  try {
    cookie = (await fetch(`${env.CORE_URL}/api/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${encodeURIComponent(env.API_KEY)}`,
      },
    })).headers.getSetCookie();
  } catch (_e) {}
};

await fetchCookie();

const initBridgeSocket = () => {
  return io(`${env.CORE_URL}/socket/bridge`, {
    auth: {
      username: env.SERVICE_NAME,
      password: env.API_KEY,
    },
    path: `/${env.CORE_API_VERSION}`,
    withCredentials: true,
    extraHeaders: {
      Cookie: (cookie as string | null) ?? "",
    },
  });
};

let bridgeSocket = initBridgeSocket();

bridgeSocket.on("connect", () => console.log("Bridge socket connected"));
bridgeSocket.on("connect_error", async (err) => {
  console.error(err.message);
  bridgeSocket.disconnect();
  bridgeSocket = initBridgeSocket();
});
bridgeSocket.onAny((event, args) =>
  console.log(`Bridge socket received ${event}`, args),
);

bridgeSocket.on("getGeometry", (args, callback) =>
  callback(mockHardwareWithCrashing(true, () => geometry)),
);

bridgeSocket.on("getDevices", (args, callback) =>
  callback(mockHardwareWithCrashing(true, () => devices)),
);

bridgeSocket.on("getStreams", (args, callback) =>
  callback(
    mockHardwareWithCrashing(true, () => [
      `http://localhost:${env.PORT}/CAMERA1.html`,
      `http://localhost:${env.PORT}/CAMERA2.html`,
    ]),
  ),
);

bridgeSocket.on("getNextScheduled", (args, callback) =>
  callback(
    mockHardwareWithCrashing(true, () => ({
      nextStart: "2025-11-14T09:30:00.000Z",
      nextStop: "2025-11-14T14:00:00.000Z",
    })),
  ),
);

bridgeSocket.on("getReconciliation", (args, callback) =>
  callback(mockHardwareWithCrashing(true, () => state.reconciliation)),
);

bridgeSocket.on("stopReconciliation", (args, callback) => {
  state.reconciliation = false;
  callback(mockHardwareWithCrashing(true, () => true));
});

bridgeSocket.on("startReconciliation", (args, callback) => {
  state.reconciliation = true;
  callback(mockHardwareWithCrashing(true, () => true));
});

bridgeSocket.on("stopStreams", (args, callback) => {
  state.streamStatus = false;
  callback(mockHardwareWithCrashing(true, () => true));
});

bridgeSocket.on("startStreams", (args, callback) => {
  state.streamStatus = true;
  callback(mockHardwareWithCrashing(true, () => true));
});

bridgeSocket.on("getStreamStatus", (args, callback) =>
  callback(mockHardwareWithCrashing(true, () => state.streamStatus)),
);

bridgeSocket.on("getCalendar", (args, callback) =>
  callback(
    mockHardwareWithCrashing(true, () => {
      const start = new Date();
      const end = new Date();
      start.setHours(10);
      end.setHours(11);
      return {
        value: [
          {
            title: "Test Event",
            start: start.toISOString(),
            end: end.toISOString(),
          },
        ],
        lastUpdated: new Date().toISOString(),
      };
    }),
  ),
);

bridgeSocket.on("getMode", (args, callback) =>
  callback(mockHardwareWithCrashing(true, () => state.mode)),
);
bridgeSocket.on("setMode", (args, callback) => {
  state.mode = args.mode;
  callback(mockHardwareWithCrashing(true, () => true));
});
bridgeSocket.on("getAutoSchedule", (args, callback) =>
  callback(mockHardwareWithCrashing(true, () => state.schedule)),
);
bridgeSocket.on("setAutoSchedule", (args, callback) => {
  state.schedule = args.autoSchedule;
  callback(mockHardwareWithCrashing(true, () => undefined));
});

const initHardwareSocket = () => {
  return io(`${env.CORE_URL}/socket/hardware`, {
    auth: {
      username: env.SERVICE_NAME,
      password: env.API_KEY,
    },
    path: `/${env.CORE_API_VERSION}`,
    withCredentials: true,
    extraHeaders: {
      Cookie: (cookie as string | null) ?? "",
    },
  });
};

let hardwareSocket = initHardwareSocket();

hardwareSocket.on("connect", () => console.log("Hardware socket connected"));
hardwareSocket.on("connect_error", async (err) => {
  console.error(err.message);
  hardwareSocket.disconnect();
  hardwareSocket = initHardwareSocket();
});
hardwareSocket.onAny((event, args) =>
  console.log(`Hardware received ${event}`, args),
);

hardwareSocket.on("setBrowserConfig", (args, callback) => {
  if (getDevice(args.deviceId).type !== "node") {
    callback(error);
    return;
  }
  browserConfigs.set(args.deviceId, args.config);
  callback(mockHardwareWithCrashing(true, () => true));
});
hardwareSocket.on("getBrowserConfig", (args, callback) => {
  if (getDevice(args.deviceId).type !== "node") {
    callback(error);
    return;
  }
  callback(
    mockHardwareWithCrashing(true, () => browserConfigs.get(args.deviceId)),
  );
});
hardwareSocket.on("getBrowserConfigAll", (args, callback) =>
  callback(
    mockHardwareWithCrashing(
      false,
      () => Array.from(browserConfigs.values()),
      (device) => device.type === "node",
    ),
  ),
);

hardwareSocket.on("getBrowsers", (args, callback) => {
  if (getDevice(args.deviceId).type !== "node") {
    callback(error);
    return;
  }
  callback(
    mockHardwareWithCrashing(
      true,
      () => ({
        1: { displayId: 1, url: "https://www.google.com" },
        2: { displayId: 2, url: "https://www.bbc.co.uk" },
      }),
      (device) => device.type === "node",
    ),
  );
});
hardwareSocket.on("getBrowsersAll", (args, callback) =>
  callback(
    mockHardwareWithCrashing(
      false,
      () => ({
        1: { displayId: 1, url: "https://www.google.com" },
        2: { displayId: 2, url: "https://www.bbc.co.uk" },
      }),
      (device) => device.type === "node",
    ),
  ),
);

hardwareSocket.on("getStatus", (args, callback) =>
  callback(mockHardwareWithCrashing(true, () => "on")),
);
hardwareSocket.on("getStatusAll", (args, callback) =>
  callback(mockHardwareWithCrashing(false, () => "on")),
);

hardwareSocket.on("screenshot", (args, callback) => {
  if (getDevice(args.deviceId).type !== "node") {
    callback(error);
    return;
  }
  const screenshotId =
    geometry.displays.find(({ deviceId }) => deviceId === args.deviceId)
      ?.displayId ?? -1;
  callback(
    mockHardwareWithCrashing(true, () => [screenshots[screenshotId % 2]]),
  );
});
hardwareSocket.on("screenshotAll", (args, callback) =>
  callback(
    mockHardwareWithCrashing(false, (device) => [
      screenshots[
        (geometry.displays.find(
          ({ deviceId }) => deviceId === (device?.id ?? ""),
        )?.displayId ?? -1) % 2
      ],
    ]),
    (device: Device) => device.type === "node",
  ),
);

hardwareSocket.on("setVolume", (args, callback) => {
  if (getDevice(args.deviceId).type !== "mdc") {
    callback(error);
    return;
  }
  callback(true, () => true);
});
hardwareSocket.on("setVolumeAll", (args, callback) =>
  callback(
    false,
    () => true,
    (device: Device) => device.type === "mdc",
  ),
);

hardwareSocket.on("getInfo", (args, callback) => {
  if (getDevice(args.deviceId).type !== "node") {
    callback(
      mockHardwareWithCrashing(
        true,
        () => systemInfo[getDevice(args.deviceId).type],
      ),
    );
    return;
  }
  if (!args.type) {
    args.type = "general";
  }
  callback(mockHardwareWithCrashing(true, () => systemInfo[args.type]));
});
hardwareSocket.on("getInfoAll", (args, callback) => {
  if (!args.type) {
    args.type = "general";
  }
  callback(
    mockHardwareWithCrashing(false, (device) =>
      device !== undefined && device.type !== "node"
        ? systemInfo[device.type]
        : systemInfo[args.type],
    ),
  );
});

hardwareSocket.on("execute", (args, callback) => {
  if (getDevice(args.deviceId).type !== "node") {
    callback(error);
    return;
  }
  callback(mockHardwareWithCrashing(true, () => ({ response: "hello world" })));
});
hardwareSocket.on("executeAll", (args, callback) =>
  callback(
    mockHardwareWithCrashing(
      false,
      () => ({ response: "hello world" }),
      (device) => device.type === "node",
    ),
  ),
);

hardwareSocket.on("start", (args, callback) =>
  callback(mockHardwareWithCrashing(true, () => true)),
);
hardwareSocket.on("startAll", (args, callback) =>
  callback(mockHardwareWithCrashing(false, () => true)),
);

hardwareSocket.on("shutdown", (args, callback) =>
  callback(mockHardwareWithCrashing(true, () => true)),
);
hardwareSocket.on("shutdownAll", (args, callback) =>
  callback(mockHardwareWithCrashing(false, () => true)),
);

hardwareSocket.on("reboot", (args, callback) =>
  callback(mockHardwareWithCrashing(true, () => true)),
);
hardwareSocket.on("rebootAll", (args, callback) =>
  callback(mockHardwareWithCrashing(false, () => true)),
);

hardwareSocket.on("mute", (args, callback) => {
  if (getDevice(args.deviceId).type === "node") {
    callback(error);
    return;
  }
  callback(mockHardwareWithCrashing(true, () => true));
});
hardwareSocket.on("muteAll", (args, callback) =>
  callback(
    mockHardwareWithCrashing(
      false,
      () => true,
      (device) => device.type !== "node",
    ),
  ),
);

hardwareSocket.on("unmute", (args, callback) => {
  if (getDevice(args.deviceId).type === "node") {
    callback(error);
    return;
  }
  callback(mockHardwareWithCrashing(true, () => true));
});
hardwareSocket.on("unmuteAll", (args, callback) =>
  callback(
    mockHardwareWithCrashing(
      false,
      () => true,
      (device) => device.type !== "node",
    ),
  ),
);

hardwareSocket.on("muteAudio", (args, callback) => {
  if (getDevice(args.deviceId).type !== "pjlink") {
    callback(error);
    return;
  }
  callback(mockHardwareWithCrashing(true, () => true));
});
hardwareSocket.on("muteAudioAll", (args, callback) =>
  callback(
    mockHardwareWithCrashing(
      false,
      () => true,
      (device) => device.type === "pjlink",
    ),
  ),
);

hardwareSocket.on("unmuteAudio", (args, callback) => {
  if (getDevice(args.deviceId).type !== "pjlink") {
    callback(error);
    return;
  }
  callback(mockHardwareWithCrashing(true, () => true));
});
hardwareSocket.on("unmuteAudioAll", (args, callback) =>
  callback(
    mockHardwareWithCrashing(
      false,
      () => true,
      (device) => device.type === "pjlink",
    ),
  ),
);

hardwareSocket.on("muteVideo", (args, callback) => {
  if (getDevice(args.deviceId).type !== "pjlink") {
    callback(error);
    return;
  }
  callback(mockHardwareWithCrashing(true, () => true));
});
hardwareSocket.on("muteVideoAll", (args, callback) =>
  callback(
    mockHardwareWithCrashing(
      false,
      () => true,
      (device) => device.type === "pjlink",
    ),
  ),
);

hardwareSocket.on("unmuteVideo", (args, callback) => {
  if (getDevice(args.deviceId).type !== "pjlink") {
    callback(error);
    return;
  }
  callback(mockHardwareWithCrashing(true, () => true));
});
hardwareSocket.on("unmuteVideoAll", (args, callback) =>
  callback(
    mockHardwareWithCrashing(
      false,
      () => true,
      (device) => device.type === "pjlink",
    ),
  ),
);

hardwareSocket.on("openBrowsers", (args, callback) => {
  if (getDevice(args.deviceId).type !== "node") {
    callback(error);
    return;
  }
  callback(mockHardwareWithCrashing(true, () => true));
});
hardwareSocket.on("openBrowsersAll", (args, callback) =>
  callback(
    mockHardwareWithCrashing(
      false,
      () => true,
      (device) => device.type === "node",
    ),
  ),
);

hardwareSocket.on("closeBrowsers", (args, callback) => {
  if (getDevice(args.deviceId).type !== "node") {
    callback(error);
    return;
  }
  callback(mockHardwareWithCrashing(true, () => true));
});
hardwareSocket.on("closeBrowsersAll", (args, callback) =>
  callback(
    mockHardwareWithCrashing(
      false,
      () => true,
      (device) => device.type === "node",
    ),
  ),
);

hardwareSocket.on("reloadBrowsers", (args, callback) => {
  if (getDevice(args.deviceId).type !== "node") {
    callback(error);
    return;
  }
  callback(mockHardwareWithCrashing(true, () => true));
});
hardwareSocket.on("reloadBrowsersAll", (args, callback) =>
  callback(
    mockHardwareWithCrashing(
      false,
      () => true,
      (device) => device.type === "node",
    ),
  ),
);

hardwareSocket.on("getLiveUpdate", (args, callback) => {
  const device = getDevice(args.deviceId);
  switch (device.type) {
    case "node": {
      callback(
        mockHardwareWithCrashing(true, () => ({
          type: "node",
          status: "on",
          browsers: {
            "1": { url: "https://www.google.com", displayId: 0 },
            "2": { url: "https://www.bbc.co.uk", displayId: 1 },
          },
          browserConfigs: browserConfigs.get(args.deviceId),
          screenshots,
        })),
      );
      break;
    }
    case "mdc": {
      callback(
        mockHardwareWithCrashing(true, () => ({
          type: "mdc",
          status: "on",
        })),
      );
      break;
    }
    case "pjlink": {
      callback(
        mockHardwareWithCrashing(true, () => ({
          type: "pjlink",
          status: "on",
        })),
      );
      break;
    }
  }
});

const app = express();

const port = env.PORT;

app.use(bodyParser.json());
app.use(cors());

app.use(
  express.static(
    path.join(import.meta.dirname, "..", "services", "static", "public"),
  ),
);

app.listen(port, () => {
  console.log(`Mock bridge listening on port ${port}`);
});
