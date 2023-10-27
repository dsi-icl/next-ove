import { useEffect, useState } from "react";
import { logger } from "../../../../env";

export const useEnv = (setValue: (k: "coreURL" | "calendarURL" | "bridgeName", v: string | undefined) => void) => {
  useEffect(() => {
    window.electron.getEnv({}).then(env => {
      if ("oveError" in env) return;
      setValue("coreURL", env.coreURL);
      setValue("bridgeName", env.bridgeName);
      setValue("calendarURL", env.calendarURL);
    });
  }, []);

  return (env: { bridgeName?: string, coreURL?: string, calendarURL?: string }) => window.electron.updateEnv(env).catch(logger.error);
};

export const useSocket = () => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    window.electron.getSocketStatus({}).then(status => setConnected(typeof status === "boolean" && status));
    window.electron.receive("socket-connect", () => {
      setConnected(true);
    });
    window.electron.receive("socket-disconnect", () => {
      setConnected(false);
    });
  }, []);

  return connected;
};