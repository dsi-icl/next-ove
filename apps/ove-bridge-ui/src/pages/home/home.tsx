import {
  Calendar,
  Dialog,
  LastUpdated,
  PowerMode,
  useCalendar,
  useDialog
} from "@ove/ui-components";
import KeyPass from "./components/key-pass/key-pass";
import Configuration from "./components/configuration/configuration";
import AutoModeConfiguration
  from "./components/auto-mode-configuration/auto-mode-configuration";

import styles from "./home.module.scss";
import { useEffect } from "react";

const Home = () => {
  const { calendar, lastUpdated, refresh: refreshCalendar } = useCalendar(window.electron);
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
