import { useEffect } from "react";
import { logger } from "../../../../env";
import { useStore } from "../../../../store";
import { useMultiController } from "./mutli-hooks";
import { useSingleController } from "./single-hooks";
import { type DeviceAction, type DeviceStatus } from "../../types";

export const useController = (deviceAction: DeviceAction, bridgeId: string, filter: string, setStatus: (deviceId: string, status: DeviceStatus) => void, setAllStatus: (tag: string, status: DeviceStatus | {
  deviceId: string,
  status: DeviceStatus
}[]) => void, showNotification: (text: string) => void) => {
  const curInfo = useStore(state => state.info);
  const single = useSingleController(deviceAction.deviceId ?? "", bridgeId, showNotification, setStatus);
  const multi = useMultiController(bridgeId, filter, showNotification, setAllStatus);
  useEffect(() => {
    if ((deviceAction.deviceId === null && deviceAction.action === null) || deviceAction.pending) return;
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
        case "browsers_close": {
          single.closeBrowsers({
            bridgeId,
            deviceId: deviceAction.deviceId
          }).catch(logger.error);
          break;
        }
      }
    }
  }, [deviceAction, curInfo?.type]);
};