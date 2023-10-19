import { useEffect } from "react";
import { logger } from "../../../../env";
import { useStore } from "../../../../store";
import { type DeviceStatus } from "../../types";
import { useMultiController } from "./mutli-hooks";
import { useSingleController } from "./single-hooks";

export const useController = (bridgeId: string, filter: string, setStatus: (deviceId: string, status: DeviceStatus) => void, setAllStatus: (tag: string, status: DeviceStatus | {
  deviceId: string,
  status: DeviceStatus
}[]) => void, showNotification: (text: string) => void) => {
  const clearCommand = useStore(state => state.hardwareConfig.clearCommand);
  const command = useStore(state => state.hardwareConfig.command);
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const curInfo = useStore(state => state.hardwareConfig.info);
  const screenshotConfig = useStore(state => state.hardwareConfig.screenshotConfig);

  const multi = useMultiController(bridgeId, filter, showNotification, setAllStatus);
  const single = useSingleController(deviceAction.deviceId ?? "", bridgeId, showNotification, setStatus);

  useEffect(() => {
    if (deviceAction.bridgeId === null || deviceAction.bridgeId !== bridgeId ||
      (deviceAction.deviceId === null && deviceAction.action === null) || deviceAction.pending) return;
    if (deviceAction.deviceId === null) {
      // MULTIPLE CONTROL
      switch (deviceAction.action) {
        case "status": {
          multi.status().catch(logger.error);
          break;
        }
        case "info": {
          multi.info().catch(logger.error);
          break;
        }
        case "start": {
          multi.start({
            bridgeId,
            tag: filter === "" ? undefined : filter
          }).catch(logger.error);
          break;
        }
        case "shutdown": {
          multi.shutdown({
            bridgeId,
            tag: filter === "" ? undefined : filter
          }).catch(logger.error);
          break;
        }
        case "reboot": {
          multi.reboot({
            bridgeId,
            tag: filter === "" ? undefined : filter
          }).catch(logger.error);
          break;
        }
        case "execute": {
          if (command === null) break;
          multi.execute({
            bridgeId,
            tag: filter === "" ? undefined : filter,
            command
          }).catch(logger.error);
          clearCommand();
          break;
        }
        case "screenshot": {
          if (screenshotConfig === null) return;
          multi.screenshot({
            bridgeId,
            tag: filter === "" ? undefined : filter,
            method: screenshotConfig.method,
            screens: screenshotConfig.screens
          }).catch(logger.error);
          break;
        }
        case "browsers_close": {
          multi.closeBrowsers({
            bridgeId,
            tag: filter === "" ? undefined : filter
          }).catch(logger.error);
          break;
        }
      }
    } else {
      // SINGLE CONTROL
      switch (deviceAction.action) {
        case "status": {
          single.status().catch(logger.error);
          break;
        }
        case "info": {
          single.info().catch(logger.error);
          break;
        }
        case "start": {
          single.start({
            bridgeId,
            deviceId: deviceAction.deviceId
          }).catch(logger.error);
          break;
        }
        case "shutdown": {
          single.shutdown({
            bridgeId,
            deviceId: deviceAction.deviceId
          }).catch(logger.error);
          break;
        }
        case "reboot": {
          single.reboot({
            bridgeId,
            deviceId: deviceAction.deviceId
          }).catch(logger.error);
          break;
        }
        case "execute": {
          if (command === null) break;
          single.execute({
            bridgeId,
            deviceId: deviceAction.deviceId,
            command
          }).catch(logger.error);
          clearCommand();
          break;
        }
        case "screenshot": {
          if (screenshotConfig === null) return;
          single.screenshot({
            bridgeId,
            deviceId: deviceAction.deviceId,
            method: screenshotConfig.method,
            screens: screenshotConfig.screens
          }).catch(logger.error);
          break;
        }
        case "browsers_close": {
          single.closeBrowsers({
            bridgeId,
            deviceId: deviceAction.deviceId
          }).catch(logger.error);
          break;
        }
      }
    }
  }, [deviceAction, curInfo?.type, command]);
};