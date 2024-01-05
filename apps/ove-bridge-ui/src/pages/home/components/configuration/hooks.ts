import { useEffect, useState } from "react";
import { logger } from "../../../../env";

export const useEnv = (setValue: (k: "coreURL" | "calendarURL" | "bridgeName", v: string | undefined) => void) => {
  useEffect(() => {
    window.bridge.getEnv({}).then(env => {
      if ("oveError" in env) return;
      setValue("coreURL", env.coreURL);
      setValue("bridgeName", env.bridgeName);
      setValue("calendarURL", env.calendarURL);
    });
  }, []);

  return (env: { bridgeName?: string, coreURL?: string, calendarURL?: string }) => window.bridge.updateEnv(env).catch(logger.error);
};

export const useSocket = () => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    window.bridge.getSocketStatus({}).then(status => setConnected(typeof status === "boolean" && status));
    window.bridge.receive("socket-connect", () => {
      setConnected(true);
    });
    window.bridge.receive("socket-disconnect", () => {
      setConnected(false);
    });
  }, []);

  return connected;
};