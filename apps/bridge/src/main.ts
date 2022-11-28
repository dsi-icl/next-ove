/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import {io} from "socket.io-client";
import { environment } from "./environments/environment";
import * as controller from "./app/controller";

const socket = io(`ws://${environment.core}/hardware`, {autoConnect: false});
socket.auth = {"name": "test"};
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
  if (!url) {
    callback("Matched /");
  }

  let match;

  switch (url) {
    case url.match(/^\/devices$/i)?.input:
      callback({"bridge-id": socket.id, "data": controller.devices()});
      return;
    case (match = url.match(/^\/device\/([0-9]+)$/i))?.input:
      console.log(JSON.stringify(parseInt(match[1])));
      callback('Matched hardware general');
      return;
    default:
      throw Error(`Unknown URL: ${url}`);
  }
});

socket.on('connect_error', err => console.log(`connect_error due to ${err.message}`));
