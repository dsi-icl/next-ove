import React, { useCallback, useMemo } from "react";
import type { HardwareInfo } from "../../types";
import SearchSelect from "../search-select/search-select";

import styles from "./toolbar.module.scss";
import Actions from "../actions/actions";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from "@ove/ui-base-components";
import { api } from "../../../../utils/api";
import { isError, type PowerMode } from "@ove/ove-types";
import { Video, Calendar, Power, PowerOff, Leaf } from "lucide-react";
import { useStore } from "../../../../store";
import { logger } from "../../../../env";
import { toast } from "sonner";

type ToolbarProps = {
  hardware: HardwareInfo[]
  setFilterType: (type: "id" | "tags") => void
  setFilter: (filter: string | null) => void
  filterType: "id" | "tags"
  filter: string | null
  selected: string[] | null
  name: string
}

const Toolbar = ({
  hardware,
  setFilterType,
  setFilter,
  filterType,
  selected,
  filter,
  name
}: ToolbarProps) => {
  const utils = api.useUtils();
  const setDeviceAction = useStore(state =>
    state.hardwareConfig.setDeviceAction);
  const searchValues = useMemo(() => hardware.flatMap(({
    device: {
      id,
      tags
    }
  }) => filterType === "id" ? [id] : tags).filter((v, i, arr) => arr.indexOf(v) === i && (selected === null || selected.includes(v))), [hardware, filterType, selected]);
  const tag = filterType === "tags" ? (filter ?? undefined) : undefined;
  const getPowerMode = api.bridge.getMode.useQuery({ bridgeId: name });
  const setManual = api.bridge.setManualSchedule.useMutation({
    onSuccess: () => utils.bridge.getMode.invalidate({bridgeId: name})
  });
  const setAuto = api.bridge.setAutoSchedule.useMutation({
    onSuccess: () => utils.bridge.getMode.invalidate({bridgeId: name})
  });
  const setEco = api.bridge.setAutoSchedule.useMutation({
    onSuccess: () => utils.bridge.getMode.invalidate({bridgeId: name})
  });
  const powerMode: PowerMode = useMemo(() => {
    if (getPowerMode.data === undefined || isError(getPowerMode.data.response)) return "manual";
    return getPowerMode.data.response;
  }, [getPowerMode.data]);
  const updatePowerMode = useCallback((mode: string) => {
    switch (mode) {
      case "manual": setManual.mutateAsync({bridgeId: name});
      break;
      case "auto": setAuto.mutateAsync({bridgeId: name});
      break;
      case "eco": setEco.mutateAsync({bridgeId: name});
      break;
      default: throw new Error(`Unknown power mode: ${mode}`)
    }
  }, [setManual, setAuto, setEco, name]);
  const powerOn = api.hardware.startAll.useMutation({
    retry: false,
    onSuccess: () => toast.info("Successfully powered on"),
    onError: () => toast.error("Failed to power on")
  });
  const powerOff = api.hardware.shutdownAll.useMutation({
    retry: false,
    onSuccess: () => toast.info("Successfully powered off"),
    onError: () => toast.error("Failed to power off")
  });
  const device = filterType === "id" ? hardware.find(({ device: { id } }) => id === filter) ?? null : null;
  const reconciliationStatus = api.bridge.getReconciliation.useQuery({ bridgeId: name });
  const apiUtils = api.useUtils();
  const startReconciliation =
    api.bridge.startReconciliation.useMutation();
  const stopReconciliation =
    api.bridge.stopReconciliation.useMutation();

  const start = useCallback(async () => {
    await startReconciliation.mutateAsync({ bridgeId: name })
      .catch(logger.error);
    apiUtils.bridge.getReconciliation.invalidate().catch(logger.error);
  }, [startReconciliation, name, apiUtils.bridge.getReconciliation]);

  const stop = useCallback(async () => {
    await stopReconciliation.mutateAsync({ bridgeId: name })
      .catch(logger.error);
    apiUtils.bridge.getReconciliation.invalidate().catch(logger.error);
  }, [stopReconciliation, name, apiUtils.bridge.getReconciliation]);
  return <div className="flex items-center justify-between mb-2 max-w-[90vw] flex-wrap">
    {reconciliationStatus.data !== undefined && !isError(reconciliationStatus.data.response) ?
      <Button
        onClick={reconciliationStatus.data.response === true ? stop : start}
        variant={reconciliationStatus.data.response === true ? "destructive" : "default"}>
        {reconciliationStatus.data.response === true ? "Stop Reconciliation" : "Start Reconciliation"}
      </Button> : null}
    <Button variant="outline" onClick={() => setDeviceAction({
      bridgeId: name,
      action: "monitoring",
      deviceId: null,
      pending: false
    })}>
      <Video className="mr-2 h-4 w-4" />
      Live Feed
    </Button>
    <Button variant="outline" onClick={() => setDeviceAction({
      bridgeId: name,
      action: "calendar",
      deviceId: null,
      pending: false
    })}>
      <Calendar className="mr-2 h-4 w-4" />
      View Calendar
    </Button>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" onClick={() => setDeviceAction({
          bridgeId: name,
          action: "power_mode",
          deviceId: null,
          pending: false
        })}>
          <Leaf className="mr-2 h-4 w-4" />
          Set Power Mode
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup value={powerMode} onValueChange={updatePowerMode}>
          <DropdownMenuRadioItem value="manual">Manual</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="auto">Auto</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="eco">Eco</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
    <div className="flex">
      <Button variant="destructive" className="rounded-r-none"
              onClick={() => powerOff.mutateAsync({ bridgeId: name })}>
        <PowerOff className="mr-2 h-4 w-4" />
        Power Off
      </Button>
      <Button variant="default" className="rounded-l-none"
              onClick={() => powerOn.mutateAsync({ bridgeId: name })}>
        <Power className="mr-2 h-4 w-4" />
        Power On
      </Button>
    </div>
    <div className="flex items-center">
      <p>Filter by:</p>
      <div className={styles["filter-type-container"]}>
        <button className={filterType === "id" ? styles.active : undefined}
                onClick={() => setFilterType("id")} style={{
          borderTopLeftRadius: "0.25rem",
          borderBottomLeftRadius: "0.25rem"
        }}>ID
        </button>
        <button className={filterType === "tags" ? styles.active : undefined}
                onClick={() => setFilterType("tags")} style={{
          borderTopRightRadius: "0.25rem",
          borderBottomRightRadius: "0.25rem"
        }}>Tags
        </button>
      </div>
      <SearchSelect setFilter={setFilter} filter={filter}
                    filterType={filterType}
                    values={searchValues} />
      <Actions bridgeId={name} tag={tag} device={device?.device ?? null}
               status={device?.status ?? null} />
    </div>
  </div>;
};

export default Toolbar;
