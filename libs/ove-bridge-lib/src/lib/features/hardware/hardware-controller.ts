/* global console */

import {
  ClientAPIKeys,
  DeviceServiceKeys,
  HardwareClientToServerEvents,
  HardwareServerToClientEvents,
} from '@ove/ove-types';
import { env } from '@ove/ove-bridge-lib';
import { io, Socket } from 'socket.io-client';
import { deviceHandler, multiDeviceHandler, Service } from './service';

export default () => {
  console.log(`connecting to - ws://${env.CORE_URL}/hardware`);
  const socket: Socket<
    HardwareServerToClientEvents,
    HardwareClientToServerEvents
  > = io(`ws://${env.CORE_URL}/hardware`, { autoConnect: false });
  socket.auth = { name: `${env.BRIDGE_NAME}` };
  socket.connect();
  console.log(`Testing: ${env.CORE_URL}`);

  socket.on('connect', () => {
    console.log('Connected');
    console.log(socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected');
    console.log(socket.id);
  });

  DeviceServiceKeys.forEach((k) => {
    socket.on(k, (args, callback) => Service[k](args, callback));
  });

  ClientAPIKeys.forEach((k) => {
    socket.on(k, (args, callback) => deviceHandler(k, args, callback));

    socket.on(`${k}All` as const, (args, callback) =>
      multiDeviceHandler(k, args, callback)
    );
  });

  socket.on('connect_error', (err) =>
    console.error(`connect_error due to ${err.message}`)
  );
  console.log('Hardware component started!');
};
