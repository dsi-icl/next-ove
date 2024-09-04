import React, { useEffect } from "react";
import { api } from "../../../../utils/api";
import { useStore } from "../../../../store";
import type { CalendarEvent } from "@ove/ove-types";
import { PowerMode as PowerModeDisplay } from "@ove/ui-components";

const useFetchPowerMode = (bridgeId: string, calendar: CalendarEvent[]) => {
  const setManual = api.bridge.setManualSchedule.useMutation();
  const setAuto = api.bridge.setAutoSchedule.useMutation();
  const setEco = api.bridge.setEcoSchedule.useMutation();

  return {
    setManualSchedule: async () =>
      (await setManual.mutateAsync({ bridgeId })).response,
    setAutoSchedule: async () =>
      (await setAuto.mutateAsync({ bridgeId })).response,
    setEcoSchedule: async () => (await setEco.mutateAsync({
      bridgeId,
      ecoSchedule: calendar ?? []
    })).response
  };
};

const PowerMode = () => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const calendar = useStore(state => state.hardwareConfig.calendar);
  const mode = useStore(state => state.hardwareConfig.mode);
  const setMode = useStore(state => state.hardwareConfig.setMode);
  const controller = useFetchPowerMode(deviceAction.bridgeId ??
    "", calendar ?? []);
  const getMode = api.bridge.getMode
    .useQuery({ bridgeId: deviceAction.bridgeId ?? "" });

  useEffect(() => {
    if (getMode.status !== "success" ||
      typeof getMode.data.response !== "string") return;
    setMode(getMode.data.response);
  }, [getMode.status, getMode.isRefetching,
    getMode.data?.response, setMode]);

  return <PowerModeDisplay calendar={calendar ?? []} controller={controller}
                           mode={mode} setMode={setMode} />;
};

export default PowerMode;
