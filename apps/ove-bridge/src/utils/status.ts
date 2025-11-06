import {
  type Device,
  type OVEException,
  type StatusOptions
} from "@ove/ove-types";
import { env, logger } from "../env";
import { execPromise } from "@ove/ove-server-utils";
import { controller } from "../features/reconciliation/controller";

const getTimeout = (device: Device): number => {
  switch (device.type) {
    case "node":
      return env.HARDWARE.TIMEOUTS.NODE;
    case "pjlink":
      return env.HARDWARE.TIMEOUTS.PJLINK;
    case "mdc":
      return env.HARDWARE.TIMEOUTS.MDC;
  }
};

export const syncStatus = async (
  handler: () => Promise<StatusOptions | OVEException>,
  device: Device,
  ac?: AbortController,
): Promise<StatusOptions | OVEException> => {
  const res = await statusOptions(handler, device, ac);
  controller.getState()[device.id].status.observed = res;
  return res;
};

const statusOptions = async (
  handler: () => Promise<StatusOptions | OVEException>,
  device: Device,
  controller?: AbortController,
): Promise<StatusOptions | OVEException> => {
  let status: StatusOptions = "off";
  try {
    if (controller !== undefined) {
      setTimeout(() => controller.abort(), getTimeout(device));
    }

    return await handler();
  } catch (e) {
    logger.trace(e);
  }

  if (env !== null && env.HARDWARE.SCRIPTS?.PING !== undefined) {
    try {
      const res = await execPromise(
        env.HARDWARE.SCRIPTS.PING.replaceAll("%IP%", device.host.split("/")[0]), {timeout: getTimeout(device)});
      if (res.includes("ttl")) {
        status = "PING";
      }
    } catch (e) {
      logger.trace(`${e}`.split("\n")[0]);
      return status;
    }
  }

  if (env !== null && env.HARDWARE.SCRIPTS?.ARP_SCAN !== undefined) {
    try {
      const res = await execPromise(
        env.HARDWARE.SCRIPTS.ARP_SCAN.replaceAll("%IP%", device.host.split("/")[0]), {timeout: getTimeout(device)});
      if (!res.includes("seems down")) {
        status = "ARP";
      }
    } catch (e) {
      logger.trace(e);
      return status;
    }
  }

  if (env !== null && env.HARDWARE.SCRIPTS?.SYN_SCAN !== undefined) {
    try {
      const res = await execPromise(
        env.HARDWARE.SCRIPTS.SYN_SCAN.replaceAll("%IP%", device.host.split("/")[0]), {timeout: getTimeout(device)});
      if (!res.includes("seems down")) {
        status = "SYN";
      }
      return status;
    } catch (e) {
      logger.trace(e);
      return status;
    }
  }

  return status;
};
