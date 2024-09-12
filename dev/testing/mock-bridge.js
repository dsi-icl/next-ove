/* global Buffer */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const z = require('zod').z;
const io = require('socket.io-client').io;
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env') });

const devices = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'devices.json')).toString());
const geometry = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'geometry.json')).toString());

const env = z.object({
  CORE_URL: z.string(),
  SOCKET_USERNAME: z.string(),
  SOCKET_PASSWORD: z.string(),
  CORE_API_VERSION: z.string()
}).parse(process.env);

const bridgeSocket = io(`${env.CORE_URL}/socket/bridge`, {
  auth: {
    username: env.SOCKET_USERNAME,
    password: env.SOCKET_PASSWORD
  },
  path: `/${env.CORE_API_VERSION}`
});

bridgeSocket.on('connect', () => console.log('Bridge socket connected'));
bridgeSocket.on('connect_error', err => console.error(err.message));
bridgeSocket.onAny((event, args) => console.log(`Bridge socket received ${event}`, args));

bridgeSocket.on('getGeometry', (args, callback) => callback({
  meta: {
    bridge: env.SOCKET_USERNAME
  },
  response: geometry
}));

bridgeSocket.on('getDevices', (args, callback) => callback({
  meta: {
    bridge: process.env.SOCKET_USERNAME
  },
  response: devices
}));

bridgeSocket.on('getStreams', (args, callback) => callback({
  meta: {
    bridge: process.env.SOCKET_USERNAME
  },
  response: [`http://localhost:${process.env.PORT}/CAMERA1.html`, `http://localhost:${process.env.PORT}/CAMERA2.html`]
}));

const hardwareSocket = io(`${process.env.CORE_URL}/socket/hardware`, {
  auth: {
    username: env.SOCKET_USERNAME,
    password: env.SOCKET_PASSWORD
  },
  path: `/${env.CORE_API_VERSION}`
});

hardwareSocket.on('connect', () => console.log('Hardware socket connected'));
hardwareSocket.on('connect_error', err => console.error(err.message));
hardwareSocket.onAny((event, args) => console.log(`Hardware received ${event}`, args));

hardwareSocket.on('getWindowConfig', (args, callback) => callback({
  meta: {
    bridge: process.env.SOCKET_USERNAME
  },
  response: {}
}));

hardwareSocket.on('getBrowsers', (args, callback) => callback({
  meta: {
    bridge: process.env.SOCKET_USERNAME
  },
  response: {}
}));

hardwareSocket.on('getStatusAll', (args, callback) => callback({
  meta: {
    bridge: process.env.SOCKET_USERNAME
  },
  response: devices.map(({id}) => ({deviceId: id, response: "on"}))
}));

const screenshots = Array.from({length: 8}).slice(0, 2).map((_x, i) => Buffer.from(fs.readFileSync(path.join(__dirname, 'data', 'screens', `screen-${i + 1}.png`)), 'binary').toString('base64'));

hardwareSocket.on('screenshot', (args, callback) => {
  const screenshotId = parseInt(geometry.displays.find(({renderer: {deviceId}}) => deviceId === args.deviceId).displayId.slice(-1));
  callback({
    meta: {
      bridge: process.env.SOCKET_USERNAME
    },
    response: [screenshots[screenshotId - 1]]
  });
});

const app = express();

const port = process.env.PORT;

app.use(bodyParser.json());
app.use(cors());

app.use(express.static(path.join(__dirname, '..', 'services', 'static', 'public')));

app.listen(port, () => {
  console.log(`Mock renderer listening on port ${port}`);
});
