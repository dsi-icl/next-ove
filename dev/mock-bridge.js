const io = require('socket.io-client').io;
const dotenv = require('dotenv');

dotenv.config();

const bridgeSocket = io(`${process.env.CORE_URL}/bridge`, {
  autoConnect: false
});

bridgeSocket.auth = {
  username: process.env.SOCKET_USERNAME,
  password: process.env.SOCKET_PASSWORD
};

console.log(process.env.SOCKET_USERNAME, process.env.SOCKET_PASSWORD);

bridgeSocket.on('connect', () => console.log('Connected'));
bridgeSocket.on('connect_error', err => console.error(err.message));
bridgeSocket.onAny((event, args) => console.log(`Received ${event}`, args));

bridgeSocket.on('getGeometry', (args, callback) => callback({
  meta: {
    bridge: process.env.SOCKET_USERNAME
  },
  response: {
    'width': 32,
    'height': 9,
    'rows': 1,
    'columns': 2,
    'displays': [
      {
        'displayId': 'test-screen',
        'renderer': {
          'deviceId': 'test-dev',
          'displayId': '1'
        },
        'row': 1,
        'column': 1
      },
      {
        'displayId': 'test-screen',
        'renderer': {
          'deviceId': 'test-dev',
          'displayId': '2'
        },
        'row': 1,
        'column': 2
      }
    ]
  }
}));

const hardwareSocket = io(`${process.env.CORE_URL}/hardware`, {
  autoConnect: false
});

hardwareSocket.auth = {
  username: process.env.SOCKET_USERNAME,
  password: process.env.SOCKET_PASSWORD
};

hardwareSocket.on('connect', () => console.log('Connected'));
hardwareSocket.on('connect_error', err => console.error(err.message));
hardwareSocket.onAny((event, args) => console.log(`Received ${event}`, args));

hardwareSocket.on("getDevices", (args, callback) => callback({
  meta: {
    bridge: process.env.SOCKET_USERNAME
  },
  response: []
}));

hardwareSocket.on("getWindowConfig", (args, callback) => callback({
  meta: {
    bridge: process.env.SOCKET_USERNAME
  },
  response: {}
}));

hardwareSocket.on("getBrowsers", (args, callback) => callback({
  meta: {
    bridge: process.env.SOCKET_USERNAME
  },
  response: {}
}));

hardwareSocket.on("getStatusAll", (args, callback) => callback({
  meta: {
    bridge: process.env.SOCKET_USERNAME
  },
  response: []
}));

hardwareSocket.on("screenshot", (args, callback) => callback({
  meta: {
    bridge: process.env.SOCKET_USERNAME
  },
  response: []
}))

bridgeSocket.connect();
hardwareSocket.connect();
