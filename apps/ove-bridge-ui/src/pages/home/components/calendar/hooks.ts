import { useCallback, useEffect, useState } from "react";
import { type CalendarEvent, type PowerMode } from "@ove/ove-types";
import { parseISO } from "date-fns";

export const useCalendar = () => {
  const [calendar, setCalendar] = useState<CalendarEvent[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const formatLastUpdated = useCallback((lastUpdated: Date) => {
    const padTime = (time: number): string => `0${time}`.slice(-2);

    const getLastUpdatedTime = (lastUpdated: Date | null) => {
      if (lastUpdated === null) return "";
      const hours = padTime(lastUpdated.getHours());
      const minutes = padTime(lastUpdated.getMinutes());
      const seconds = padTime(lastUpdated.getSeconds());
      return ` ${hours}:${minutes}:${seconds}`;
    };

    return `${lastUpdated?.toDateString()}${getLastUpdatedTime(lastUpdated)}`;
  }, []);

  const fetchCalendar = useCallback(() => {
    window.electron.getCalendar().then(data => {
      if (data === undefined || data.lastUpdated === null) return;
      setLastUpdated(formatLastUpdated(new Date(data.lastUpdated)));
      setCalendar(data["value"].map(event => ({
        title: event["subject"],
        start: parseISO(`${event["start"]}Z`),
        end: parseISO(`${event["end"]}Z`)
      })));
    });
  }, [setCalendar, setLastUpdated]);

  useEffect(fetchCalendar, []);

  return {calendar, lastUpdated, refresh: fetchCalendar};
};

export const useMode = (calendar: CalendarEvent[]) => {
  const [mode, setMode] = useState<PowerMode | null>(null);

  const refreshMode = (mode: PowerMode | null) => {
    if (mode === null) return;
    switch (mode) {
      case "manual":
        window.electron.clearSchedule().catch(console.error);
        break;
      case "auto":
        window.electron.setAutoSchedule().catch(console.error);
        break;
      case "eco":
        window.electron.setEcoSchedule(calendar).catch(console.error);
        break;
    }
  };

  useEffect(() => {
    window.electron.getMode().then(setMode);
  }, []);

  useEffect(() => {
    refreshMode(mode);
  }, [calendar, mode]);

  return {
    mode,
    setManual: () => setMode("manual"),
    setAuto: () => setMode("auto"),
    setEco: () => setMode("eco")
  };
};