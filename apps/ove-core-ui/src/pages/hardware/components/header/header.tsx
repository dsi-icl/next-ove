import React, { useCallback, useMemo } from "react";
import { useStore } from "../../../../store";
import {
  ArrowClockwise,
  ArrowRepeat,
  Calendar,
  CameraVideo
} from "react-bootstrap-icons";
import { Power, PowerOff } from "lucide-react";

import styles from "./header.module.scss";
import { api } from "../../../../utils/api";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@radix-ui/react-popover";
import { logger } from "../../../../env";
import { isError } from "@ove/ove-types";

const Header = ({ name, isOnline }: {
  name: string,
  isOnline: boolean
}) => {
  const apiUtils = api.useUtils();
  const getReconciliation =
    api.bridge.getReconciliation.useQuery({ bridgeId: name });
  const startReconciliation =
    api.bridge.startReconciliation.useMutation();
  const stopReconciliation =
    api.bridge.stopReconciliation.useMutation();
  const refreshReconciliation =
    api.bridge.refreshReconciliation.useMutation();
  const reconciliationState = useMemo(() => {
    if (getReconciliation.status !== "success") return "Unknown";
    if (isError(getReconciliation.data.response)) return "Error";
    return getReconciliation.data.response ? "Running" : "Stopped";
  }, [getReconciliation.status, getReconciliation.data?.response]);
  const setDeviceAction = useStore(state =>
    state.hardwareConfig.setDeviceAction);

  const start = useCallback(async () => {
    await startReconciliation.mutateAsync({ bridgeId: name })
      .catch(logger.error);
    apiUtils.bridge.getReconciliation.invalidate();
  }, [startReconciliation, name, apiUtils.bridge.getReconciliation]);

  const stop = useCallback(async () => {
    await stopReconciliation.mutateAsync({ bridgeId: name })
      .catch(logger.error);
    apiUtils.bridge.getReconciliation.invalidate();
  }, [stopReconciliation, name, apiUtils.bridge.getReconciliation]);

  const refresh = useCallback(async () => {
    await refreshReconciliation.mutateAsync({ bridgeId: name })
      .catch(logger.error);
    apiUtils.bridge.getReconciliation.invalidate();
  }, [refreshReconciliation, name, apiUtils.bridge.getReconciliation]);

  const rotation = reconciliationState === "Running" ? styles.rotating :
    undefined;
  const refreshRotation = refreshReconciliation.status === "loading" ?
    styles.rotating : undefined;
  const hide = (shownState: "Stopped" | "Running") =>
    reconciliationState === shownState ? "initial" : "none";

  return <div className={styles.header}>
    <h2>Observatory {name} - {isOnline ? "online" : "offline"}</h2>
    {isOnline ? <div className={styles.actions}>
      <Popover>
        <PopoverTrigger title="reconciliation"><ArrowClockwise
          className={rotation} /></PopoverTrigger>
        <PopoverContent style={{
          alignItems: "center",
          padding: "1rem",
          borderRadius: "0.5rem",
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginTop: "1rem",
          boxShadow: "1px 1px 1px grey"
        }}>
          <div>
            <h4 style={{ fontWeight: 700 }}>Reconciliation</h4>
            <h6>Status - {reconciliationState}</h6>
          </div>
          <button title="Start"
                  onClick={start}
                  style={{ display: hide("Stopped") }}>
            <Power size="16" />
          </button>
          <button title="Stop"
                  onClick={stop}
                  style={{ display: hide("Running") }}>
            <PowerOff size="16" />
          </button>
          <button title="Refresh"
                  onClick={refresh}
                  style={{ display: hide("Running") }}>
            <ArrowRepeat
              className={refreshRotation} />
          </button>
        </PopoverContent>
      </Popover>
      <button className={styles.icon} onClick={() => setDeviceAction({
        bridgeId: name,
        action: "monitoring",
        deviceId: null,
        pending: false
      })}>
        <CameraVideo /></button>
      <button className={styles.icon} onClick={() => setDeviceAction({
        bridgeId: name,
        action: "calendar",
        deviceId: null,
        pending: false
      })}>
        <Calendar /></button>
      <button className={styles.icon} onClick={() => setDeviceAction({
        bridgeId: name,
        action: "power_mode",
        deviceId: null,
        pending: false
      })}>
        <Power size="16" /></button>
    </div> : null}
  </div>;
};

export default Header;
