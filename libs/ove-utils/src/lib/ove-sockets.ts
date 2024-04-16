// polyfill of Node.js EventEmitter in the browser
import Emitter from "component-emitter";
import superjson from "superjson";

type ValidPacketArgs = {
  type: number,
  data: object | unknown[] | undefined,
  nsp: string,
  id: undefined | number
}

/**
 * Packet encoder
 */
class Encoder {
  /**
   * Encode a packet into a list of strings/buffers
   * @param {unknown} packet - packet to encode.
   * @return {string[]}
   */
  encode(packet: unknown): string[] {
    return [superjson.stringify(packet)];
  }
}

/**
 * Packet decoder
 */
class Decoder extends Emitter {
  /**
   * Receive a chunk (string or buffer) and optionally emit a
   * “decoded” event with the reconstructed packet.
   * @param {string} chunk - chunk to decode.
   */
  add(chunk: string) {
    const packet = superjson.parse<ValidPacketArgs>(chunk);
    if (this.isPacketValid(packet)) {
      this.emit("decoded", packet);
    } else {
      throw new Error("invalid format");
    }
  }

  /**
   * Whether the received packet is valid
   * @param {ValidPacketArgs} packetArgs
   * @param {number} packetArgs.type - packet type
   * @param {object | unknown[] | undefined} packetArgs.data - packet data
   * @param {string} packetArgs.nsp - packet nsp
   * @param {number | undefined} packetArgs.id - packet id
   * @return {boolean}
   */
  isPacketValid({ type, data, nsp, id }: ValidPacketArgs): boolean {
    const isNamespaceValid = typeof nsp === "string";
    const isAckIdValid = id === undefined || Number.isInteger(id);
    if (!isNamespaceValid || !isAckIdValid) {
      return false;
    }
    switch (type) {
      case 0: // CONNECT
        return data === undefined || typeof data === "object";
      case 1: // DISCONNECT
        return data === undefined;
      case 2: // EVENT
        return Array.isArray(data) && data.length > 0;
      case 3: // ACK
        return Array.isArray(data);
      case 4: // CONNECT_ERROR
        return typeof data === "object";
      default:
        return false;
    }
  }

  /**
   * Clean up internal buffers
   * @return {undefined}
   */
  destroy(): undefined {
    return undefined;
  }
}

export default { Encoder, Decoder };
