import { isError, OVEException, StatusOptions } from "@ove/ove-types";
import { env, logger } from "../../../env";
import { execSync } from "child_process";

export const statusOptions = async (
  handler: () => Promise<StatusOptions | OVEException>,
  ip: string
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
  if (env.SYN_SCAN_COMMAND === undefined) return "off";
  try {
    const res = execSync(
      env.SYN_SCAN_COMMAND.replaceAll("%IP%", ip)).toString();

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
  if (env.ARP_SCAN_COMMAND === undefined) return "off";
  try {
    const res = execSync(
      env.ARP_SCAN_COMMAND.replaceAll("%IP%", ip)).toString();

    if (res.includes("seems down")) {
      return "off";
    }

    return "ARP";
  } catch (e) {
    logger.error(e);
    return "off";
  }
};
