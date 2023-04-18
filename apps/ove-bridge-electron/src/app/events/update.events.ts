/* global console, process */

import { app, autoUpdater, dialog, type FeedURLOptions } from "electron";
import { platform, arch } from "os";
import { updateServerUrl } from "../constants";
import App from "../app";

export default (() => {
  const checkForUpdates = () => {
    if (!App.isDevelopmentMode() && autoUpdater.getFeedURL() !== "") {
      autoUpdater.checkForUpdates();
    }
  };

  const initAutoUpdateService = () => {
    const platformArch =
      platform() === "win32" ? platform() : platform() + "_" + arch();
    const version = app.getVersion();
    const feed: FeedURLOptions = {
      url: `${updateServerUrl}/update/${platformArch}/${version}`
    };

    if (!App.isDevelopmentMode()) {
      console.log("Initializing auto update service...\n");

      autoUpdater.setFeedURL(feed);
      checkForUpdates();
    }
  };

  return {
    checkForUpdates,
    initAutoUpdateService
  };
})();

autoUpdater.on(
  "update-downloaded",
  (event, releaseNotes, releaseName, releaseDate) => {
    const dialogOpts = {
      type: "info",
      buttons: ["Restart", "Later"],
      title: "Application Update",
      message: process.platform === "win32" ? releaseNotes : releaseName,
      detail: `A new version, released on ${releaseDate.toUTCString()}, 
        has been downloaded. Restart the application to apply the updates.`
    };

    dialog.showMessageBox(dialogOpts).then(({ response }) => {
      if (response === 0) autoUpdater.quitAndInstall();
    });
  }
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

autoUpdater.on("before-quit-for-update", () => {
  console.log("Application update is about to begin...\n");
});

autoUpdater.on("error", message => {
  console.error("There was a problem updating the application");
  console.error(message, "\n");
});
