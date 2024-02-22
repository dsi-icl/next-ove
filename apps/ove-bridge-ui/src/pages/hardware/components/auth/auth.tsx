import { type Mode } from "../../utils";
import { useForm } from "react-hook-form";
import { type Device } from "@ove/ove-types";
import React, { forwardRef, useEffect, useState } from "react";
// TODO: investigate circular dependency
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Dialog, Snackbar, useSnackbar } from "@ove/ui-components";

import styles from "./auth.module.scss";

type AuthProps = {
  device: Device | null;
  setMode: (mode: Mode) => void;
};

const Auth = forwardRef<HTMLDialogElement, AuthProps>(
  ({ device, setMode }, ref) => {
    const [status, setStatus] = useState<boolean | null>(null);
    const { notification, isVisible } = useSnackbar();
    const { register, handleSubmit } = useForm<{ pin: string }>();

    const handleAuth = async ({ pin }: { pin: string }) => {
      if (device === null) throw new Error("Cannot ID null device");
      const registered = await window.bridge.registerAuth({
        id: device.id,
        pin
      });
      setStatus(typeof "registered" !== "object");

      if (!registered) return;
      setMode("overview");
    };

    useEffect(() => {
      if (status === null || status) return;
      const timeout = setTimeout(() => setStatus(null), 1500);
      return () => {
        clearTimeout(timeout);
      };
    }, [status]);

    return (
      <Dialog
        ref={ref}
        title="Authorise Device"
        closeDialog={() => setMode("overview")}
      >
        <h2>Authorise: {device?.id}</h2>
        <form
          method="post"
          className={styles.form}
          onSubmit={handleSubmit(handleAuth)}
        >
          <label htmlFor="pin">Enter PIN:</label>
          <input {...register("pin")} type="text" />
          <button type="submit">Authorise</button>
        </form>
        {status !== null && !status ? (
          <Snackbar text={notification} show={isVisible} />
        ) : null}
      </Dialog>
    );
  }
);

Auth.displayName = "Auth";

export default Auth;
