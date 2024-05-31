/* global process */
// noinspection DuplicatedCode

import { logger } from "../../env";
import { Json } from "@ove/ove-utils";
import { app, dialog } from "electron";
import { autoUpdater } from "electron-updater";

export default () => {
  if (!app.isPackaged) {
    return () => logger.info("Auto update skipped");
  }

  autoUpdater.on("update-downloaded", info => {
    const dialogOpts = {
      type: "info" as "info" | "error" | "none" |
        "question" | "warning" | undefined,
      buttons: ["Restart", "Later"],
      title: "Application Update",
      message:
        process.platform === "win32" ?
          Json.stringify(info.releaseNotes) : Json.stringify(info.releaseName),
      detail: `A new version, released on ${info.releaseDate}, 
          has been downloaded. Restart the application to apply the updates.`
    };

    dialog.showMessageBox(dialogOpts).then(({ response }) => {
      if (response === 0) autoUpdater.quitAndInstall();
    });
  });

  autoUpdater.on("checking-for-update", () => {
    logger.info("Checking for updates...\n");
  });

  autoUpdater.on("update-available", () => {
    logger.info("New update available!\n");
  });

  autoUpdater.on("update-not-available", () => {
    logger.info("Up to date!\n");
  });

  autoUpdater.on("error", message => {
    logger.error("There was a problem updating the application");
    logger.error(message, "\n");
  });
  return () =>
    autoUpdater
      .checkForUpdates()
      .then(info =>
        logger.info(`Updating: ${Json.stringify(info?.updateInfo)}`)
      );
};
