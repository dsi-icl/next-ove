import React from "react";
import {
  dateFnsLocalizer,
  Calendar as CalendarDisplay
} from "react-big-calendar";
import parse from "date-fns/parse";
import format from "date-fns/format";
import getDay from "date-fns/getDay";
import enGB from "date-fns/locale/en-GB";
import startOfWeek from "date-fns/startOfWeek";
import { type CalendarEvent } from "@ove/ove-types";

import styles from "./calendar.module.scss";
import "react-big-calendar/lib/css/react-big-calendar.css";

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

const Calendar = ({ calendar }: { calendar: CalendarEvent[] }) =>
  <CalendarDisplay
    localizer={localizer}
    events={calendar}
    startAccessor="start"
    endAccessor="end"
    className={styles.calendar}
  />;

export default Calendar;
