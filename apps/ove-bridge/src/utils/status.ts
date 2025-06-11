import { env, logger } from "../env";
import { execSync } from "child_process";
import { isError, type OVEException, type StatusOptions } from "@ove/ove-types";

export const statusOptions = async (
  handler: () => Promise<StatusOptions | OVEException>,
  ip: string,
): Promise<StatusOptions> => {
  try {
    const res = await handler();

    if (isError(res)) {
      return getSyn(ip);
    }

    return res;
  } catch (e) {
    logger.error(e);
    return getSyn(ip);
  }
};

const getSyn = (ip: string): StatusOptions => {
  if (env === null || env.HARDWARE.SCRIPTS?.SYN_SCAN === undefined)
    return "off";
  try {
    const res = execSync(env.HARDWARE.SCRIPTS.SYN_SCAN.replaceAll("%IP%", ip), {
      timeout: env.HARDWARE.TIMEOUTS.NODE,
    }).toString();

    if (res.includes("seems down")) {
      return getArp(ip);
    }

    return "SYN";
  } catch (e) {
    logger.error(e);
    return getArp(ip);
  }
};

const getArp = (ip: string): StatusOptions => {
  if (env === null || env.HARDWARE.SCRIPTS?.ARP_SCAN === undefined)
    return "off";
  try {
    const res = execSync(env.HARDWARE.SCRIPTS.ARP_SCAN.replaceAll("%IP%", ip), {
      timeout: env.HARDWARE.TIMEOUTS.NODE,
    }).toString();

    if (res.includes("seems down")) {
      return "off";
    }

    return "ARP";
  } catch (e) {
    logger.error(e);
    return "off";
  }
};
