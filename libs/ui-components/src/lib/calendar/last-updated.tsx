import React from "react";
import { RefreshCcw } from "lucide-react";

import styles from "./calendar.module.scss";

type LastUpdatedProps = {
  lastUpdated: string | null
  refreshCalendar: () => void
}

const LastUpdated = ({ lastUpdated, refreshCalendar }: LastUpdatedProps) =>
  <>
    <p className={styles["last-updated"]}>
      <span className={styles.bold}>Last updated</span> - {lastUpdated}
    </p>
    <button className={styles.refresh} onClick={refreshCalendar}>
      <RefreshCcw /></button>
  </>;

export default LastUpdated;
