import { useEffect, useState } from "react";
import { logger } from "../../../../env";

export const useEnv = (setValue: (k: "coreURL" | "calendarURL" | "bridgeName", v: string | undefined) => void) => {
  useEffect(() => {
    window.electron.getEnv().then(({bridgeName, coreURL, calendarURL}) => {
      setValue("coreURL", coreURL);
      setValue("bridgeName", bridgeName);
      setValue("calendarURL", calendarURL);
    });
  }, []);

  return (env: {bridgeName?: string, coreURL?: string, calendarURL?: string}) => {
    window.electron.updateEnv(env).catch(logger.error);
  };
};

export const useSocket = () => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    window.electron.getSocketStatus().then(status => setConnected(status));
    window.electron.receive("socket-connect", () => {
      setConnected(true);
    });
    window.electron.receive("socket-disconnect", () => {
      setConnected(false);
    });
  }, []);

  return connected;
}