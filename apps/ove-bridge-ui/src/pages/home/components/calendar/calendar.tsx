import {
  Calendar as CalendarDisplay,
  dateFnsLocalizer
} from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enGB from "date-fns/locale/en-GB";
import "react-big-calendar/lib/css/react-big-calendar.css";
import styles from "./calendar.module.scss";
import { RefreshCcw } from "lucide-react";
import { useCalendar, useMode } from "./hooks";

const locales = {
  "en-GB": enGB
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales
});

const Calendar = () => {
  const { calendar, lastUpdated, refresh: refreshCalendar } = useCalendar();
  const { mode, setManual, setAuto, setEco } = useMode(calendar);

  return <section className={styles.section}>
    <div className={styles["mode-container"]}>
      <p className={styles["last-updated"]}>
        <span className={styles.bold}>Last updated</span> - {lastUpdated}
      </p>
      <button className={styles.refresh} onClick={refreshCalendar}>
        <RefreshCcw /></button>
      <button className={styles.button}
              style={{ backgroundColor: mode === "manual" ? "lightgreen" : "lightgrey" }}
              onClick={setManual}>Manual
      </button>
      <button className={styles.button}
              style={{ backgroundColor: mode === "auto" ? "lightgreen" : "lightgrey" }}
              onClick={setAuto}>Auto
      </button>
      <button className={styles.button}
              style={{ backgroundColor: mode === "eco" ? "lightgreen" : "lightgrey" }}
              onClick={setEco}>Eco
      </button>
    </div>
    <CalendarDisplay
      localizer={localizer}
      events={calendar}
      startAccessor="start"
      endAccessor="end"
      className={styles.calendar}
    />
  </section>;
};

export default Calendar;
