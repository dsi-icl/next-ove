/* global process */
// noinspection DuplicatedCode

import { logger } from "@ove/ove-bridge-base";
import { assert, Json } from "@ove/ove-utils";
import { app, dialog } from "electron";
import { autoUpdater } from "electron-updater";

export default () => {
  if (!app.isPackaged) {
    return () => assert(logger).info("Auto update skipped");
  }

  autoUpdater.on("update-downloaded", (info) => {
    const dialogOpts = {
      type: "info" as
        | "info"
        | "error"
        | "none"
        | "question"
        | "warning"
        | undefined,
      buttons: ["Restart", "Later"],
      title: "Application Update",
      message:
        process.platform === "win32"
          ? Json.stringify(info.releaseNotes)
          : Json.stringify(info.releaseName),
      detail: `A new version, released on ${info.releaseDate}, 
          has been downloaded. Restart the application to apply the updates.`,
    };

    dialog.showMessageBox(dialogOpts).then(({ response }) => {
      if (response === 0) autoUpdater.quitAndInstall();
    });
  });

  autoUpdater.on("checking-for-update", () => {
    assert(logger).info("Checking for updates...\n");
  });

  autoUpdater.on("update-available", () => {
    assert(logger).info("New update available!\n");
  });

  autoUpdater.on("update-not-available", () => {
    assert(logger).info("Up to date!\n");
  });

  autoUpdater.on("error", (message) => {
    assert(logger).error("There was a problem updating the application");
    assert(logger).error(message, "\n");
  });
  return () =>
    autoUpdater
      .checkForUpdates()
      .then((info) =>
        assert(logger).info(`Updating: ${Json.stringify(info?.updateInfo)}`),
      );
};
