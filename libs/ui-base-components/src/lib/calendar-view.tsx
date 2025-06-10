import React from "react";
import { dateFnsLocalizer, Calendar } from "react-big-calendar";
import { parse } from "date-fns/parse";
import { format } from "date-fns/format";
import { getDay } from "date-fns/getDay";
import { enGB } from "date-fns/locale/en-GB";
import { startOfWeek } from "date-fns/startOfWeek";
import { type CalendarEvent } from "@ove/ove-types";

import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "en-GB": enGB,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export const CalendarView = ({ calendar }: { calendar: CalendarEvent[] }) => (
  <Calendar
    localizer={localizer}
    events={calendar}
    startAccessor="start"
    endAccessor="end"
    className="h-[70svh] w-[calc(60vw-2rem)]"
  />
);
