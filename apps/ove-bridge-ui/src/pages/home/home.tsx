import {
  Calendar,
  Dialog,
  LastUpdated,
  PowerMode,
  useCalendar,
  useDialog
} from "@ove/ui-components";
import { useEffect, useState } from "react";
import KeyPass from "./components/key-pass/key-pass";
import Configuration from "./components/configuration/configuration";
import AutoModeConfiguration
  from "./components/auto-mode-configuration/auto-mode-configuration";
import { type OVEException, type Calendar as TCalendar } from "@ove/ove-types";

import styles from "./home.module.scss";

const useFetchCalendar = (controller: typeof window["electron"]["getCalendar"]) => {
  const [response, setResponse] = useState<TCalendar | OVEException | undefined>(undefined);
  const x = useCalendar(response);

  useEffect(() => {
    controller({}).then(setResponse);
  }, []);

  return x;
};

const Home = () => {
  const { calendar, lastUpdated, refresh: refreshCalendar } = useFetchCalendar(window.electron.getCalendar);
  const { ref, openDialog, closeDialog } = useDialog();

  useEffect(() => {
    console.log(JSON.stringify(calendar));
  }, [calendar]);

  return <main className={styles.main}>
    <div>
      <Configuration
        refreshCalendar={refreshCalendar}
        openDialog={openDialog} />
      <KeyPass />
    </div>
    <section className={styles.section}>
      <div className={styles.power}>
        <LastUpdated lastUpdated={lastUpdated}
                     refreshCalendar={refreshCalendar} />
        <PowerMode calendar={calendar} controller={window.electron} />
      </div>
      {calendar !== null ? <Calendar calendar={calendar} /> : null}
    </section>
    <Dialog ref={ref} closeDialog={closeDialog} title="Configure Auto Mode">
      <AutoModeConfiguration closeDialog={closeDialog} />
    </Dialog>
  </main>;
};

export default Home;
