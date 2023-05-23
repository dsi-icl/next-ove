import { useCallback, useEffect } from "react";
import { createTRPCProxyClient, httpLink } from "@trpc/client";
import { AppRouter } from "@ove/ove-core-router";
import { Helmet } from "react-helmet";

export default () => {
  const createClient = useCallback(() =>
    createTRPCProxyClient<AppRouter>({
      links: [
        httpLink({
          url: `http://localhost:3333/api/v1/trpc`,
          async headers() {
            const token: string = JSON.parse(localStorage.getItem("tokens")!!)["access"];
            return {
              authorization: `Bearer ${token}`
            };
          }
        })
      ],
      transformer: undefined
    }), []);

  useEffect(() => {
    createClient().hardware.getStatus.query({
      bridgeId: "dev",
      deviceId: "0"
    }).then(result => console.log(result));
  }, []);

  return <main>
    <Helmet>
      <title>Next-OVE Hardware</title>
    </Helmet>
    <h1>Hardware Manager</h1>
  </main>;
}