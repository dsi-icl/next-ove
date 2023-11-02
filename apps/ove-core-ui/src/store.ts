import {
  type Browser,
  type CalendarEvent,
  type PowerMode,
  type ScreenshotMethod,
  type Tokens
} from "@ove/ove-types";
import { create } from "zustand";
import { Json } from "@ove/ove-utils";
import { type InfoTypes } from "./utils";
import { type DeviceAction } from "./pages/hardware/types";

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
    browsers: Map<number, Browser> | {
      response: Map<number, Browser>,
      deviceId: string
    }[]
    setBrowsers: (browsers: Map<number, Browser> | {
      response: Map<number, Browser>,
      deviceId: string
    }[]) => void
    browserConfig: { url?: string, displayId?: number } | null
    setBrowserConfig: (config: { url?: string, displayId?: number }) => void
    volume: number | null
    setVolume: (volume: number) => void
    clearVolume: () => void
    calendar: CalendarEvent[] | null
    setCalendar: (calendar: CalendarEvent[] | null) => void
    mode: PowerMode | null
    setMode: (mode: PowerMode | null) => void
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
        deviceAction: {bridgeId: null, deviceId: null, pending: false, action: null},
        info: null,
        paginationIdx: 0,
        command: null,
        commandHistory: [],
        screenshotConfig: null,
        screenshots: null,
        browserId: null,
        browserStatus: null,
        browserConfig: null,
        browsers: new Map(),
        volume: null,
        mode: null,
        calendar: null
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
    setBrowserId: (browserId?: number) => set(state => ({
      hardwareConfig: {
        ...state.hardwareConfig,
        browserId: browserId ?? null
      }
    })),
    clearBrowserId: () => set(state => ({
      hardwareConfig: {
        ...state.hardwareConfig,
        browserId: null
      }
    })),
    browsers: new Map(),
    setBrowsers: browsers => set(state => ({
      hardwareConfig: {
        ...state.hardwareConfig,
        browsers
      }
    })),
    browserConfig: null,
    setBrowserConfig: browserConfig => set(state => ({
      hardwareConfig: {
        ...state.hardwareConfig,
        browserConfig
      }
    })),
    volume: null,
    setVolume: volume => set(state => ({
      hardwareConfig: {
        ...state.hardwareConfig,
        volume
      }
    })),
    clearVolume: () => set(state => ({
      hardwareConfig: {
        ...state.hardwareConfig,
        volume: null
      }
    })),
    mode: null,
    calendar: null,
    setCalendar: calendar => set(state => ({
      hardwareConfig: {
        ...state.hardwareConfig,
        calendar
      }
    })),
    setMode: mode => set(state => ({
      hardwareConfig: {
        ...state.hardwareConfig,
        mode
      }
    }))
  }
}));