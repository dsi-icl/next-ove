import { logger } from "../../../../env";
import { useEffect, useState } from "react";

type Env = {
  bridgeName?: string
  coreURL?: string
  calendarURL?: string
  reconcile: boolean
}

export const useEnv = (
  setValue: <K extends keyof Env>(k: K, v: Env[K]) => void
) => {
  useEffect(() => {
    window.bridge.getEnv({}).then(env => {
      if ("oveError" in env) return;
      setValue("coreURL", env.coreURL);
      setValue("bridgeName", env.bridgeName);
      setValue("calendarURL", env.calendarURL);
      setValue("reconcile", env.reconcile);
    });
  }, [setValue]);

  return (env: Env) => window.bridge.updateEnv(env).catch(logger.error);
};

export const useSocket = () => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    window.bridge.getSocketStatus({}).then(status =>
      setConnected(typeof status === "boolean" && status));
    window.bridge.receive("socket-connect", () => {
      setConnected(true);
    });
    window.bridge.receive("socket-disconnect", () => {
      setConnected(false);
    });
  }, []);

  return connected;
};
