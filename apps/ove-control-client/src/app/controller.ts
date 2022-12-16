import * as service from "./service";

export const getStatus = (req, res) => {
  res.send({"status": "running"});
}

export const getInfo = async (req, res) => {
  const type: string = req.query.type;

  if (type && type.match(/^system|cpu|memory|battery|graphics|os|processes|fs|usb|printer|audio|network|wifi|bluetooth|docker$/gi) === null) {
    res.sendStatus(400).send({error: `Unknown type: ${type}`});
    return;
  }

  switch (type) {
    case "system":
      res.send(await service.getInfoSystem());
      break;
    case "cpu":
      res.send(await service.getInfoCPU());
      break;
    case "memory":
      res.send(await service.getInfoMemory());
      break;
    case "battery":
      res.send(await service.getInfoBattery());
      break;
    case "graphics":
      res.send(await service.getInfoGraphics());
      break;
    case "os":
      res.send(await service.getInfoOS());
      break;
    case "processes":
      res.send(await service.getInfoProcesses());
      break;
    case "fs":
      res.send(await service.getInfoFS());
      break;
    case "usb":
      res.send(await service.getInfoUSB());
      break;
    case "printer":
      res.send(await service.getInfoPrinter());
      break;
    case "audio":
      res.send(await service.getInfoAudio());
      break;
    case "network":
      res.send(await service.getInfoNetwork());
      break;
    case "wifi":
      res.send(await service.getInfoWifi());
      break;
    case "bluetooth":
      res.send(await service.getInfoBluetooth());
      break;
    case "docker":
      res.send(await service.getInfoDocker());
      break;
    default:
      res.send(service.getInfoGeneral());
      break;
  }
};

export const shutdown = (req, res) => {
  service.shutdown();
  res.send({});
};

export const reboot = (req, res) => {
  service.reboot();
  res.send({});
};

export const execute = (req, res) => {
  if (!req.body.command) {
    res.sendStatus(400).send({error: 'No command provided'});
  }
  service.execute(req.body.command, (result) => res.send(result));
};
