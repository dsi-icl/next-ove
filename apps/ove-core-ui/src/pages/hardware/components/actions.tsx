import {
  ArrowRepeat, FileEarmarkCode, GpuCard,
  InfoCircle,
  PlayCircle,
  StopCircle
} from "react-bootstrap-icons";
import { useRef } from "react";
import ObservatoryController from "./observatory-controller";
import { type Device } from "@ove/ove-types";
import { createClient } from "../../../utils";
import { type HardwareInfo } from "../hooks/hooks";

type ActionsProps = {
  name: string
  setInfo: (info: object) => void
  device: Device
  updateHardware: <Key extends keyof HardwareInfo>(deviceId: string, [k, v]: [Key, HardwareInfo[Key]]) => void
  client: ReturnType<typeof createClient>
  openConsole: () => void
  showNotification: (text: string) => void
}

const Actions = ({ client, showNotification, openConsole, name, setInfo, device, updateHardware }: ActionsProps) => {
  const controller = useRef(ObservatoryController);
  return <div
    style={{ display: "flex", justifyContent: "space-around" }}>
    <button style={{ margin: "0.6rem 0" }}
            onClick={() => {
              controller.current.updateStatus(client, device.id, name, updateHardware).catch(console.error);
            }} title="status">
      <ArrowRepeat /></button>
    <button style={{ margin: "0.6rem 0" }} onClick={() => {
      controller.current.updateInfo(client, device.id, name, (deviceId, data) => {
        updateHardware(deviceId, ["info" as const, data]);
        setInfo(data);
      }).catch(console.error);
    }} title="info">
      <InfoCircle /></button>
    <button style={{ margin: "0.6rem 0" }} onClick={() => {
      controller.current.startDevice(client, device.id, name, showNotification).catch(console.error);
    }} title="start">
      <PlayCircle /></button>
    <button style={{ margin: "0.6rem 0" }} onClick={() => {
      controller.current.stopDevice(client, device.id, name, showNotification).catch(console.error);
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