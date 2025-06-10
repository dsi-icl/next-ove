import { type Calendar, type OVEException } from "@ove/ove-types";
import { parseISO } from "date-fns";
import { useMemo, useState } from "react";

const formatLastUpdated = (lastUpdated: Date) => {
  const padTime = (time: number): string => `0${time}`.slice(-2);

  const getLastUpdatedTime = (lastUpdated: Date | null) => {
    if (lastUpdated === null) return "";
    const hours = padTime(lastUpdated.getHours());
    const minutes = padTime(lastUpdated.getMinutes());
    const seconds = padTime(lastUpdated.getSeconds());
    return ` ${hours}:${minutes}:${seconds}`;
  };

  return `${lastUpdated?.toDateString()}${getLastUpdatedTime(lastUpdated)}`;
};

export const useCalendar = (response: Calendar | OVEException | undefined) => {
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const calendar = useMemo(() => {
    if (
      response === undefined ||
      "oveError" in response ||
      response.lastUpdated === null
    )
      return;
    setLastUpdated(formatLastUpdated(new Date(response.lastUpdated)));
    return response["value"].map((event) => ({
      title: event["title"],
      start: parseISO(`${event["start"]}Z`),
      end: parseISO(`${event["end"]}Z`),
    }));
  }, [response]);

  return { calendar, lastUpdated };
};
