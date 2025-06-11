import React from "react";
import { RefreshCcw } from "lucide-react";

type LastUpdatedProps = {
  lastUpdated: string | null;
  refreshCalendar: () => void;
};

export const LastUpdated = ({
  lastUpdated,
  refreshCalendar,
}: LastUpdatedProps) => (
  <>
    <p className="mr-auto mt-auto">
      <span className="font-bold">Last updated</span> - {lastUpdated}
    </p>
    <button className="mt-auto" onClick={refreshCalendar}>
      <RefreshCcw />
    </button>
  </>
);
