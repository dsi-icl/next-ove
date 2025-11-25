import React, {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { Bounds, type Device, type StatusOptions } from "@ove/ove-types";
import { InfoIcon, Moon, Sun } from "lucide-react";
import { useStatus } from "./hooks";
import { env, logger } from "../../../env";
import Actions from "./actions/actions";
import Preview from "./preview/preview";
import Toolbar from "./toolbar/toolbar";
import { api } from "../../../utils/api";
import { columns, type FilterValue } from "./columns";
import {
  Badge,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@ove/ui-base-components";
import Container from "./container";
import { buildDeviceURL } from "@ove/ove-utils";

const ObservatoryInfo = ({
  bridgeId,
  ref,
}: {
  bridgeId: string;
  ref: RefObject<HTMLElement | null>;
}) => {
  const getNextSchedule = api.bridge.getNextScheduled.useQuery({ bridgeId });
  const nextScheduledStart = useMemo(() => {
    if (
      getNextSchedule.status === "success" &&
      getNextSchedule.data.nextStart !== null
    ) {
      return new Date(getNextSchedule.data.nextStart).toLocaleString();
    } else {
      return "-";
    }
  }, [getNextSchedule.data?.nextStart, getNextSchedule.status]);

  const nextScheduledStop = useMemo(() => {
    if (
      getNextSchedule.status === "success" &&
      getNextSchedule.data.nextStop !== null
    ) {
      return new Date(getNextSchedule.data.nextStop).toLocaleString();
    } else {
      return "-";
    }
  }, [getNextSchedule.status, getNextSchedule.data?.nextStop]);

  return (
    <Popover>
      <PopoverTrigger>
        <InfoIcon className="size-4" />
      </PopoverTrigger>
      <PopoverContent
        className="flex w-[250px] max-w-[unset] flex-col gap-1"
        container={ref.current}
      >
        <div className="flex items-center">
          <Sun className="size-4" strokeWidth={3} />
          <span className="ml-auto font-mono font-normal">
            {nextScheduledStart}
          </span>
        </div>
        <div className="flex items-center">
          <Moon className="size-4" strokeWidth={3} />
          <span className="ml-auto font-mono font-normal">
            {nextScheduledStop}
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
};

type ActionStateHelper<T extends keyof FilterValue> = Pick<FilterValue, T> & {
  command: T;
};
type ActionState =
  | ActionStateHelper<"selected">
  | ActionStateHelper<"filter">
  | ActionStateHelper<"filterType">;

const selectionReducer = (state: FilterValue, action: ActionState) => {
  switch (action.command) {
    case "selected":
      return {
        filter: null,
        filterType: state.filterType,
        selected: action.selected,
      };
    case "filter":
      return {
        filter: action.filter,
        filterType: state.filterType,
        selected: state.selected,
      };
    case "filterType":
      return {
        filter: null,
        filterType: action.filterType,
        selected: state.selected,
      };
    default:
      throw new Error("Unknown action");
  }
};

const useDevices = (isOnline: boolean, bridgeId: string) => {
  const getDevices = api.bridge.getDevices.useQuery(
    { bridgeId },
    { enabled: isOnline },
  );
  return useMemo(() => {
    if (!isOnline || getDevices.status !== "success") return [];
    return getDevices.data;
  }, [isOnline, getDevices.status, getDevices.data]);
};

const getStatusClass = (status: StatusOptions | "pending" | "error" | null) => {
  switch (status) {
    case "on":
      return "green";
    case "off":
    case "error":
      return "red";
    case null:
      return "default";
    default:
      return "yellow";
  }
};

const Status = ({
  deviceId,
  bridgeId,
}: {
  deviceId: string;
  bridgeId: string;
}) => {
  const status = useStatus(deviceId, bridgeId);
  return (
    <Badge
      className="rounded-full px-2 py-1 text-xs"
      variant={getStatusClass(status)}
    >
      {status === null ? "" : status}
    </Badge>
  );
};

const getData = (bridgeId: string, devices: Device[]) =>
  devices.map((device) => ({
    protocol: device.type,
    id: device.id,
    hostname: buildDeviceURL(device),
    mac: device.mac,
    tags: device.tags,
    status: <Status deviceId={device.id} bridgeId={bridgeId} />,
    actions: (
      <Actions
        devices={devices}
        device={device}
        tags={undefined}
        deviceIds={undefined}
        bridgeId={bridgeId}
      />
    ),
  }));

const Observatory = ({
  name,
  isOnline,
}: {
  name: string;
  isOnline: boolean;
}) => {
  const utils = api.useUtils();
  const devices = useDevices(isOnline, name);
  const [filters, filtersReducer] = useReducer(selectionReducer, {
    filter: null,
    filterType: "id",
    selected: null,
  });
  const bounds = api.core.getObservatoryBounds.useQuery();

  useEffect(() => {
    utils.core.getObservatoryBounds.invalidate().catch(logger.error);
  }, [isOnline, utils.core.getObservatoryBounds]);

  useEffect(() => {
    const interval = setInterval(
      () =>
        utils.hardware.getLiveUpdate
          .invalidate({ bridgeId: name })
          .catch(logger.error),
      env.LIVE_UPDATE_REFRESH_INTERVAL,
    );
    return () => clearInterval(interval);
  }, [name, utils.hardware.getLiveUpdate]);

  const selectPreview = useCallback(
    (display: Bounds["displays"][0]) => {
      if (
        filters.selected?.[0] === display.rendererId &&
        filters.selected?.[1] === display.deviceId
      ) {
        filtersReducer({
          command: "selected",
          selected: null,
        });

        return false;
      } else {
        filtersReducer({
          command: "selected",
          selected: [display.rendererId, display.deviceId],
        });

        return true;
      }
    },
    [filtersReducer, filters.selected],
  );

  const headingRef = useRef<HTMLHeadingElement | null>(null);

  return (
    <section className="relative mx-8 mb-0 mt-8">
      <h2 ref={headingRef} className="mb-2 font-bold">
        Observatory {name} - {isOnline ? "online" : "offline"}
        <ObservatoryInfo ref={headingRef} bridgeId={name} />
      </h2>
      {isOnline ? (
        <>
          {isOnline && bounds.status === "success" && name in bounds.data ? (
            <Preview
              bridgeId={name}
              selected={filters.selected}
              bounds={bounds.data[name]}
              setSelected={selectPreview}
            />
          ) : null}
          <Toolbar
            filterType={filters.filterType}
            devices={devices}
            filter={filters.filter}
            setFilterType={(filterType) =>
              filtersReducer({
                command: "filterType",
                filterType,
              })
            }
            setFilter={(filter) =>
              filtersReducer({
                command: "filter",
                filter,
              })
            }
            bridgeId={name}
            selected={filters.selected}
          />
          <div className="w-[calc(100vw-4rem)]">
            <Container
              filter={filters.filter}
              filterType={filters.filterType}
              selected={filters.selected}
              columns={columns}
              data={getData(name, devices)}
            />
          </div>
        </>
      ) : null}
    </section>
  );
};

export default Observatory;
