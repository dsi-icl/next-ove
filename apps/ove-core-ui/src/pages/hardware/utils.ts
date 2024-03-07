import type { Action, DeviceAction } from "./types";

export const skipSingle = (
  type: Action,
  bridgeId: string,
  deviceAction: DeviceAction
): boolean => deviceAction.bridgeId !== bridgeId ||
  deviceAction.deviceId === null || deviceAction.action !== type ||
  deviceAction.pending;

export const skipMulti = (
  type: Action,
  bridgeId: string,
  deviceAction: DeviceAction
): boolean => deviceAction.bridgeId !== bridgeId ||
  deviceAction.deviceId !== null || deviceAction.action !== type ||
  deviceAction.pending;
