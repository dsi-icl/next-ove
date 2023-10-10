import {
  ArrowRepeat, FileEarmarkCode, GpuCard,
  InfoCircle,
  PlayCircle,
  StopCircle
} from "react-bootstrap-icons";
import {
  useStatus,
  useInfo,
  useStartDevice,
  useShutdownDevice
} from "./observatory-controller";
import { type Device } from "@ove/ove-types";
import { type HardwareInfo } from "../hooks/hooks";
import { logger } from "../../../env";

type ActionsProps = {
  name: string
  setInfo: (info: object) => void
  device: Device
  updateHardware: <Key extends keyof HardwareInfo>(deviceId: string, [k, v]: [Key, HardwareInfo[Key]]) => void
  openConsole: () => void
  showNotification: (text: string) => void
}

const Actions = ({ showNotification, openConsole, name, setInfo, device, updateHardware }: ActionsProps) => {
  const updateStatus = useStatus(device.id, name, updateHardware);
  const updateInfo = useInfo(device.id, name, (deviceId, data) => {
    updateHardware(deviceId, ["info" as const, data]);
    setInfo(data);
  });
  const startDevice = useStartDevice(device.id, name, showNotification);
  const shutdownDevice = useShutdownDevice(device.id, name, showNotification);
  return <div
    style={{ display: "flex", justifyContent: "space-around" }}>
    <button style={{ margin: "0.6rem 0" }}
            onClick={() => {
              updateStatus().catch(logger.error);
            }} title="status">
      <ArrowRepeat /></button>
    <button style={{ margin: "0.6rem 0" }} onClick={() => {
      updateInfo().catch(console.error);
    }} title="info">
      <InfoCircle /></button>
    <button style={{ margin: "0.6rem 0" }} onClick={() => {
      startDevice().catch(console.error);
    }} title="start">
      <PlayCircle /></button>
    <button style={{ margin: "0.6rem 0" }} onClick={() => {
      shutdownDevice().catch(console.error);
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