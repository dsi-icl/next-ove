import { env, logger } from "../env";

const getCredentials = () => {
  if (env.ENVIRONMENT !== "testing") return undefined;
  return {
    username: env.TESTING.USERNAME,
    role: env.TESTING.ROLE,
  };
};

const authorize = (role: string, url: string) => {
  logger.trace("Authorizing:", role, url);
  return true;
};

const service = {
  authorize,
  getCredentials,
};

export default service;
