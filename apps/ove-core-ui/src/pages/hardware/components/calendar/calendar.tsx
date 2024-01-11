import React from "react";
import { trpc } from "../../../../utils/api";
import { useStore } from "../../../../store";
import {
  Calendar as CalendarDisplay, useCalendar
} from "@ove/ui-components";

const Calendar = () => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const getCalendar = trpc.bridge.getCalendar
    .useQuery({ bridgeId: deviceAction.bridgeId ?? "" });
  const { calendar, lastUpdated } = useCalendar(getCalendar.data?.response);

  return <div style={{
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  }}>
    <CalendarDisplay calendar={calendar} />
    <div style={{ width: "100%", display: "flex", padding: "0 1rem" }}>
      <h4>Last Updated:</h4>
      <p style={{ marginLeft: "auto" }}>{lastUpdated}</p>
    </div>
  </div>;
};

export default Calendar;
