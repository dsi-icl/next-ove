/* global fetch */

import { env, logger } from "../env";

export const updateCookie = async () => {
  try {
    const res = await fetch(`${env.CORE.URL}/api/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${encodeURIComponent(env.AUTH.API_KEY)}`,
      },
    });
    return res.headers.getSetCookie();
  } catch (e) {
    logger.error("Unable to fetch cookie:", e);
  }
};
