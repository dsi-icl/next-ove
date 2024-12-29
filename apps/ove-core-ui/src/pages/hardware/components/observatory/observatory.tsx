import { assert } from "@ove/ove-utils";
import Actions from "../actions/actions";
import { skipSingle } from "../../utils";
import Preview from "../preview/preview";
import Toolbar from "../toolbar/toolbar";
import { api } from "../../../../utils/api";
import { useStore } from "../../../../store";
import { columns } from "../data-table/columns";
import type { HardwareInfo } from "../../types";
import DataTable from "../data-table/data-table";
import React, {
  useEffect,
  useMemo,
  useReducer
} from "react";
import { is, isError, OVEExceptionSchema, type StatusOptions } from "@ove/ove-types";

import styles from "./observatory.module.scss";
import { logger } from "../../../../env";

export type FilterType = "id" | "tags"
type FilterState = {
  filter: string | null
  type: FilterType
  selected: string[] | null
}

type ActionStateHelper<T extends keyof FilterState> = Pick<FilterState, T> & {command: T}
type ActionState = ActionStateHelper<"selected"> | ActionStateHelper<"filter"> | ActionStateHelper<"type">

const selectionReducer = (state: FilterState, action: ActionState) => {
  switch (action.command) {
    case "selected":
      return {
        filter: null,
        type: state.type,
        selected: action.selected
      }
    case "filter":
      return {
        filter: action.filter,
        type: state.type,
        selected: state.selected
      }
    case "type":
      return {
        filter: null,
        type: action.type,
        selected: state.selected
      }
    default: throw new Error("Unknown action");
  }
};

export const useHardware = (isOnline: boolean, bridgeId: string) => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const getHardware = api.bridge.getDevices
    .useQuery({ bridgeId }, { enabled: isOnline });
  const getStatus = api.hardware.getStatus.useQuery({
    bridgeId,
    deviceId: deviceAction.deviceId ?? ""
  }, { enabled: false });
  const getStatusAll = api.hardware.getStatusAll.useQuery({
    bridgeId
  }, { enabled: isOnline });

  const hardware = useMemo(() => {
    if (!isOnline || getHardware.status !== "success" ||
      is(OVEExceptionSchema, getHardware.data.response)) return [];

    const getSingleStatus = (deviceId: string) => {
      if (deviceAction.deviceId !== deviceId) return null;
      return getStatus.status === "success" &&
      !isError(getStatus.data.response) ? getStatus.data.response : null;
    };

    const getMultiStatus = (deviceId: string) => {
      if (getStatusAll.status !== "success" ||
        "oveError" in getStatusAll.data.response) return null;
      const response = assert(getStatusAll.data.response
        .find(({ deviceId: id }) => id === deviceId)).response;
      return !isError(response) ? response : null;
    };

    return getHardware.data.response.map(device => {
      const status = (!skipSingle("status", bridgeId, deviceAction) ?
        getSingleStatus(device.id) : getMultiStatus(device.id)) ?? "off";
      return ({
        device,
        status
      });
    });
  }, [isOnline, bridgeId, deviceAction, getHardware.status,
    getHardware.data?.response, getStatus.status, getStatus.data?.response,
    getStatusAll.status, getStatusAll.data?.response]);

  return { hardware };
};

const getData = (bridgeId: string, hardware: HardwareInfo[]) => hardware.map(({
  device,
  status
}) => {
  const getStatusClass = (status: StatusOptions) => {
    switch (status) {
      case "on": return "bg-green-200 text-green-800";
      case "off": return "bg-red-200 text-red-800";
      default: return "bg-yellow-200 text-yellow-800";
    }
  }
  const deviceProtocol = device.protocol === undefined ? "" : `${device.protocol}://`;
  const devicePort = device.port === undefined ? "" : `:${device.port}`;
  return ({
    protocol: device.type,
    id: device.id,
    hostname: `${deviceProtocol}${device.ip}${devicePort}`,
    mac: device.mac,
    tags: device.tags,
    status: <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(status)}`}>
      {status}
    </span>,
    actions: <Actions device={device} tag={undefined} bridgeId={bridgeId} status={status} />
  });
});

const Observatory = ({ name, isOnline }: {
  name: string
  isOnline: boolean
}) => {
  const utils = api.useUtils();
  const { hardware } = useHardware(isOnline, name);
  const [filters, filtersReducer] = useReducer(selectionReducer, {filter: null, type: "id", selected: null});
  const bounds = api.core.getObservatoryBounds.useQuery();

  useEffect(() => {
    utils.core.getObservatoryBounds.invalidate().catch(logger.error);
  }, [isOnline, utils.core.getObservatoryBounds]);

  useEffect(() => {
    utils.core.getObservatoryBounds.invalidate().catch(logger.error);
  }, [isOnline]);

  return <section className={styles.observatory}>
    <h2 className="font-bold mb-2">Observatory {name} - {isOnline ? "online" : "offline"}</h2>
    {isOnline ? <>
      {isOnline && bounds.status === "success" && !isError(bounds.data)
      && name in bounds.data ?
        <Preview bridgeId={name} bounds={bounds.data[name]}
                 setSelected={selected => filtersReducer({command: "selected", selected})} selected={filters.selected} /> : null}
      <Toolbar filterType={filters.type} hardware={hardware} filter={filters.filter}
               setFilterType={type => filtersReducer({command: "type", type})} setFilter={filter => filtersReducer({command: "filter", filter})}
               bridgeId={name} selected={filters.selected} />
      <div className={styles["table-container"]}>
        <DataTable columns={columns} filterType={filters.type} filter={filters.filter}
                   data={getData(name, hardware)} selected={filters.selected} />
      </div>
    </> : null}
  </section>;
};

export default Observatory;
