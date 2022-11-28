/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as fs from "fs";
import {io} from "socket.io-client";
import { environment } from "./environments/environment";

const hardware = JSON.parse(fs.readFileSync(`${__dirname}/assets/hardware.json`).toString());

const socket = io(`ws://${environment.core}/hardware`);
console.log(`Testing: ${environment.core}`);

socket.on('connect', () => {
  console.log('Connected');
  console.log(socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected');
  console.log(socket.id);
});

socket.on('spaces', callback => {
  console.log('Loading spaces');
  const spaces = JSON.parse(fs.readFileSync(`${__dirname}/assets/spaces.json`).toString());
  callback(spaces);
});

socket.on('hardware', callback => {
  console.log('Loading hardware');
  callback(hardware);
});

// socket.on('hardware/general', async (callback) => {
//   console.log('Getting general hardware information');
//   console.log(hardware);
//
//   await Promise.all(hardware.map(device => {
//
//   }))
//
//   callback(hardware);
// });

socket.on('connect_error', err => console.log(`connect_error due to ${err.message}`));
