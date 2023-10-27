import { parseISO } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import {
  type Calendar,
  type CalendarEvent,
  type OVEException
} from "@ove/ove-types";

type Controller = {
  getCalendar: (args: {}) => Promise<Calendar | OVEException | undefined>
}

export const useCalendar = (controller: Controller) => {
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
    controller.getCalendar({}).then(data => {
      if (data === undefined || "oveError" in data || data.lastUpdated === null) return;
      setLastUpdated(formatLastUpdated(new Date(data.lastUpdated)));
      setCalendar(data["value"].map(event => ({
        title: event["title"],
        start: parseISO(`${event["start"]}Z`),
        end: parseISO(`${event["end"]}Z`)
      })));
    });
  }, [setCalendar, setLastUpdated]);

  useEffect(fetchCalendar, []);

  return { calendar, lastUpdated, refresh: fetchCalendar };
};