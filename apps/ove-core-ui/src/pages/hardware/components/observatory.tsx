import React, {
  useEffect,
  useMemo,
  useReducer
} from "react";
import {
  type Device,
  type StatusOptions,
  isError
} from "@ove/ove-types";
import { useStatus } from "./hooks";
import { logger } from "../../../env";
import Actions from "./actions/actions";
import Preview from "./preview/preview";
import Toolbar from "./toolbar/toolbar";
import { assert } from "@ove/ove-utils";
import { api } from "../../../utils/api";
import DataTable from "./data-table/data-table";
import { columns, FilterValue } from "./data-table/columns";

type ActionStateHelper<T extends keyof FilterValue> = Pick<FilterValue, T> & {
  command: T
}
type ActionState =
  ActionStateHelper<"selected">
  | ActionStateHelper<"filter">
  | ActionStateHelper<"filterType">

const selectionReducer = (state: FilterValue, action: ActionState) => {
  switch (action.command) {
    case "selected":
      return {
        filter: null,
        filterType: state.filterType,
        selected: action.selected
      };
    case "filter":
      return {
        filter: action.filter,
        filterType: state.filterType,
        selected: state.selected
      };
    case "filterType":
      return {
        filter: null,
        filterType: action.filterType,
        selected: state.selected
      };
    default:
      throw new Error("Unknown action");
  }
};

const useDevices = (isOnline: boolean, bridgeId: string) => {
  const getDevices = api.bridge.getDevices.useQuery({ bridgeId }, { enabled: isOnline });
  return useMemo(() => {
    if (!isOnline || getDevices.status !== "success" || isError(getDevices.data.response)) return [];
    return getDevices.data.response;
  }, [isOnline, getDevices.status, getDevices.data?.response]);
};

const getStatusClass = (status: StatusOptions | "pending" | "error") => {
  switch (status) {
    case "on":
      return "bg-green-200 text-green-800";
    case "off":
    case "error":
      return "bg-red-200 text-red-800";
    default:
      return "bg-yellow-200 text-yellow-800";
  }
};

const Status = ({ deviceId, bridgeId }: {
  deviceId: string,
  bridgeId: string
}) => {
  const status = useStatus(deviceId, bridgeId);
  return <span
    className={`px-2 py-1 rounded-full text-xs ${getStatusClass(assert(status))}`}>
    {status}
  </span>;
};

const getData = (bridgeId: string, devices: Device[]) => devices.map(device => {
  const deviceProtocol = device.protocol === undefined ? "" : `${device.protocol}://`;
  const devicePort = device.port === undefined ? "" : `:${device.port}`;
  return ({
    protocol: device.type,
    id: device.id,
    hostname: `${deviceProtocol}${device.ip}${devicePort}`,
    mac: device.mac,
    tags: device.tags,
    status: <Status deviceId={device.id} bridgeId={bridgeId} />,
    actions: <Actions devices={devices}
                      device={device} tag={undefined} bridgeId={bridgeId} />
  });
});

const Observatory = ({ name, isOnline }: {
  name: string
  isOnline: boolean
}) => {
  const utils = api.useUtils();
  const devices = useDevices(isOnline, name);
  const [filters, filtersReducer] = useReducer(selectionReducer, {
    filter: null,
    filterType: "id",
    selected: null
  });
  const bounds = api.core.getObservatoryBounds.useQuery();

  useEffect(() => {
    utils.core.getObservatoryBounds.invalidate().catch(logger.error);
  }, [isOnline, utils.core.getObservatoryBounds]);

  return <section className="mt-8 mb-0 ml-8 mr-8 relative">
    <h2
      className="font-bold mb-2">Observatory {name} - {isOnline ? "online" : "offline"}</h2>
    {isOnline ? <>
      {isOnline && bounds.status === "success" && !isError(bounds.data)
      && name in bounds.data ?
        <Preview bridgeId={name} bounds={bounds.data[name]}
                 setSelected={selected => filtersReducer({
                   command: "selected",
                   selected
                 })} selected={filters.selected} /> : null}
      <Toolbar filterType={filters.filterType} devices={devices}
               filter={filters.filter}
               setFilterType={filterType => filtersReducer({
                 command: "filterType",
                 filterType
               })}
               setFilter={filter => filtersReducer({
                 command: "filter",
                 filter
               })}
               bridgeId={name} selected={filters.selected} />
      <div className="w-[calc(100vw - 4rem)]">
        <DataTable columns={columns} filterType={filters.filterType}
                   filter={filters.filter}
                   data={getData(name, devices)} selected={filters.selected} />
      </div>
    </> : null}
  </section>;
};

export default Observatory;
