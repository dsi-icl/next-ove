import React, { useEffect } from "react";
import { trpc } from "../../../../utils/api";
import { useStore } from "../../../../store";
import { type CalendarEvent } from "@ove/ove-types";
import { PowerMode as PowerModeDisplay } from "@ove/ui-components";

const useFetchPowerMode = (bridgeId: string, calendar: CalendarEvent[]) => {
  const setManual = trpc.bridge.setManualSchedule.useMutation();
  const setAuto = trpc.bridge.setAutoSchedule.useMutation();
  const setEco = trpc.bridge.setEcoSchedule.useMutation();

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
  const getMode = trpc.bridge.getMode
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
