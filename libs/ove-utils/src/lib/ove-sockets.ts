import Emitter from "component-emitter"; // polyfill of Node.js EventEmitter in the browser
import superjson from "superjson";
class Encoder {
  /**
   * Encode a packet into a list of strings/buffers
   */
  encode(packet: unknown) {
    return [superjson.stringify(packet)];
  }
}

class Decoder extends Emitter {
  /**
   * Receive a chunk (string or buffer) and optionally emit a "decoded" event with the reconstructed packet
   */
  add(chunk: string) {
    const packet = superjson.parse<any>(chunk);
    if (this.isPacketValid(packet)) {
      this.emit("decoded", packet);
    } else {
      throw new Error("invalid format");
    }
  }
  isPacketValid({ type, data, nsp, id }: {type: any, data: any, nsp: any, id: any}) {
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
   */
  destroy() {}
}

export default { Encoder, Decoder };