import { useEffect } from "react";
import { useLogStore } from "./log-store";
import { logSocket } from "../../../sockets";

export const useSocketInit = (mode: "live" | "historical") => {
  const addLog = useLogStore((store) => store.addLog);
  useEffect(() => {
    if (logSocket === null || mode === "historical") return;
    logSocket.on("log", addLog);
    logSocket.connect();

    return () => {
      if (logSocket === null) return;
      logSocket.off("log", addLog);
      logSocket.disconnect();
    };
  }, [mode]);
};
