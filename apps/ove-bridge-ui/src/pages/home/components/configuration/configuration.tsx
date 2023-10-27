import { useForm } from "react-hook-form";
import { useEnv, useSocket } from "./hooks";
import { type BaseSyntheticEvent } from "react";
import { type NativeEvent } from "@ove/ove-types";

import styles from "./configuration.module.scss";

export type ConfigurationProps = {
  refreshCalendar: () => void
  openDialog: () => void
}

type Form = {
  coreURL: string | undefined
  bridgeName: string | undefined
  calendarURL: string | undefined
}

const Configuration = ({ refreshCalendar, openDialog }: ConfigurationProps) => {
  const { register, setValue, handleSubmit } = useForm<Form>();
  const updateEnv = useEnv(setValue);
  const connected = useSocket();

  const onSubmit = async ({
    calendarURL,
    bridgeName,
    coreURL
  }: Form, e: BaseSyntheticEvent<object> | undefined) => {
    if ((e?.nativeEvent as unknown as NativeEvent)
      .submitter.name === "auto-mode") {
      openDialog();
      return;
    }

    await updateEnv({ coreURL, bridgeName, calendarURL });
    refreshCalendar();
  };

  return <section className={styles.section}>
    <h2>Update Environment</h2>
    <form
      method="post"
      onSubmit={handleSubmit(onSubmit)}
      className={styles.form}>
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
      <button name="update" type="submit">Update / Reconnect</button>
    </form>
  </section>;
};

export default Configuration;
