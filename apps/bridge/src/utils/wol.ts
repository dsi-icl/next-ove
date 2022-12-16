import * as net from "net";
import * as udp from "dgram";

export const createMagicPacket = mac => {
  const MAC_REPEAT = 16;
  const MAC_LENGTH = 0x06;
  const PACKET_HEADER = 0x06;
  const parts = mac.match(/[0-9a-fA-F]{2}/g);
  if (!parts || parts.length != MAC_LENGTH)
    throw new Error(`malformed MAC address "${mac}"`);
  let buffer = Buffer.alloc(PACKET_HEADER);
  const bufMac = Buffer.from(parts.map(p => parseInt(p, 16)));
  buffer.fill(0xff);
  for (let i = 0; i < MAC_REPEAT; i++) {
    buffer = Buffer.concat([buffer, bufMac]);
  }
  return buffer;
};

export const wake = async (mac, options?, callback?): Promise<boolean> => {
  options = options || {};
  if (typeof options == "function") {
    callback = options;
  }
  const { address, port } = {
    address: options.address || "255.255.255.255",
    port: options.port || 9,
  };
  // create magic packet
  const magicPacket = createMagicPacket(mac);
  const socket = udp.createSocket(
    net.isIPv6(address) ? "udp6" : "udp4"
  ).on("error", err => {
    socket.close();
    callback && callback(err);
  }).once("listening", () => socket.setBroadcast(true));
  return new Promise((resolve, reject) => {
    socket.send(
      magicPacket, 0, magicPacket.length,
      port, address, (err, res) => {
        const result = res == magicPacket.length;
        if (err) reject(err);
        else resolve(result);
        callback && callback(err, result);
        socket.close();
      });
  });
};
