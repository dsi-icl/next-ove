import { useEffect } from "react";
import { logSocket } from "../../../sockets";
import { useLogStore } from "./log-store";
import { useAuth } from "./auth";

export const useSocketInit = (mode: "live" | "historical") => {
  const addLog = useLogStore((store) => store.addLog);
  const token = useAuth();
  useEffect(() => {
    if (logSocket === null || mode === "historical" || token === null) return;
    logSocket.auth = { token };
    logSocket.on("log", addLog);
    logSocket.connect();

    return () => {
      if (logSocket === null) return;
      logSocket.off("log", addLog);
      logSocket.disconnect();
    };
  }, [mode, token]);
};
