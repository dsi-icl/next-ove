import { AppRouter } from "@ove/ove-core-router";
import { createTRPCProxyClient, httpLink } from "@trpc/client";

const fixedEncodeURI = (str: string) =>
  encodeURI(str).replace(/[!'()*]/g, c => "%" + c.charCodeAt(0).toString(16));

export const createAuthClient = (username: string, password: string) =>
  createTRPCProxyClient<AppRouter>({
    links: [
      httpLink({
        url: `${import.meta.env.VITE_CORE_URL}/api/v1/trpc`,
        async headers() {
          const auth = fixedEncodeURI(window.btoa(`${username}:${password}`));
          return {
            authorization: `Basic ${auth}`
          };
        }
      })
    ],
    transformer: undefined
  });

export const createClient = () =>
  createTRPCProxyClient<AppRouter>({
    links: [
      httpLink({
        url: `http://localhost:3333/api/v1/trpc`,
        async headers() {
          const token: string = JSON.parse(sessionStorage.getItem("tokens")!!)["access"];
          return {
            authorization: `Bearer ${token}`
          };
        }
      })
    ],
    transformer: undefined
  })