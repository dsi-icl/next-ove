import { autoUpdater } from "electron-updater";

export default () => {
  autoUpdater.on("update-available", () => {
    autoUpdater.quitAndInstall();
  });
};
