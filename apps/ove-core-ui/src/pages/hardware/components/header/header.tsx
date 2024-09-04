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
import { trpc } from "../../../../utils/api";
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
  const context = trpc.useContext();
  const getReconciliation = trpc.bridge.getReconciliation.useQuery({ bridgeId: name });
  const startReconciliation = trpc.bridge.startReconciliation.useMutation();
  const stopReconciliation = trpc.bridge.stopReconciliation.useMutation();
  const refreshReconciliation = trpc.bridge.refreshReconciliation.useMutation();
  const reconciliationState = useMemo(() => {
    if (getReconciliation.status !== "success") return "Unknown";
    if (isError(getReconciliation.data.response)) return "Error";
    return getReconciliation.data.response ? "Running" : "Stopped";
  }, [getReconciliation.status, getReconciliation.data?.response]);
  const setDeviceAction = useStore(state =>
    state.hardwareConfig.setDeviceAction);

  const start = useCallback(async () => {
    await startReconciliation.mutateAsync({ bridgeId: name }).catch(logger.error);
    context.bridge.getReconciliation.invalidate();
  }, [startReconciliation, name, context.bridge.getReconciliation]);

  const stop = useCallback(async () => {
    await stopReconciliation.mutateAsync({ bridgeId: name }).catch(logger.error);
    context.bridge.getReconciliation.invalidate();
  }, [stopReconciliation, name, context.bridge.getReconciliation]);

  const refresh = useCallback(async () => {
    await refreshReconciliation.mutateAsync({ bridgeId: name }).catch(logger.error);
    context.bridge.getReconciliation.invalidate();
  }, [refreshReconciliation, name, context.bridge.getReconciliation]);

  return <div className={styles.header}>
    <h2>Observatory {name} - {isOnline ? "online" : "offline"}</h2>
    {isOnline ? <div className={styles.actions}>
      <Popover>
        <PopoverTrigger title="reconciliation"><ArrowClockwise
          className={reconciliationState === "Running" ? styles.rotating : undefined} /></PopoverTrigger>
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
                  style={{ display: reconciliationState === "Stopped" ? "initial" : "none" }}>
            <Power size="16" />
          </button>
          <button title="Stop"
                  onClick={stop}
                  style={{ display: reconciliationState === "Running" ? "initial" : "none" }}>
            <PowerOff size="16" />
          </button>
          <button title="Refresh"
                  onClick={refresh}
                  style={{ display: reconciliationState === "Running" ? "initial" : "none" }}>
            <ArrowRepeat
              className={refreshReconciliation.status === "loading" ? styles.rotating : undefined} />
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
