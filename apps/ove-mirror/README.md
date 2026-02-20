# ove-mirror

Capture user interactions in a controller context and replay them in one or
more mirrored views. This extension is designed to be loaded at runtime into a
managed Electron renderer inside the **Data Observatory**, where it enables
deterministic, synchronized interaction across multiple views.

---

## Overview

`ove-mirror` is a Chrome Extension (Manifest V3) that:

- Captures trusted user interactions (`click`, `wheel`, `keydown`, `keyup`)
- Serializes them into structured messages
- Propagates them across frames and windows
- Replays them in mirrored views
- Synchronizes `Math.random` using a seeded RNG for deterministic behavior

It is intended for controlled, reproducible interaction environments such as
the **Data Observatory**, where multiple renderer instances must stay in sync.

---

## Architecture

### 1. Deterministic Randomness

At `document_start`, the extension injects a seed hook that overrides
`Math.random` globally using `seedrandom`:

```ts
const SEED = "ove-mirror";

export const syncRandom = () => {
  window.originalRandom = Math.random;
  seedrandom(SEED, { global: true });
};
```

This ensures:

- Deterministic layout behavior
- Consistent animation randomness
- Reproducible UI states across mirrored instances

---

### 2. Event Capture

User interactions are captured only if they are trusted:

```ts
if (!e.isTrusted) return;
```

Captured events:

- `click`
- `wheel`
- `keydown`
- `keyup`

Each event is serialized into a message:

```ts
type Message = {
  selector?: string;
  type: string;
  button?: number;
  deltaX?: number;
  deltaY?: number;
  key?: string;
  code?: string;
  ts: number;
  location: string;
  frames: string[];
  id: string;
};
```

Selectors are generated using a deterministic DOM path algorithm
(`getUniqueSelector`) that:

- Uses `id` when available
- Falls back to `:nth-of-type`
- Builds a full CSS selector chain

---

### 3. Cross-Frame Propagation

The extension:

- Injects into **all frames**
- Tracks iframe ancestry
- Reconstructs frame paths using CSS selectors
- Uses `postMessage` to propagate events up and down the frame tree

Message flow:

- `next-ove:up` → bubble to parent
- `next-ove:down` → replay to children

---

### 4. Event Replay

Events are reconstructed and dispatched:

- `MouseEvent("click")`
- `KeyboardEvent("keydown" | "keyup")`
- `window.scrollBy()` for wheel

Replay is skipped if:

- The message originates from the same `id`
- The `location` does not match

---

## Manifest Configuration

The extension uses Manifest V3:

```json
{
  "manifest_version": 3,
  "name": "next-ove mirror",
  "version": "1.0",
  "permissions": ["scripting", "tabs", "storage"],
  "host_permissions": ["<all_urls>"],
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_idle",
      "all_frames": true,
      "world": "MAIN",
      "match_about_blank": true
    },
    {
      "matches": ["<all_urls>"],
      "js": ["seed-hook.js"],
      "run_at": "document_start",
      "all_frames": true,
      "world": "MAIN",
      "match_about_blank": true
    }
  ]
}
```

Key points:

- Injected into **all URLs**
- Injected into **all frames**
- Runs in the **MAIN world**
- Seed synchronization runs at `document_start`
- Event capture runs at `document_idle`

---

# Installation (Chrome – From Local Files)

## 1. Build the Extension

If using TypeScript, build to JavaScript:

```bash
npm install
npm run build
```

Ensure the build output contains:

- `manifest.json`
- `content.js`
- `seed-hook.js`

All files must reside in the same directory.

---

## 2. Load Unpacked Extension in Chrome

1. Open Chrome
2. Navigate to:

```
chrome://extensions
```

3. Enable **Developer mode** (top right)
4. Click **Load unpacked**
5. Select the directory containing:
    - `manifest.json`
    - Compiled JS files

The extension should now appear as:

```
next-ove mirror (1.0)
```

---

## 3. Verify Injection

Open DevTools on any page and check:

- `window.originalRandom` exists
- `Math.random()` is deterministic
- Event listeners are active

---

# Runtime Loading in the Data Observatory

## Context

The extension is not intended for general browsing use.

It is dynamically loaded into a **managed Electron renderer**
within the **Data Observatory** environment.

### How It Is Used

1. The Data Observatory launches Electron.
2. A controlled renderer loads web content.
3. The Chrome extension is injected at runtime.
4. One instance acts as the **controller**.
5. Other instances act as **mirrored views**.

The extension:

- Captures events in the controller renderer
- Broadcasts via `postMessage`
- Replays events in other renderers
- Maintains deterministic randomness across instances

---

## Electron Integration Notes

When used inside Electron:

- The renderer must allow extension loading.
- Extensions can be loaded programmatically:

```ts
session.defaultSession.loadExtension(pathToExtension);
```

- The environment must permit:
    - `postMessage` communication
    - Frame traversal
    - Content script execution in the main world

The Data Observatory manages:

- Renderer lifecycle
- Section identity (`id`)
- Optional `sectionId`
- Inter-view messaging topology

---

# Security Considerations

- Injected into `<all_urls>`
- Runs in the `MAIN` world (has access to page JS context)
- Captures real user interactions only (`isTrusted`)
- Should only be deployed in controlled environments

Do not distribute publicly without review.

---

# Limitations

- Selector strategy may fail for highly dynamic DOMs
- Shadow DOM is not explicitly handled
- Wheel replay uses `window.scrollBy`, not target element scroll
- Does not synchronize:
    - Focus changes outside key events
    - Input value mutation without keyboard interaction
    - Pointer events beyond click

---

# Intended Use

This extension is designed specifically for:

- Data Observatory deployments
- Multi-view mirrored research displays
- Deterministic interaction replay
- Controlled exhibition environments

It is not intended as a consumer-facing extension.

---

# Summary

`next-ove mirror` provides:

- Deterministic randomness
- Full-frame event capture
- Cross-frame propagation
- Structured replay
- Runtime injection into managed Electron renderers
- Synchronization within the Data Observatory space

For questions about integration inside the Data Observatory runtime, refer to
the Electron host application configuration.