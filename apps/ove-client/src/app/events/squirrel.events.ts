/**
 * This module is responsible on handling all the
 * setup events that are submitted by squirrel.
 */
/* global process, setTimeout */

import { app } from "electron";
import { spawn } from "child_process";
import { resolve, join, basename } from "path";

// noinspection JSUnusedGlobalSymbols
/**
 * Squirrel Events
 */
export default class SquirrelEvents {
  private static isAppFirstRun = false;

  // app paths
  private static appFolder = resolve(process.execPath, "..");
  private static appRootFolder = resolve(SquirrelEvents.appFolder, "..");
  private static updateExe = resolve(
    join(SquirrelEvents.appRootFolder, "Update.exe")
  );
  private static exeName = resolve(
    join(
      SquirrelEvents.appRootFolder,
      "app-" + app.getVersion(),
      basename(process.execPath)
    )
  );

  /**
   * Handles events
   * @return {boolean}
   */
  static handleEvents(): boolean {
    if (process.argv.length === 1 || process.platform !== "win32") {
      return false;
    }

    // noinspection SpellCheckingInspection
    switch (process.argv[1]) {
      case "--squirrel-install":
      case "--squirrel-updated":
        // Install desktop and start menu shortcuts
        SquirrelEvents.update(["--createShortcut", SquirrelEvents.exeName]);

        return true;

      case "--squirrel-uninstall":
        // Remove desktop and start menu shortcuts
        SquirrelEvents.update(["--removeShortcut", SquirrelEvents.exeName]);

        return true;

      case "--squirrel-obsolete":
        app.quit();
        return true;

      case "--squirrel-firstrun":
        // Check if it is the first run of the software
        SquirrelEvents.isAppFirstRun = true;
        return false;
    }

    return false;
  }

  /**
   * If it is the first run of the app
   * @return {boolean}
   */
  static isFirstRun(): boolean {
    return SquirrelEvents.isAppFirstRun;
  }

  /**
   * Update event
   * @param {Array<string>} args
   * @private
   */
  private static update(args: Array<string>) {
    try {
      spawn(SquirrelEvents.updateExe, args, { detached: true }).on(
        "close",
        () => setTimeout(app.quit, 1000)
      );
    } catch (error) {
      setTimeout(app.quit, 1000);
    }
  }
}
