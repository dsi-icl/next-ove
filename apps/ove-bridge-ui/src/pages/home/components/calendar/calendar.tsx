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
import { useEffect, useState } from "react";

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

type OutlookEvents = {
  value: {
    subject: string
    start: {
      dateTime: string
    }
    end: {
      dateTime: string
    }
  }[]
}

type CalendarEvent = {
  title: string
  start: Date
  end: Date
}

const Calendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [mode, setMode] = useState<"manual" | "auto" | "eco">("manual");

  useEffect(() => {
    fetch("/test.json").then(res => res.json() as unknown as OutlookEvents).then(data => setEvents(data["value"].map(event => ({
      title: event["subject"],
      start: parseISO(event["start"]["dateTime"]),
      end: parseISO(event["end"]["dateTime"])
    }))));
  }, []);

  return <section className={styles.section}>
    <div className={styles["mode-container"]}>
      <button style={{backgroundColor: mode === "manual" ? "lightgreen" : "lightgrey"}}>Manual</button>
      <button style={{backgroundColor: mode === "auto" ? "lightgreen" : "lightgrey"}}>Auto</button>
      <button style={{backgroundColor: mode === "auto" ? "lightgreen" : "lightgrey"}}>Eco</button>
    </div>
    <CalendarDisplay
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      style={{ height: "70vh", width: "calc(60vw - 2rem)" }}
    />
  </section>;
};

export default Calendar;