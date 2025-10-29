import { env, logger } from "../env";
import { execSync } from "child_process";
import {
  type Device,
  type OVEException,
  type StatusOptions,
} from "@ove/ove-types";

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

export const statusOptions = async (
  handler: () => Promise<StatusOptions | OVEException>,
  device: Device,
): Promise<StatusOptions | OVEException> => {
  let status: StatusOptions = "off";
  if (env !== null && env.HARDWARE.SCRIPTS?.PING !== undefined) {
    try {
      const res = execSync(
        env.HARDWARE.SCRIPTS.PING.replaceAll("%IP%", device.host.split("/")[0]),
        {
          timeout: getTimeout(device),
        },
      ).toString();
      if (res.includes("ttl")) {
        status = "PING";
      }
    } catch (e) {
      logger.trace(e);
      return status;
    }
  }

  if (env !== null && env.HARDWARE.SCRIPTS?.ARP_SCAN !== undefined) {
    try {
      const res = execSync(
        env.HARDWARE.SCRIPTS.ARP_SCAN.replaceAll("%IP%", device.host.split("/")[0]),
        {
          timeout: getTimeout(device),
        },
      ).toString();
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
      const res = execSync(
        env.HARDWARE.SCRIPTS.SYN_SCAN.replaceAll("%IP%", device.host.split("/")[0]),
        {
          timeout: getTimeout(device),
        },
      ).toString();
      if (!res.includes("seems down")) {
        status = "SYN";
      }
    } catch (e) {
      logger.trace(e);
      return status;
    }
  }

  try {
    return await handler();
  } catch (e) {
    logger.trace(e);
    return status;
  }
};
