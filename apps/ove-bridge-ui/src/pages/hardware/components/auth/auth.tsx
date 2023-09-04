import { type Mode } from "../../utils";
import { type Device } from "@ove/ove-types";
import styles from "./auth.module.scss";
import { Snackbar, useSnackbar } from "@ove/ui-components";
import { type FormEvent, forwardRef, useEffect, useState } from "react";

type AuthProps = {
  device: Device
  setMode: (mode: Mode) => void
}

const Auth = forwardRef<HTMLDialogElement, AuthProps>(({
  device,
  setMode
}, ref) => {
  const [status, setStatus] = useState<boolean | null>(null);
  const {notification, isVisible} = useSnackbar();

  const handleAuth = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const registered =
      await window.electron.registerAuth(device.id, (formData.get("pin") ?? "")
        .toString());
    setStatus(registered);

    if (!registered) return;
    setMode("overview");
  };

  useEffect(() => {
    if (status === null || status) return;
    const ref = setTimeout(() => setStatus(null), 1500);
    return () => {
      clearTimeout(ref);
    };
  }, [status]);

  return <dialog
    ref={ref} onClick={() => setMode("overview")}
    className={styles.dialog}>
    <div className={styles.hidden} onClick={e => e.stopPropagation()}>
      <h2>Authorise: {device.id}</h2>
      <form method="post" className={styles.form} onSubmit={e => handleAuth(e)}>
        <label htmlFor="pin">Enter PIN:</label>
        <input id="pin" type="text" name="pin" />
        <button type="submit">Authorise</button>
      </form>
    </div>
    {status !== null && !status ? <Snackbar text={notification} show={isVisible} /> : null}
  </dialog>;
});

export default Auth;
