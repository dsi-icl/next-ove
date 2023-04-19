/* global console, process */
// noinspection DuplicatedCode

import { autoUpdater } from "electron-updater";

export default () => {
  autoUpdater.on(
    "update-downloaded",
    () => autoUpdater.quitAndInstall()
  );

  autoUpdater.on("checking-for-update", () => {
    console.log("Checking for updates...\n");
  });

  autoUpdater.on("update-available", () => {
    console.log("New update available!\n");
  });

  autoUpdater.on("update-not-available", () => {
    console.log("Up to date!\n");
  });

  autoUpdater.on("error", message => {
    console.error("There was a problem updating the application");
    console.error(message, "\n");
  });
  return () => autoUpdater.checkForUpdates()
    .then(info =>
      console.log(`Updating: ${JSON.stringify(info?.updateInfo)}`));
};
