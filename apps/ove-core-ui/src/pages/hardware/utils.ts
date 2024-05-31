import type { Action, DeviceAction } from "./types";
import { isError, type OVEException } from "@ove/ove-types";

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

export const checkErrors = <T>(args: {
  data: {
    deviceId: string,
    response: T | OVEException
  }[],
  onError: (response: {
    deviceId: string,
    response: T | OVEException
  }) => void,
  onSuccess: () => void
}) => {
  let containsErrors = false;

  args.data.forEach(response => {
    if (isError(response)) {
      args.onError(response);
      containsErrors = true;
    }
  });

  if (containsErrors) args.onSuccess();
};
