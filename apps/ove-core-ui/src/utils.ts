import { type Tokens } from "@ove/ove-types";
import { createTRPCProxyClient, httpLink } from "@trpc/client";
// IGNORE PATH - dependency removed at runtime
import { type AppRouter } from "../../ove-core/src/app/router";
import { env } from "./env";

const fixedEncodeURI = (str: string) =>
  encodeURI(str).replace(/[!'()*]/g, c => "%" + c.charCodeAt(0).toString(16));

export const createClient = (tokens: Tokens) => createClient_(`Bearer ${tokens.access}`);
export const createAuthClient = (username: string, password: string) => createClient_(`Basic ${fixedEncodeURI(window.btoa(`${username}:${password}`))}`);

export type Client = ReturnType<typeof createClient_>
const createClient_ = (authorization: string) =>
  createTRPCProxyClient<AppRouter>({
    links: [
      httpLink({
        url: env.CORE_URL,
        async headers() {
          return { authorization };
        }
      })
    ],
    transformer: undefined
  });
