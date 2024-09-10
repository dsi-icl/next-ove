/* global AbortController, Buffer, setTimeout */

import * as net from "net";
import * as udp from "dgram";
import { env, logger } from "../../../env";

export const createMagicPacket = (mac: string) => {
  const MAC_REPEAT = 16;
  const MAC_LENGTH = 0x06;
  const PACKET_HEADER = 0x06;
  const parts = mac.match(/[0-9a-fA-F]{2}/g);
  if (!parts || parts.length != MAC_LENGTH) {
    throw new Error(`malformed MAC address "${mac}"`);
  }
  let buffer = Buffer.alloc(PACKET_HEADER);
  const bufMac = Buffer.from(parts.map(p => parseInt(p, 16)));
  buffer.fill(0xff);
  for (let i = 0; i < MAC_REPEAT; i++) {
    buffer = Buffer.concat([buffer, bufMac]);
  }
  return buffer;
};

export const wake = async (
  mac: string,
  timeout: number,
  options?: {
    address?: string
    port?: number
  },
  ac?: AbortController
): Promise<boolean> => {
  const { address, port } = {
    address: options?.address ?? env.WOL_ADDRESS ?? "255.255.255.255",
    port: options?.port ?? 9
  };

  // create magic packet
  const magicPacket = createMagicPacket(mac);
  const abortListener = (socket: udp.Socket,
    reject: (reason?: Error) => void) => () => {
    socket.close();
    reject(new Error("Command aborted"));
  };

  return new Promise((resolve, reject) => {
    const socket: udp.Socket = udp
      .createSocket(net.isIPv6(address) ? "udp6" : "udp4")
      .on("error", err => {
        socket.close();
        reject(err);
      })
      .on("close", () => {
        ac?.signal.removeEventListener("abort",
          abortListener.bind(null, socket, reject));
      })
      .once("listening", () => {
        logger.trace("WOL socket listening");
        socket.setBroadcast(true);
        socket.send(
          magicPacket,
          0,
          magicPacket.length,
          port,
          address,
          (err, res) => {
            logger.trace("WOL socket received response");
            const result = res === magicPacket.length;
            socket.close();
            if (err) reject(err);
            else resolve(result);
          }
        );
      });

    if (ac !== undefined) {
      ac.signal.addEventListener("abort",
        abortListener.bind(null, socket, reject), { once: true });
    }
    setTimeout(() => {
      socket.close();
      reject(new Error(`No response in ${timeout / 1_000}s`));
    }, timeout);
  });
};
