import "react-data-grid/lib/styles.css";
import DataGrid from "react-data-grid";
import { useEffect, useState } from "react";
import { Device, is, OVEExceptionSchema, ServiceType } from "@ove/ove-types";
import { createClient } from "../../../utils";

import {
  Projector,
  HddNetwork,
  Display,
  ArrowRepeat,
  InfoCircle,
  PlayCircle,
  StopCircle,
  FileEarmarkCode,
  GpuCard
} from "react-bootstrap-icons";

export type ObservatoryProps = {
  name: string
  isOnline: boolean
}

const columns = [
  { key: "protocol", name: "Protocol" },
  { key: "id", name: "ID" },
  { key: "hostname", name: "Hostname" },
  { key: "mac", name: "MAC" },
  { key: "tags", name: "Tags" },
  { key: "status", name: "Status" },
  { key: "actions", name: "Actions" }
];

export default ({ name, isOnline }: ObservatoryProps) => {
  const [hardware, setHardware] = useState<Device[]>([]);
  const getProtocolIcon = (protocol: ServiceType) => {
    switch (protocol) {
      case "node":
        return <HddNetwork />;
      case "mdc":
        return <Display />;
      case "pjlink":
        return <Projector />;
    }
  };

  useEffect(() => {
    if (!isOnline) return;
    createClient().hardware.getDevices.query({ bridgeId: name }).then(result => {
      if (!result || is(OVEExceptionSchema, result["bridgeResponse"])) {
        return;
      }
      setHardware(result["bridgeResponse"]);
    });
  }, []);

  return <section>
    <h2>Observatory {name} - {isOnline ? "online" : "offline"}</h2>
    {!isOnline ? null :
      <DataGrid className="rdg-light" columns={columns}
                rows={hardware.map(device => ({
                  protocol: getProtocolIcon(device.protocol),
                  id: device.id,
                  hostname: device.ip,
                  mac: device.mac,
                  tags: device.tags,
                  status: null,
                  actions: <div>
                    <div>
                      <button><ArrowRepeat /></button>
                      <button><InfoCircle /></button>
                    </div>
                    <div>
                      <button><PlayCircle /></button>
                      <button><StopCircle /></button>
                      <button><FileEarmarkCode /></button>
                    </div>
                    <div>
                      <button><GpuCard /></button>
                    </div>
                  </div>
                }))} />}
  </section>;
}