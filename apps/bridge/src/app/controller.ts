import * as fs from "fs";

const hardware = JSON.parse(fs.readFileSync(`${__dirname}/assets/hardware.json`).toString());

const devices = () => hardware;

export {
  devices
};
