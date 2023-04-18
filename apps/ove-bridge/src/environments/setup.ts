import App from "../app/app";
import { initEnv } from "./env";
import { envPath, toAsset, writeEnv, safeFileDelete } from "../utils/utils";

export default () => {
  if (App.isDevelopmentMode()) {
    [
      `${__dirname}/.env`,
      `${__dirname}/assets/hardware.json`,
      `${__dirname}/assets/spaces.json`
    ].forEach(safeFileDelete);
  }

  const initialEnv = {
    CORE_URL: "localhost:3333",
    BRIDGE_NAME: "main"
  };

  const exampleHardware = [{
    id: "0",
    description: "Test hardware",
    ip: "localhost",
    port: 3335,
    protocol: "node",
    mac: "example:example:example",
    tags: ["test"]
  }];

  const exampleSpaces = {
    LocalFour: {
      id: 0,
      devices: ["0"],
      displays: [{ x: 0, y: 0, w: 1920, h: 1080 }]
    }
  };

  writeEnv(initialEnv, false);
  initEnv(envPath);

  toAsset("hardware.example.json", exampleHardware, false);
  toAsset("hardware.json", [], false);
  toAsset("spaces.example.json", exampleSpaces, false);
  toAsset("spaces.json", {}, false);
};