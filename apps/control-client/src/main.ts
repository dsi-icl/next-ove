/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from 'express';
import * as path from 'path';
import * as si from "systeminformation";

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to control-client!' });
});

app.get('/info/general', (req, res) => {
  res.send({"version": si.version(), "time": si.time()});
});

app.get("/info/system", async (req, res) => {
  res.send({
    "general": await si.system(),
    "bios": await si.bios(),
    "baseboard": await si.baseboard(),
    "chassis": await si.chassis()
  });
});

app.get("/info/cpu", async (req, res) => {
  res.send({
    "general": await si.cpu(),
    "flags": await si.cpuFlags(),
    "cache": await si.cpuCache(),
    "currentSpeed": await si.cpuCurrentSpeed(),
    "temperature": await si.cpuTemperature()
  });
});

app.get("/info/memory", async (req, res) => {
  res.send({
    "general": await si.mem(),
    "layout": await si.memLayout()
  });
});

app.get("/info/battery", async (req, res) => {
  res.send({
    "general": await si.battery()
  });
});

app.get('/info', async (req, res) => {
  res.send({
    // cpus: os.cpus().length,
    // freeMemory: os.freemem(),
    // maxMemory: os.totalmem(),
    // fileSystem: diskInfo.map(disk => ({
    //   name: disk.filesystem,
    //   mount: disk.mounted,
    //   totalSpace: disk.blocks,
    //   freeSpace: disk.blocks - disk.available,
    //   usableSpace: disk.available
    // })),
    // platform: os.platform(),
    // type: os.type(),
    // version: os.version(),
    // arch: os.arch(),
    // release: os.release(),
    // userName: userInfo.username,
    // userHome: userInfo.homedir,
    // userShell: userInfo.shell,
    // pwd: process.cwd(),
    "general": {
      "version": si.version(),
      "time": si.time()
    },
    "system": {
      "general": await si.system(),
      "bios": await si.bios(),
      "baseboard": await si.baseboard(),
      "chassis": await si.chassis()
    },
    "cpu": {
      "general": await si.cpu(),
      "flags": await si.cpuFlags(),
      "cache": await si.cpuCache(),
      "currentSpeed": await si.cpuCurrentSpeed(),
      "temperature": await si.cpuTemperature()
    },
    "memory": {
      "general": await si.mem(),
      "layout": await si.memLayout()
    },
    "battery": {
      "general": await si.battery()
    },
    "graphics": {
      "general": await si.graphics()
    },
    "os": {
      "general": await si.osInfo(),
      "uuid": await si.uuid(),
      "versions": await si.versions(),
      "shell": await si.shell(),
      "users": await si.users()
    },
    "processes": {
      "currentLoad": await si.currentLoad(),
      "fullLoad": await si.fullLoad(),
      "processes": await si.processes()
    },
    "fs": {
      "diskLayout": await si.diskLayout(),
      "blockDevices": await si.blockDevices(),
      "disksIO": await si.disksIO(),
      "fsSize": await si.fsSize(),
      "fsOpenFiles": await si.fsOpenFiles(),
      "fsStats": await si.fsStats()
    },
    "usb": {
      "general": await si.usb()
    },
    "printer": {
      "general": await si.printer()
    },
    "audio": {
      "general": await si.audio()
    },
    "network": {
      "interfaces": await si.networkInterfaces(),
      "interfaceDefault": await si.networkInterfaceDefault(),
      "gatewayDefault": await si.networkGatewayDefault(),
      "stats": await si.networkStats(),
      "connections": await si.networkConnections(),
      "inetChecksite": await si.inetChecksite("www.google.com"),
      "inetLatency": await si.inetLatency()
    },
    "wifi": {
      "networks": await si.wifiNetworks(),
      "interfaces": await si.wifiInterfaces(),
      "connections": await si.wifiConnections()
    },
    "bluetooth": {
      "devices": await si.bluetoothDevices()
    },
    "docker": {
      "general": await si.dockerInfo(),
      "images": await si.dockerImages(),
      "containers": await si.dockerContainers(),
      "containerStats": await si.dockerContainerStats(),
      "containerProcesses": await si.dockerContainerProcesses(),
      "volumes": await si.dockerVolumes()
    }
  });
});

const port = process.env.port || 3335;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);
