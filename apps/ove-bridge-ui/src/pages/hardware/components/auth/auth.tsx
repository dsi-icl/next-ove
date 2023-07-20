import { FormEvent, forwardRef, useCallback, useEffect, useState } from "react";
import { Device } from "@ove/ove-types";
import { createTRPCProxyClient, httpLink } from "@trpc/client";
import { AppRouter } from "@ove/ove-client-router";
import { Mode } from "../../utils";
import styles from "./auth.module.scss";
import { Snackbar } from "@ove/ui-components";

type AuthProps = {
  device: Device
  setMode: (mode: Mode) => void
}

const Auth = forwardRef<HTMLDialogElement, AuthProps>(({
  device,
  setMode
}, ref) => {
  const [status, setStatus] = useState<boolean | null>(null);

  const createClient = useCallback(() =>
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

  useEffect(() => console.log(status), [status]);

  const handleAuth = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const key = await window.electron.getPublicKey();

    let registered;
    try {
      registered = await createClient().register.mutate({
        pin: (formData.get("pin") ?? "").toString(),
        key
      });
    } catch (e) {
      registered = false;
    }

    setStatus(registered);

    if (registered) {
      await window.electron.registerAuth(device.id);
      setMode("overview");
    }
  };

  useEffect(() => {
    if (status === null || status) return;
    const ref = setTimeout(() => setStatus(null), 1500);
    return () => {
      clearTimeout(ref);
    };
  }, [status]);

  return <dialog ref={ref} onClick={() => setMode("overview")} className={styles.dialog}>
    <div className={styles.hidden} onClick={e => e.stopPropagation()}>
      <h2>Authorise: {device.id}</h2>
      <form method="post" className={styles.form} onSubmit={e => handleAuth(e)}>
        <label htmlFor="pin">Enter PIN:</label>
        <input id="pin" type="text" name="pin" />
        <button type="submit">Authorise</button>
      </form>
    </div>
    {status !== null && !status ? <Snackbar text="Error" /> : null}
  </dialog>;
});

export default Auth;