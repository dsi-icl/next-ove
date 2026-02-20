# MDC TCP Control

A lightweight TypeScript library for controlling MDC-compatible displays
(e.g. Samsung professional displays) over TCP.

This library implements the MDC (Multiple Display Control) protocol over
port `1515`, providing simple async functions to control power, volume,
input source, mute state, and retrieve device information.

## Features

- Power control (`on`, `off`, `reboot`)
- Volume control
- Mute control
- Input/source switching
- Device status and info retrieval
- Per-device command locking (prevents concurrent command collisions)
- Timeout and abort support
- Fully typed with TypeScript

## Installation

```bash
npm install @your-scope/mdc-tcp
```

## Requirements

- Node.js (uses the built-in `net` module)
- TypeScript (recommended)
- A network-accessible MDC-compatible display

Default MDC TCP port: `1515`

---

## Quick Start

```ts
import {
  getStatus,
  setPower,
  setVolume,
  setIsMute,
  setSource,
  getInfo,
  sources,
} from "@your-scope/mdc-tcp";

const deviceId = "display-1";

const args = {
  id: 0x01,           // MDC display ID
  host: "192.168.1.50",
  timeout: 3000,
};

async function run() {
  await setPower(deviceId, args, "on");

  await setVolume(deviceId, args, 30);

  await setIsMute(deviceId, args, false);

  await setSource(deviceId, args, sources.HDMI1);

  const info = await getInfo(deviceId, args);
  console.log(info);
}

run().catch(console.error);
```

---

## API

### `getStatus(deviceId, args)`

Returns the current power state.

```ts
getStatus(
  deviceId
:
string,
  args
:
CommandArgs,
):
Promise<"on" | "off">
```

---

### `setPower(deviceId, args, state)`

Sets the power state.

```ts
setPower(
  deviceId
:
string,
  args
:
CommandArgs,
  state
:
"on" | "off" | "reboot",
):
Promise<boolean>
```

Returns `true` if the device acknowledged the requested state.

---

### `setVolume(deviceId, args, volume)`

Sets the volume (0–100 depending on display model).

```ts
setVolume(
  deviceId
:
string,
  args
:
CommandArgs,
  volume
:
number,
):
Promise<boolean>
```

---

### `setIsMute(deviceId, args, state)`

Enables or disables mute.

```ts
setIsMute(
  deviceId
:
string,
  args
:
CommandArgs,
  state
:
boolean,
):
Promise<boolean>
```

---

### `setSource(deviceId, args, source)`

Switches the input source.

```ts
setSource(
  deviceId
:
string,
  args
:
CommandArgs,
  source
:
MDCSource[keyof
MDCSource
],
):
Promise<boolean>
```

Available sources:

```ts
import { sources } from "@your-scope/mdc-tcp";

sources.HDMI1;
sources.HDMI2;
sources.DP;
sources.TV;
// etc.
```

---

### `getInfo(deviceId, args)`

Retrieves combined device information.

```ts
getInfo(
  deviceId
:
string,
  args
:
CommandArgs,
):
Promise<MDCInfo>
```

Returns:

```TS
{
  power: "on" | "off";
  volume: number;
  isMuted: boolean;
  source: keyof
  typeof sources;
}
```

---

## Command Arguments

All commands require a `CommandArgs` object:

```ts
type CommandArgs = {
  id: number;            // MDC display ID
  host: string;          // Device IP or hostname
  port?: number;         // Optional (default: 1515)
  timeout: number;       // Timeout in ms
  ac?: AbortController;  // Optional cancellation support
};
```

Example with abort support:

```ts
const ac = new AbortController();

setPower("display-1", { ...args, ac }, "on");

// Cancel if needed
ac.abort();
```

---

## Concurrency Handling

The library automatically serializes commands per `deviceId`.

This prevents overlapping TCP commands from being sent to the same device,
which can otherwise cause protocol errors.

Different `deviceId` values operate independently.

---

## Error Handling

Commands may reject with:

- `"TIMEOUT"` — device did not respond in time
- Socket errors (e.g. `ECONNREFUSED`)
- `"Received error: X"` — device returned an MDC error code
- Validation errors (e.g. malformed responses)

Always wrap calls in `try/catch`:

```ts
try {
  await setPower(deviceId, args, "on");
} catch (err) {
  console.error("Failed to set power:", err);
}
```

---

## Notes

- Ensure MDC over TCP is enabled on the display.
- Confirm the correct display ID is configured on the device.
- Some models may support only a subset of sources.
- Volume range depends on display firmware.

---
