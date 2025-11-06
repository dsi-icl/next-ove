import {
  type Device,
  isError,
  type MDCInfo as TMDCInfo,
  type PJLinkInfo as TPJLinkInfo,
} from "@ove/ove-types";
import FSInfo from "./fs-info";
import OSInfo from "./os-info";
import { toast } from "sonner";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@ove/ui-base-components";
import CPUInfo from "./cpu-info";
import MDCInfo from "./mdc-info";
import USBInfo from "./usb-info";
import VboxInfo from "./vbox-info";
import WifiInfo from "./wifi-info";
import AudioInfo from "./audio-info";
import DockerInfo from "./docker-info";
import MemoryInfo from "./memory-info";
import PJLinkInfo from "./pjlink-info";
import SystemInfo from "./system-info";
import { assert } from "@ove/ove-utils";
import GeneralInfo from "./general-info";
import BatteryInfo from "./battery-info";
import NetworkInfo from "./network-info";
import PrinterInfo from "./printer-info";
import ProcessInfo from "./process-info";
import GraphicsInfo from "./graphics-info";
import { api } from "../../../../utils/api";
import BluetoothInfo from "./bluetooth-info";
import React, { useMemo, useState } from "react";
import { type InfoTypes, getPages } from "../../../../utils";

export const useInfo = (
  deviceId: string | null,
  bridgeId: string,
  tags?: string[],
  deviceIds?: string[],
) => {
  const [type, setType] = useState<InfoTypes>("general");
  const getInfo = api.hardware.getInfo.useQuery(
    {
      bridgeId,
      deviceId: deviceId ?? "",
      type,
    },
    {
      enabled: deviceId !== null,
    },
  );
  const getInfoAll = api.hardware.getInfoAll.useQuery(
    {
      bridgeId,
      type,
      tags,
      deviceIds,
    },
    {
      enabled: deviceId === null,
    },
  );

  const info: Map<
    number,
    {
      deviceId: string;
      response: object | null;
    }
  > = useMemo(() => {
    if (deviceId !== null) {
      switch (getInfo.status) {
        case "success":
          return new Map([
            [
              0,
              {
                deviceId,
                response: isError(getInfo.data.response)
                  ? null
                  : (getInfo.data.response as object),
              },
            ],
          ]);
        case "error":
          toast.error(`Cannot get information for ${deviceId}`);
          return new Map();
        default:
          return new Map();
      }
    } else {
      switch (getInfoAll.status) {
        case "success": {
          if (isError(getInfoAll.data.response)) {
            toast.error("Cannot get information for devices");
            return new Map();
          }
          return new Map(
            getInfoAll.data.response.map(({ deviceId, response }, i) => [
              i,
              {
                deviceId,
                response: isError(response) ? null : (response as object),
              },
            ]),
          );
        }
        case "error":
          toast.error("Cannot get information for devices");
          return new Map();
        default:
          return new Map();
      }
    }
  }, [
    deviceId,
    getInfo.status,
    getInfo.data?.response,
    getInfoAll.status,
    getInfoAll.data?.response,
  ]);

  return {
    info,
    type,
    setType,
  };
};

// type of info is unknown
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getInfo = (device: Device, data: any, type: string | undefined) => {
  if (device.type === "mdc") return <MDCInfo info={data as TMDCInfo} />;
  if (device.type === "pjlink")
    return <PJLinkInfo info={data as TPJLinkInfo} />;
  switch (type) {
    case "system":
      return <SystemInfo info={data} />;
    case "cpu":
      return <CPUInfo info={data} />;
    case "memory":
      return <MemoryInfo info={data} />;
    case "battery":
      return <BatteryInfo info={data} />;
    case "graphics":
      return <GraphicsInfo info={data} />;
    case "os":
      return <OSInfo info={data} />;
    case "processes":
      return <ProcessInfo info={data} />;
    case "fs":
      return <FSInfo info={data} />;
    case "usb":
      return <USBInfo info={data} />;
    case "printer":
      return <PrinterInfo info={data} />;
    case "audio":
      return <AudioInfo info={data} />;
    case "network":
      return <NetworkInfo info={data} />;
    case "wifi":
      return <WifiInfo info={data} />;
    case "bluetooth":
      return <BluetoothInfo info={data} />;
    case "docker":
      return <DockerInfo info={data} />;
    case "vbox":
      return <VboxInfo info={data} />;
    default:
      return <GeneralInfo info={data} />;
  }
};

type InfoProps = {
  device: Device | null;
  bridgeId: string;
  tags?: string[];
  devices: Device[];
  deviceIds?: string[];
};

const InfoContainer = ({ device, devices, bridgeId, tags, deviceIds }: InfoProps) => {
  const [idx, setIdx] = useState(0);
  const { info, type, setType } = useInfo(device?.id ?? null, bridgeId, tags, deviceIds);
  const [selectParent, setSelectParent] = useState<HTMLDivElement | null>(null);

  return (
    <DialogContent className="flex w-[70%] flex-col">
      <DialogHeader ref={(ref) => setSelectParent(ref)}>
        <div className="flex w-full flex-row items-center pr-6">
          <DialogTitle className="text-2xl font-bold">
            Info - {info.get(idx)?.deviceId ?? ""}
          </DialogTitle>
          <Select
            onValueChange={(value) => setType(value as InfoTypes)}
            value={type}
          >
            <SelectTrigger className="ml-auto w-[180px]">
              <SelectValue placeholder="Enter info type" />
            </SelectTrigger>
            <SelectContent
              container={selectParent}
              className="max-h-[65vh] overflow-y-scroll"
              position="popper"
            >
              <SelectGroup>
                <SelectLabel>Info Type</SelectLabel>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="cpu">CPU</SelectItem>
                <SelectItem value="memory">Memory</SelectItem>
                <SelectItem value="battery">Battery</SelectItem>
                <SelectItem value="graphics">Graphics</SelectItem>
                <SelectItem value="os">OS</SelectItem>
                <SelectItem value="processes">Processes</SelectItem>
                <SelectItem value="fs">FS</SelectItem>
                <SelectItem value="usb">USB</SelectItem>
                <SelectItem value="printer">Printer</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="network">Network</SelectItem>
                <SelectItem value="wifi">Wifi</SelectItem>
                <SelectItem value="bluetooth">Bluetooth</SelectItem>
                <SelectItem value="docker">Docker</SelectItem>
                <SelectItem value="vbox">Vbox</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <DialogDescription>Device system information</DialogDescription>
      </DialogHeader>
      <div className="h-[40vh] overflow-y-scroll">
        {info.size > 0 && assert(info.get(idx)).response !== null
          ? getInfo(
              device ??
                assert(
                  devices.find(
                    (dv) => dv.id === assert(info.get(idx)).deviceId,
                  ),
                ),
              assert(info.get(idx)).response,
              type,
            )
          : null}
      </div>
      <DialogFooter>
        {(device?.id ?? null) === null ? (
          <Pagination className="mb-6 mt-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setIdx((cur) => Math.max(cur - 1, 0))}
                />
              </PaginationItem>
              {getPages(idx, info.size).map((ix) => (
                <PaginationItem key={ix}>
                  <PaginationLink
                    isActive={idx === ix}
                    onClick={() => setIdx(ix)}
                  >
                    {ix}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setIdx((cur) => Math.min(cur + 1, info.size - 1))
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        ) : null}
      </DialogFooter>
    </DialogContent>
  );
};

export default InfoContainer;
