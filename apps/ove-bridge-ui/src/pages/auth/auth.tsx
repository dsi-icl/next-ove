import { FormEvent, useCallback, useEffect, useState } from "react";
import { Device } from "@ove/ove-types";
import { createTRPCProxyClient, httpLink } from "@trpc/client";
import { AppRouter } from "@ove/ove-client-router";

export default () => {
  const [devices, setDevices] = useState<Device[] | null>(null);
  const [status, setStatus] = useState<boolean | null>(null);

  const createClient = useCallback((device: Device) =>
    createTRPCProxyClient<AppRouter>({
      links: [
        httpLink({
          url: `http://${device.ip}:${device.port}/api/v1/trpc`,
          async headers() {
            return {
              authorization: ""
            };
          }
        })
      ],
      transformer: undefined
    }), []);

  const handleAuth = useCallback(async (e: FormEvent<HTMLFormElement>, device: Device) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const key = await window.electron.getPublicKey();

    const registered = await createClient(device).register.mutate({
      pin: (formData.get("pin") ?? "").toString(),
      key
    });

    setStatus(registered);

    if (registered) {
      await window.electron.registerAuth(device.id);
      setDevices(await window.electron.getDevicesToAuth());
    }
  }, []);

  useEffect(() => {
    window.electron.getDevicesToAuth().then(setDevices);
  }, []);

  return <main>
    <ul>
      {devices?.map(device => <li key={device.id}>
        <form method="post" onSubmit={e => handleAuth(e, device)}>
          <p>{device.id}</p>
          <label htmlFor="pin">Enter PIN:</label>
          <input id="pin" type="text" name="pin" />
          <button type="submit">Authorise</button>
        </form>
      </li>)}
      {status !== null ? <h2>{status ? "Authorised" : "Error"}</h2> : null}
    </ul>
  </main>;
}