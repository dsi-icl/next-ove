import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";

import { env, logger } from "../../env";

export const useLiveSocket = (
  event: string,
  onMessage: (data: any) => void,
  enabled: boolean
) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    console.log(
      env.SOCKETS,
      enabled,
    );
    if (!enabled || env.SOCKETS === undefined) return;

    const socket = io(`${env.SOCKETS.URL}/socket/logs`, {
      path: `${env.SOCKETS.PATH ?? ""}/${env.CORE_API_VERSION}`,
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      logger.info(`Connected to logs socket for ${event}`);
    });
    socket.on(event, onMessage);
    socket.on("connect_error", (err) => logger.error(err));

    return () => {
      socket.off(event, onMessage);
      socket.off("connect");
      socket.off("connect_error");
      socket.disconnect();
    };
  }, [event, enabled, onMessage]);
};