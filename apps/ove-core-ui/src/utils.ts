import { env } from "./env";
import superjson from "superjson";
import { type Tokens } from "@ove/ove-types";
import { createTRPCProxyClient, httpLink } from "@trpc/client";
// IGNORE PATH - dependency removed at runtime
import { type AppRouter } from "../../ove-core/src/server/router";

export type InfoTypes = "general" | "system" | "cpu" | "memory"

const fixedEncodeURI = (str: string) =>
  encodeURI(str).replace(/[!'()*]/g, c => "%" + c.charCodeAt(0).toString(16));

export const createClient = (tokens: Tokens) => createClient_(`Bearer ${tokens.refresh}`);
export const createAuthClient = (username: string, password: string) => {
  const auth = fixedEncodeURI(window.btoa(`${username}:${password}`));
  return createClient_(`Basic ${auth}`);
};

const createClient_ = (authorization: string) =>
  createTRPCProxyClient<AppRouter>({
    links: [
      httpLink({
        url: `${env.CORE_URL}/api/v${env.CORE_API_VERSION}/trpc`,
        async headers() {
          return { authorization };
        }
      })
    ],
    transformer: superjson
  });
