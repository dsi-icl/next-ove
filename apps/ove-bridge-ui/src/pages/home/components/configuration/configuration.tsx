import { FormEvent, useEffect, useState } from "react";

import styles from "./configuration.module.scss";
import { NativeEvent } from "@ove/ove-types";
import { outboundChannels } from "@ove/ove-bridge-shared";

export type ConfigurationProps = {
  setHasCalendar: (hasCalendar: boolean) => void
  openDialog: () => void
}

const Configuration = ({ setHasCalendar, openDialog }: ConfigurationProps) => {
  const [displayCoreURL, setDisplayCoreURL] = useState("");
  const [displayBridgeName, setDisplayBridgeName] = useState("");
  const [connected, setConnected] = useState(false);
  const [displayCalendarURL, setDisplayCalendarURL] = useState("");

  const updateCoreURL = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((e.nativeEvent as unknown as NativeEvent)
      .submitter.name === "auto-mode") {
      openDialog();
      return;
    }
    const formData = new FormData(e.currentTarget);
    const coreURL = (formData.get("core-url") ?? "").toString();
    const bridgeName = (formData.get("bridge-name") ?? "").toString();
    const calendarURL = (formData.get("calendar-url") ?? "").toString();

    setDisplayCoreURL(coreURL);
    setDisplayBridgeName(bridgeName);
    setDisplayCalendarURL(calendarURL);

    setHasCalendar(calendarURL !== "");

    await window.electron.updateEnv(
      coreURL,
      bridgeName,
      calendarURL === "" ? undefined : calendarURL
    ).catch(console.error);
  };

  useEffect(() => {
    window.electron.getEnv().then(({ coreURL, bridgeName, calendarURL }) => {
      setDisplayCoreURL(coreURL ?? "");
      setDisplayBridgeName(bridgeName ?? "");
      setDisplayCalendarURL(calendarURL ?? "");
    });
    window.electron.getSocketStatus().then(status => setConnected(status));
    window.electron.receive(outboundChannels.socketConnect, () => {
      setConnected(true);
    });
    window.electron.receive(outboundChannels.socketDisconnect, () => {
      setConnected(false);
    });
  }, []);

  return <section className={styles.section}>
    <h2>Update Environment</h2>
    <form
      method="post"
      onSubmit={e => updateCoreURL(e)}
      className={styles.form}>
      <label htmlFor="core-url">Core URL
        - {connected ? "connected" : "disconnected"}</label>
      <input
        id="core-url" type="text" name="core-url"
        defaultValue={displayCoreURL} />
      <label htmlFor="bridge-name">Bridge Name</label>
      <input
        id="bridge-name" type="text" name="bridge-name"
        defaultValue={displayBridgeName} />
      <label htmlFor="calendar-url">Calendar URL</label>
      <input
        id="calendar-url"
        type="text"
        name="calendar-url"
        defaultValue={displayCalendarURL} />
      <button id={styles["auto-mode"]} type="submit" name="auto-mode">Configure
        Auto Mode
      </button>
      <button name="update" type="submit">Update / Reconnect</button>
    </form>
  </section>;
};

export default Configuration;
