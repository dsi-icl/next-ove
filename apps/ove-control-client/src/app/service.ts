import si from "./system-info";
import sc from "./system-control";

const SystemInfo = si();
const SystemControl = sc();

export const getInfoGeneral = SystemInfo.general;
export const getInfoSystem = SystemInfo.system;
export const getInfoCPU = SystemInfo.cpu;
export const getInfoMemory = SystemInfo.memory;
export const getInfoBattery = SystemInfo.battery;
export const getInfoGraphics = SystemInfo.graphics;
export const getInfoOS = SystemInfo.fs;
export const getInfoProcesses = SystemInfo.processes;
export const getInfoFS = SystemInfo.fs;
export const getInfoUSB = SystemInfo.usb;
export const getInfoPrinter = SystemInfo.printer;
export const getInfoAudio = SystemInfo.audio;
export const getInfoNetwork = SystemInfo.network;
export const getInfoWifi = SystemInfo.wifi;
export const getInfoBluetooth = SystemInfo.bluetooth;
export const getInfoDocker = SystemInfo.docker;
export const shutdown = SystemControl.shutdown;
export const reboot = SystemControl.reboot;
export const execute = SystemControl.execute;
