import { z } from "zod";
import { useForm } from "react-hook-form";
import { useEnv, useSocket } from "./hooks";
import type { NativeEvent } from "@ove/ove-types";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { type BaseSyntheticEvent } from "react";
import { useFormErrorHandling } from "@ove/ui-components";

import styles from "./configuration.module.scss";

export type ConfigurationProps = {
  refreshCalendar: () => void
  openDialog: () => void
}

const ConfigurationFormSchema = z.strictObject({
  coreURL: z.string().optional(),
  bridgeName: z.string().optional(),
  calendarURL: z.string().optional(),
  reconcile: z.boolean()
});

type ConfigurationForm = z.infer<typeof ConfigurationFormSchema>

const Configuration = ({ refreshCalendar, openDialog }: ConfigurationProps) => {
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit
  } = useForm<ConfigurationForm>({
    resolver: zodResolver(ConfigurationFormSchema)
  });
  useFormErrorHandling(errors);
  const updateEnv = useEnv(setValue as Parameters<typeof useEnv>[0]);
  const connected = useSocket();

  const onSubmit = async ({
    calendarURL,
    bridgeName,
    coreURL,
    reconcile
  }: ConfigurationForm, e: BaseSyntheticEvent<object> | undefined) => {
    console.log("SUBMITTING");
    if ((e?.nativeEvent as unknown as NativeEvent)
      .submitter.name === "auto-mode") {
      openDialog();
      return;
    }

    await updateEnv({ coreURL, bridgeName, calendarURL, reconcile });
    refreshCalendar();
  };

  return <section className={styles.section}>
    <h2>Update Environment</h2>
    <form
      method="post"
      onSubmit={handleSubmit(onSubmit)}
      className={styles.form} style={{ overflowY: "scroll" }}>
      <label htmlFor="core-url">Core URL
        - {connected ? "connected" : "disconnected"}</label>
      <input {...register("coreURL")} type="text" />
      <label htmlFor="bridge-name">Bridge Name</label>
      <input {...register("bridgeName")} type="text" />
      <label htmlFor="calendar-url">Calendar URL</label>
      <input {...register("calendarURL")} type="text" />
      <button id={styles["auto-mode"]} type="submit" name="auto-mode">
        Configure Auto Mode
      </button>
      <div style={{ display: "flex", alignItems: "center", marginTop: "2rem" }}>
        <label htmlFor="reconcile"
               style={{ height: "100%", marginTop: 0 }}>Reconcile</label>
        <input {...register("reconcile")} type="checkbox"
               style={{ marginLeft: "auto" }} />
      </div>
      <button name="update" type="submit">Update / Reconnect</button>
    </form>
  </section>;
};

export default Configuration;
