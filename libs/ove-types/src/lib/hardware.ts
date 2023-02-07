import { z } from "zod";

export interface ServerToClientEvents {
  getDevices: (callback: (result: object) => void) => void
  info: (callback: (result: object) => void, id?: string, type?: string) => void
}

export const DeviceSchema = z.object({
  id: z.string(),
  description: z.string(),
  ip: z.string(),
  port: z.number(),
  protocol: z.string().regex(/^mdc|node|projector$/gi),
  mac: z.string(),
  tags: z.array(z.string())
});

export interface ClientToServerEvents {

}
