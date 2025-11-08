import { fetch, Agent } from "undici";

export const loadSigningKey = async (serverUrl: string | undefined, ca?: string) => {
  if (serverUrl === undefined) return null;
  let agent: Agent | undefined = undefined;
  if (ca !== undefined) {
    agent = new Agent({ connect: { ca } });
  }
  try {
    const res = await (await fetch(serverUrl, {
      credentials: "include",
      dispatcher: agent,
    })).text();
    agent?.destroy();
    return res;
  } catch (e) {
    console.error(e);
    agent?.destroy();
    return null;
  }
};