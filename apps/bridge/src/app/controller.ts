import * as fs from "fs";

const hardware = JSON.parse(fs.readFileSync(`${__dirname}/assets/hardware.json`).toString());

const devices = (tag?: string) => {
  if (!tag) {
    return hardware;
  } else {
    return hardware.filter(x => x.tags.includes(tag));
  }
};

const device = (id: string) => hardware.find(x => x.id === id);

export {
  devices,
  device
};
