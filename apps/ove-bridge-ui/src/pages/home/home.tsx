// TODO: investigate circular dependency
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  Calendar,
  Dialog,
  LastUpdated,
  PowerMode,
  useCalendar,
  useDialog
} from "@ove/ui-components";
import React, { useEffect, useState } from "react";
import KeyPass from "./components/key-pass/key-pass";
import Configuration from "./components/configuration/configuration";
import AutoModeConfiguration
  from "./components/auto-mode-configuration/auto-mode-configuration";
import {
  type OVEException,
  type Calendar as TCalendar,
  isError
} from "@ove/ove-types";

import styles from "./home.module.scss";

const useFetchCalendar = (
  controller: typeof window["bridge"]["getCalendar"]
) => {
  const [response, setResponse] = useState<
    TCalendar | OVEException | undefined
  >(undefined);
  const x = useCalendar(response);

  useEffect(() => {
    controller({}).then(setResponse);
  }, [controller]);

  return x;
};

const Home = () => {
  const [mode, setMode] = useState<"manual" | "auto" | "eco" | null>("manual");
  const {
    calendar,
    lastUpdated,
    refresh: refreshCalendar
  } = useFetchCalendar(window.bridge.getCalendar);
  const { ref, openDialog, closeDialog } = useDialog();

  useEffect(() => {
    window.bridge.getMode({}).then(mode => {
      if (isError(mode)) return;
      setMode(mode);
    });
  }, []);

  useEffect(() => {
    console.log(JSON.stringify(calendar));
  }, [calendar]);

  return (
    <main className={styles.main}>
      <div>
        <Configuration
          refreshCalendar={refreshCalendar}
          openDialog={openDialog}
        />
        <KeyPass />
      </div>
      <section className={styles.section}>
        <div className={styles.power}>
          <LastUpdated
            lastUpdated={lastUpdated}
            refreshCalendar={refreshCalendar}
          />
          <PowerMode
            mode={mode}
            setMode={setMode}
            calendar={calendar}
            controller={window.bridge}
          />
        </div>
        {calendar !== null ? <Calendar calendar={calendar} /> : null}
      </section>
      <Dialog ref={ref} closeDialog={closeDialog} title="Configure Auto Mode">
        <AutoModeConfiguration closeDialog={closeDialog} />
      </Dialog>
    </main>
  );
};

export default Home;
