import { app, BrowserWindow, desktopCapturer } from "electron";
import App from "./app/app";
import { logger } from "./control/utils";

export const createWindow = (displayId?: number) => {
  if (!app.isReady()) return;
  logger.info("Creating Window");
  App.main(app, BrowserWindow, displayId);
};

export const screenshot = async () => {
  return desktopCapturer.getSources({ types: ['screen'] });
};
