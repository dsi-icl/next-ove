import { Tokens } from "@ove/ove-types";
import { Json, assert } from "@ove/ove-utils";
import { AppRouter } from "@ove/ove-core-router";
import { createTRPCProxyClient, httpLink } from "@trpc/client";

// noinspection JSUnusedLocalSymbols
interface ImportMeta {
  env: {
    VITE_CORE_URL: string
    VITE_CORE_API_VERSION: number
  }
}

const fixedEncodeURI = (str: string) =>
  encodeURI(str).replace(/[!'()*]/g, c => "%" + c.charCodeAt(0).toString(16));

export const createClient = () => createBackingClient(`Bearer ${Json.parse<Tokens>(assert(sessionStorage.getItem("tokens"))).access}`);
export const createAuthClient = (username: string, password: string) => createBackingClient(`Basic ${fixedEncodeURI(window.btoa(`${username}:${password}`))}`);

const createBackingClient = (authorization: string) =>
  createTRPCProxyClient<AppRouter>({
    links: [
      httpLink({
        url: `${import.meta.env.VITE_CORE_URL}/api/v${import.meta.env.VITE_CORE_API_VERSION}/trpc`,
        async headers() {
          return { authorization };
        }
      })
    ],
    transformer: undefined
  });
