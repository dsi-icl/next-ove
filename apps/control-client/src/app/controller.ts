import * as service from "./service";

const getInfoGeneral = (req, res) => {
  res.send(service.getInfoGeneral());
};

const getInfoSystem = async (req, res) => {
  res.send(await service.getInfoSystem());
};

const getInfoCPU = async (req, res) => {
  res.send(await service.getInfoCPU());
};

const getInfoMemory = async (req, res) => {
  res.send(await service.getInfoMemory());
};

const getInfoBattery = async (req, res) => {
  res.send(await service.getInfoBattery());
};

const getInfoGraphics = async (req, res) => {
  res.send(await service.getInfoGraphics());
};

const getInfoOS = async (req, res) => {
  res.send(await service.getInfoOS());
};

const getInfoProcesses = async (req, res) => {
  res.send(await service.getInfoProcesses());
};

const getInfoFS = async (req, res) => {
  res.send(await service.getInfoFS());
};

const getStatus = (req, res) => {
  res.send({"status": "running"});
};

const getInfoUSB = async (req, res) => {
  res.send(await service.getInfoUSB());
};

const getInfoPrinter = async (req, res) => {
  res.send(await service.getInfoPrinter());
};

const getInfoAudio = async (req, res) => {
  res.send(await service.getInfoAudio());
};

const getInfoNetwork = async (req, res) => {
  res.send(await service.getInfoNetwork());
};

const getInfoWifi = async (req, res) => {
  res.send(await service.getInfoWifi());
};

const getInfoBluetooth = async (req, res) => {
  res.send(await service.getInfoBluetooth());
};

const getInfoDocker = async (req, res) => {
  res.send(await service.getInfoDocker());
};

const shutdown = (req, res) => {
  service.shutdown();
  res.send({});
};

const reboot = (req, res) => {
  service.reboot();
  res.send({});
};

const openBrowser = async (req, res) => {
  await service.openBrowser();
  res.send({});
};

export {
  getInfoGeneral,
  getInfoSystem,
  getInfoCPU,
  getInfoMemory,
  getInfoBattery,
  getInfoGraphics,
  getInfoOS,
  getInfoProcesses,
  getInfoFS,
  getStatus,
  getInfoUSB,
  getInfoPrinter,
  getInfoAudio,
  getInfoNetwork,
  getInfoWifi,
  getInfoBluetooth,
  getInfoDocker,
  shutdown,
  reboot,
  openBrowser
};
