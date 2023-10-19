import { create } from "zustand";
import { InfoTypes } from "./utils";
import { Json } from "@ove/ove-utils";
import { ScreenshotMethod, type Tokens } from "@ove/ove-types";
import { DeviceAction } from "./pages/hardware/types";

type BrowserStatus = "running" | "off" | null

type Store = {
  tokens: Tokens | null
  setTokens: (tokens: Tokens | null) => void
  hardwareConfig: {
    deviceAction: DeviceAction
    setDeviceAction: (deviceAction: DeviceAction) => void
    info: { data: object, type: InfoTypes } | {
      data: object[],
      type: InfoTypes
    } | null
    setInfo: (info: { data: object, type: InfoTypes } | {
      data: object[],
      type: InfoTypes
    } | null) => void
    command: string | null
    setCommand: (command: string | null) => void
    clearCommand: () => void
    commandHistory: string[]
    addCommandHistory: (line: string) => void
    clearCommandHistory: () => void
    paginationIdx: number
    setPaginationIdx: (paginationIdx: number) => void
    screenshotConfig: { method: ScreenshotMethod, screens: number[] } | null
    setScreenshotConfig: (screenshotConfig: {
      method: ScreenshotMethod,
      screens: number[]
    }) => void
    clearScreenshotConfig: () => void
    screenshots: string[] | { response: string[], deviceId: string }[] | null
    setScreenshots: (screenshots: string[] | {
      response: string[],
      deviceId: string
    }[]) => void
    clearScreenshots: () => void
    browserId: number | null
    setBrowserId: (browserId: number) => void
    clearBrowserId: () => void
    browserStatus: BrowserStatus | {
      response: BrowserStatus,
      deviceId: string
    }[]
    setBrowserStatus: (status: BrowserStatus | {
      response: BrowserStatus,
      deviceId: string
    }[]) => void
    browserConfig: { url?: string, displayId?: number } | null
    setBrowserConfig: (config: {url?: string, displayId?: number}) => void
    reset: () => void
  }
}

const getCurrentTokens = () => {
  const stored = localStorage.getItem("tokens");
  if (stored === null) return null;
  return Json.parse<Tokens>(stored);
};

export const useStore = create<Store>(set => ({
  tokens: getCurrentTokens(),
  setTokens: (tokens: Tokens | null) => tokens === null ? set({ tokens: null }) : set({ tokens: { ...tokens } }),
  hardwareConfig: {
    info: null,
    setInfo: info => set(state => ({
      hardwareConfig: {
        ...state.hardwareConfig,
        info
      }
    })),
    paginationIdx: 0,
    setPaginationIdx: paginationIdx => set(state => ({
      hardwareConfig: {
        ...state.hardwareConfig,
        paginationIdx
      }
    })),
    command: null,
    setCommand: command => set(state => ({
      hardwareConfig: {
        ...state.hardwareConfig,
        command
      }
    })),
    commandHistory: [],
    addCommandHistory: line => set(state => ({
      hardwareConfig: {
        ...state.hardwareConfig,
        commandHistory: [line, ...state.hardwareConfig.commandHistory]
      }
    })),
    clearCommandHistory: () => set(state => ({
      hardwareConfig: {
        ...state.hardwareConfig,
        commandHistory: []
      }
    })),
    reset: () => set(state => ({
      hardwareConfig: {
        ...state.hardwareConfig,
        info: null,
        paginationIdx: 0,
        command: null,
        commandHistory: [],
        screenshotConfig: null,
        screenshots: null,
        browserId: null,
        browserStatus: null,
        browserConfig: null
      }
    })),
    clearCommand: () => set(state => ({
      hardwareConfig: {
        ...state.hardwareConfig,
        command: null
      }
    })),
    deviceAction: {
      bridgeId: null,
      action: null,
      deviceId: null,
      pending: false
    },
    setDeviceAction: deviceAction => set(state => ({
      hardwareConfig: {
        ...state.hardwareConfig,
        deviceAction
      }
    })),
    screenshotConfig: null,
    setScreenshotConfig: screenshotConfig => set(state => ({
      hardwareConfig: {
        ...state.hardwareConfig,
        screenshotConfig
      }
    })),
    clearScreenshotConfig: () => set(state => ({
      hardwareConfig: {
        ...state.hardwareConfig,
        screenshotConfig: null
      }
    })),
    screenshots: null,
    setScreenshots: screenshots => set(state => ({
      hardwareConfig: {
        ...state.hardwareConfig,
        screenshots
      }
    })),
    clearScreenshots: () => set(state => ({
      hardwareConfig: {
        ...state.hardwareConfig,
        screenshots: null
      }
    })),
    browserId: null,
    setBrowserId: (browserId: number) => set(state => ({
      hardwareConfig: {
        ...state.hardwareConfig,
        browserId
      }
    })),
    clearBrowserId: () => set(state => ({
      hardwareConfig: {
        ...state.hardwareConfig,
        browserId: null
      }
    })),
    browserStatus: null,
    setBrowserStatus: browserStatus => set(state => ({
      hardwareConfig: {
        ...state.hardwareConfig,
        browserStatus
      }
    })),
    browserConfig: null,
    setBrowserConfig: browserConfig => set(state => ({
      hardwareConfig: {
        ...state.hardwareConfig,
        browserConfig
      }
    }))
  }
}));