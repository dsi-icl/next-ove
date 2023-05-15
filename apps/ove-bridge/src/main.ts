/* global console */

import App from "./app/app";
import { app, BrowserWindow, screen } from "electron";
import SquirrelEvents from "./app/events/squirrel.events";
import { bootstrapElectronEvents } from "./app/events/electron.events";
import { env, fileSetup, initHardware } from "@ove/ove-bridge-lib";
import { exists, toAsset } from "@ove/file-utils";
import * as path from "path";
import { generateKeyPair } from "crypto";

const initAuth = () => {
  if (!exists(path.join(__dirname, "assets", "private_key"))) {
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
    });
  }
};

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

initAuth();

initialize();
bootstrapApp();
bootstrapEvents();

console.log(`testing env: ${env.CORE_URL}`);

initHardware();
