import {
  ArrowRepeat, FileEarmarkCode, GpuCard,
  InfoCircle,
  PlayCircle,
  StopCircle
} from "react-bootstrap-icons";
import {
  useStatus,
  useStartDevice,
  useShutdownDevice
} from "./observatory-controller";
import { type Device } from "@ove/ove-types";
import { type HardwareInfo } from "../hooks/hooks";
import { logger } from "../../../env";

type ActionsProps = {
  name: string
  selectInfo: () => void
  device: Device
  updateHardware: <Key extends keyof HardwareInfo>(deviceId: string, [k, v]: [Key, HardwareInfo[Key]]) => void
  openConsole: () => void
  showNotification: (text: string) => void
}

const Actions = ({ showNotification, openConsole, name, selectInfo, device, updateHardware }: ActionsProps) => {
  const updateStatus = useStatus(device.id, name, updateHardware);
  const startDevice = useStartDevice(device.id, showNotification);
  const shutdownDevice = useShutdownDevice(device.id, showNotification);
  return <div
    style={{ display: "flex", justifyContent: "space-around" }}>
    <button style={{ margin: "0.6rem 0" }}
            onClick={() => {
              updateStatus().catch(logger.error);
            }} title="status">
      <ArrowRepeat /></button>
    <button style={{ margin: "0.6rem 0" }} onClick={selectInfo} title="info">
      <InfoCircle /></button>
    <button style={{ margin: "0.6rem 0" }} onClick={() => {
      startDevice({deviceId: device.id, bridgeId: name}).catch(console.error);
    }} title="start">
      <PlayCircle /></button>
    <button style={{ margin: "0.6rem 0" }} onClick={() => {
      shutdownDevice({deviceId: device.id, bridgeId: name}).catch(console.error);
    }} title="stop">
      <StopCircle /></button>
    <button style={{ margin: "0.6rem 0" }} onClick={() => {
      openConsole();
    }} title="execute">
      <FileEarmarkCode /></button>
    <button style={{ margin: "0.6rem 0" }} title="display">
      <GpuCard /></button>
  </div>;
};

export default Actions;