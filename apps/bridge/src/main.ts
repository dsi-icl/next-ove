/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import {io} from "socket.io-client";
import { environment } from "./environments/environment";
import * as controller from "./app/controller";

const wrapCallback = f => data => f({ "bridge-id": environment.name, "data": data });

const socket = io(`ws://${environment.core}/hardware`, {autoConnect: false});
socket.auth = {"name": `${environment.name}`};
socket.connect();
console.log(`Testing: ${environment.core}`);

socket.on('connect', () => {
  console.log('Connected');
  console.log(socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected');
  console.log(socket.id);
});

socket.on("message", (url, type, callback) => {
  callback = wrapCallback(callback);
  if (!url) {
    callback("Matched /");
  }

  let match;
  console.log(url);

  switch (url) {
    case url.match(/^\/devices$/i)?.input:
      callback(controller.devices());
      return;
    case (match = url.match(/^\/devices\/(.+)$/i))?.input: {
      callback(controller.devices(match[1]));
      return;
    }
    case (match = url.match(/^\/device\/([0-9]+)$/i))?.input:
      callback(controller.device(match[1]));
      return;
    default:
      throw Error(`Unknown URL: ${url}`);
  }
});

socket.on('connect_error', err => console.log(`connect_error due to ${err.message}`));
