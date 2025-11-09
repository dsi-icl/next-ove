import React, { useCallback, useState } from "react";
import { dateFnsLocalizer, Calendar, View } from "react-big-calendar";
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

export const CalendarView = ({ calendar }: { calendar: CalendarEvent[] }) => {
  const [view, setView] = useState<View>('week');
  const [date, setDate] = useState<Date>(new Date());
  const onView = useCallback((view: View) => {
    setView(view);
  }, []);

  const onNavigate = useCallback((date: Date) => {
    setDate(date);
  }, []);
  return (
    <Calendar
      localizer={localizer}
      view={view}
      onView={onView}
      onNavigate={onNavigate}
      date={date}
      events={calendar}
      startAccessor="start"
      endAccessor="end"
      className="h-[70vh] min-h-[calc(80vh-8rem)] w-full"
    />
  );
};
