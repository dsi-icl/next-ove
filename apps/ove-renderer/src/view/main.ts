import { env } from "../env";
import { io } from "socket.io-client";

export const init = (observatory: string, identifier: string) => {
  const client = io(`${env.SOCKETS.URL}/${observatory}`, {
    path: `${env.SOCKETS.PATH ?? ""}/${env.CORE_API_VERSION}`,
    withCredentials: true,
    autoConnect: false,
    auth: {
      username: identifier,
    }
  });

  client.on("connect", () => console.log("Connected"));
  client.on("disconnect", () => console.log("Disconnected"));
  client.on("connect_error", err => {
    console.error(err);
  });
  client.on("init", ({layout}) => {
    // TODO: initialise layout
  });

  client.connect();
};
