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
import { parseISO } from "date-fns";
import styles from "./calendar.module.scss";
import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarEvent, PowerMode } from "@ove/ove-types";
import { RefreshCcw } from "lucide-react";
import UpdateForm from "./update-form";

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
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [mode, setMode] = useState<PowerMode | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const close = useCallback(() => setDialogOpen(false), []);

  useEffect(() => {
    window.electron.getCalendar().then(data => {
      if (data["lastUpdated"] === null) return;
      window.electron.getMode().then(setMode);
      setLastUpdated(new Date(data["lastUpdated"]));
      setEvents(data["value"].map(event => {
        return ({
          title: event["subject"],
          start: parseISO(`${event["start"]["dateTime"]}Z`),
          end: parseISO(`${event["end"]["dateTime"]}Z`)
        });
      }));
    });
  }, []);

  useEffect(() => {
    if (mode === null) return;
    switch (mode) {
      case "manual":
        window.electron.clearSchedule().catch(console.error);
        break;
      case "auto":
        window.electron.setAutoSchedule().catch(console.error);
        break;
      case "eco":
        window.electron.setEcoSchedule(events).catch(console.error);
        break;
    }
  }, [mode]);

  useEffect(() => {
    if (dialogOpen) {
      dialogRef.current?.showModal();
      dialogRef.current?.addEventListener("close", close);
    } else {
      dialogRef.current?.close();
      dialogRef.current?.removeEventListener("close", close);
    }
  }, [dialogOpen]);

  const updateCalendar = (accessToken: string) => {
    window.electron.updateCalendar(accessToken).then(calendar => {
      if (calendar === null || calendar["lastUpdated"] === null) return;
      setLastUpdated(new Date(calendar["lastUpdated"]));
      setEvents(calendar["value"].map(event => {
        return ({
          title: event["subject"],
          start: parseISO(`${event["start"]["dateTime"]}Z`),
          end: parseISO(`${event["end"]["dateTime"]}Z`)
        });
      }));
    });
  };

  const padTime = (time: number): string => `0${time}`.slice(-2);

  const getLastUpdatedTime = (lastUpdated: Date | null) => {
    if (lastUpdated === null) return "";
    return ` ${padTime(lastUpdated.getHours())}:${padTime(lastUpdated.getMinutes())}:${padTime(lastUpdated.getSeconds())}`;
  };

  return <section className={styles.section}>
    <div className={styles["mode-container"]}>
      <p className={styles["last-updated"]}><span
        className={styles.bold}>Last updated</span> - {lastUpdated?.toDateString()}{getLastUpdatedTime(lastUpdated)}
      </p>
      <button className={styles.refresh} onClick={() => setDialogOpen(true)}>
        <RefreshCcw /></button>
      <button className={styles.button}
              style={{ backgroundColor: mode === "manual" ? "lightgreen" : "lightgrey" }}
              onClick={() => setMode("manual")}>Manual
      </button>
      <button className={styles.button}
              style={{ backgroundColor: mode === "auto" ? "lightgreen" : "lightgrey" }}
              onClick={() => setMode("auto")}>Auto
      </button>
      <button className={styles.button}
              style={{ backgroundColor: mode === "eco" ? "lightgreen" : "lightgrey" }}
              onClick={() => setMode("eco")}>Eco
      </button>
    </div>
    <CalendarDisplay
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      className={styles.calendar}
    />
    {dialogOpen ? <UpdateForm ref={dialogRef} updateCalendar={updateCalendar}
                              closeDialog={() => setDialogOpen(false)} /> : null}
  </section>;
};

export default Calendar;