/* global console */

import App from "./app/app";
import { app, BrowserWindow, screen } from "electron";
import SquirrelEvents from "./app/events/squirrel.events";
import { bootstrapElectronEvents } from "./app/events/electron.events";
import { fileSetup, initHardware } from "@ove/ove-bridge-lib";
import { exists, toAsset } from "@ove/file-utils";
import * as path from "path";
import { generateKeyPair } from "crypto";

const initAuth = () =>
  new Promise(resolve => {
    if (exists(path.join(__dirname, "assets", "private_key"))) {
      resolve(true);
      return;
    }
    generateKeyPair("rsa", {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: "spki",
        format: "pem"
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
        cipher: "aes-256-cbc",
        passphrase: "top secret"
      }
    }, (err, publicKey, privateKey) => {
      // Handle errors and use the generated key pair.
      if (err) throw err;
      toAsset("public_key", publicKey);
      toAsset("private_key", privateKey);
      resolve(true);
    });
  });

const initialize = () => {
  if (!SquirrelEvents.handleEvents()) return;
  app.quit();
};

const bootstrapApp = () => {
  App.init(app, BrowserWindow, screen);
};

const bootstrapEvents = () => {
  bootstrapElectronEvents();
};

fileSetup();

initAuth().then(() => {
  initialize();
  bootstrapApp();
  bootstrapEvents();

  initHardware();
});
