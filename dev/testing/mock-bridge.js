/* global Buffer */

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { z } from "zod";
import { io } from "socket.io-client";
import * as path from "path";
import * as fs from "fs";

const __dirname = /** @type{string} */ import.meta.dirname;

dotenv.config({ path: path.join(__dirname, ".env") });

const devices = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "devices.json")).toString(),
);
const geometry = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "geometry.json")).toString(),
);
const systemInfo = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "system-info.json")).toString(),
);
const screenshots = Array.from({ length: 8 })
  .slice(0, 2)
  .map((_x, i) =>
    Buffer.from(
      fs.readFileSync(
        path.join(__dirname, "data", "screens", `screen-${i + 1}.png`),
      ),
      "binary",
    ).toString("base64"),
  );

const state = {
  reconciliation: true,
  mode: "manual",
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

const error = {
  meta: {
    bridge: env.SERVICE_NAME,
  },
  response: { oveError: "ERROR" },
};

const getDevice = (deviceId) =>
  devices.find((device) => device.id === deviceId);

const mockHardwareWithCrashing = (single, success, filterFn = (_x) => true) => {
  const random = Math.random();
  if (random < 0.1 && single) {
    return {
      meta: {
        bridge: env.SERVICE_NAME,
      },
      response: { oveError: "This is a mocked error" },
    };
  } else if (random < 0.05) {
    return {
      meta: {
        bridge: env.SERVICE_NAME,
      },
      response: { oveError: "This is a mocked error" },
    };
  } else if (random < 0.1) {
    return {
      meta: {
        bridge: env.SERVICE_NAME,
      },
      response: devices.filter(filterFn).map((device) => ({
        deviceId: device.id,
        response:
          Math.random() < 0.5
            ? success(device)
            : { oveError: "This is a mocked error" },
      })),
    };
  } else {
    return {
      meta: {
        bridge: env.SERVICE_NAME,
      },
      response: single
        ? success()
        : devices.filter(filterFn).map((device) => ({
            deviceId: device.id,
            response: success(device),
          })),
    };
  }
};

let cookie = null;

const fetchCookie = async () => {
  try {
    const res = await fetch("http://localhost:3333/login", {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${encodeURIComponent(env.API_KEY)}`,
      },
    });
    cookie = res.headers.getSetCookie();
  } catch (e) {}
};

await fetchCookie();

const bridgeSocket = io(`${env.CORE_URL}/socket/bridge`, {
  auth: {
    username: env.SERVICE_NAME,
    password: env.API_KEY,
  },
  path: `/${env.CORE_API_VERSION}`,
  withCredentials: true,
  extraHeaders: {
    Cookie: cookie,
  },
});

bridgeSocket.on("connect", () => console.log("Bridge socket connected"));
bridgeSocket.on("connect_error", async (err) => {
  console.error(err.message);
  await fetchCookie();
  bridgeSocket.io.opts.extraHeaders.Cookie = cookie;
  bridgeSocket.disconnect().connect();
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

bridgeSocket.on("stopStreams", (args, callback) =>
  callback(mockHardwareWithCrashing(true, () => true)),
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
            subject: "Test Event",
            start: {
              dateTime: start.toISOString(),
            },
            end: {
              dateTime: end.toISOString(),
            },
          },
        ],
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
bridgeSocket.on("setAutoSchedule", (args, callback) => {
  state.mode = "auto";
  callback(mockHardwareWithCrashing(true, () => true));
});
bridgeSocket.on("setManualSchedule", (args, callback) => {
  state.mode = "manual";
  callback(mockHardwareWithCrashing(true, () => true));
});
bridgeSocket.on("setEcoSchedule", (args, callback) => {
  state.mode = "eco";
  callback(mockHardwareWithCrashing(true, () => true));
});

const hardwareSocket = io(`${env.CORE_URL}/socket/hardware`, {
  auth: {
    username: env.SERVICE_NAME,
    password: env.API_KEY,
  },
  path: `/${env.CORE_API_VERSION}`,
  withCredentials: true,
  extraHeaders: {
    Cookie: cookie,
  },
});

hardwareSocket.on("connect", () => console.log("Hardware socket connected"));
hardwareSocket.on("connect_error", async (err) => {
  console.error(err.message);
  await fetchCookie();
  hardwareSocket.io.opts.extraHeaders.Cookie = cookie;
  hardwareSocket.disconnect().connect();
});
hardwareSocket.onAny((event, args) =>
  console.log(`Hardware received ${event}`, args),
);

hardwareSocket.on("getWindowConfig", (args, callback) => {
  if (getDevice(args.deviceId).type !== "node") {
    callback(error);
    return;
  }
  callback(
    mockHardwareWithCrashing(true, () => ({
      0: "https://www.google.com",
      1: "https://www.google.com",
    })),
  );
});
hardwareSocket.on("getWindowConfigAll", (args, callback) =>
  callback(
    mockHardwareWithCrashing(
      false,
      () => ({
        0: "https://www.google.com",
        1: "https://www.google.com",
      }),
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
  const screenshotId = parseInt(
    geometry.displays
      .find(({ renderer: { deviceId } }) => deviceId === args.deviceId)
      .displayId.slice(-1),
  );
  callback(
    mockHardwareWithCrashing(true, () => [screenshots[screenshotId % 2]]),
  );
});
hardwareSocket.on("screenshotAll", (args, callback) =>
  callback(
    mockHardwareWithCrashing(false, (device) => [
      screenshots[
        parseInt(
          geometry.displays
            .find(({ renderer: { deviceId } }) => deviceId === device.id)
            .displayId.slice(-1),
        ) % 2
      ],
    ]),
    (device) => device.type === "node",
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
    (device) => device.type === "mdc",
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
      device.type !== "node" ? systemInfo[device.type] : systemInfo[args.type],
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

const app = express();

const port = env.PORT;

app.use(bodyParser.json());
app.use(cors());

app.use(
  express.static(path.join(__dirname, "..", "services", "static", "public")),
);

app.listen(port, () => {
  console.log(`Mock bridge listening on port ${port}`);
});
