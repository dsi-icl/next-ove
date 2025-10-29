import { screen } from "electron";
import si from "systeminformation";
import { assert } from "@ove/ove-utils";

export type Display = {
  screenId: number;
  graphicDisplayId: string | null;
  graphicDeviceName: string | null;
  id: number;
  serial: string | null;
};

export const displays: Display[] = [];

export const resolveDisplays = async () => {
  const screens = screen.getAllDisplays();
  const displays_ = (await si.graphics()).displays;

  screens.forEach((screen, i) => {
    const display = displays_.find((display) => {
      return (
        display.positionX === screen.bounds.x &&
        display.positionY === screen.bounds.y &&
        (display.currentResX === screen.bounds.width ||
          display.resolutionX === screen.bounds.width) &&
        (display.currentResY === screen.bounds.height ||
          display.resolutionY === screen.bounds.height)
      );
    });
    if (display === undefined) return;

    displays.push({
      screenId: screen.id,
      graphicDisplayId: display.displayId,
      graphicDeviceName: display.deviceName,
      id: i,
      serial: display.serial,
    });
  });

  console.log(displays);
};

export const getDisplay = (uid: number) => assert(displays.find((display) => display.id === uid));
export const getDisplayByScreenId = (screenId: number) => assert(displays.find((display) => display.screenId === screenId));
export const getDisplayByDisplayId = (displayId: string) => assert(displays.find((display) => display.graphicDisplayId === displayId));
export const getDisplayByDeviceName = (deviceName: string) => assert(displays.find((display) => display.graphicDeviceName === deviceName));
