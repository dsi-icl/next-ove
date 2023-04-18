import {
  ClientToServerEvents,
  BridgeAPI,
  BridgeResponse
} from "@ove/ove-types";
import * as Service from "./service";
import { env } from "../../environments/env";
import { io, Socket } from "socket.io-client";

export default () => {
  const wrapCallback = <T>(callback: (response: BridgeResponse<T>) => void) =>
    (response: T) => callback({ response, meta: { bridge: env.BRIDGE_NAME } });

  const socket: Socket<BridgeAPI, ClientToServerEvents> = io(`ws://${env.CORE_URL}/hardware`, { autoConnect: false });
  socket.auth = { "name": `${env.BRIDGE_NAME}` };
  socket.connect();
  console.log(`Testing: ${env.CORE_URL}`);

  socket.on("connect", () => {
    console.log("Connected");
    console.log(socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected");
    console.log(socket.id);
  });

  socket.on("getDevice", async ({ deviceId }, cb) => {
    const callback = wrapCallback(cb);
    callback(Service.getDevice(deviceId));
  });

  socket.on("getDevices", async (args, cb) => {
    const callback = wrapCallback(cb);
    callback(Service.getDevices());
  });

  socket.on("getStatusAll", async ({ tag }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.getStatusAll(tag));
  });

  socket.on("getStatus", async ({ deviceId }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.getStatus(deviceId));
  });

  socket.on("getInfo", async ({ deviceId, type }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.getInfo(deviceId, type));
  });

  socket.on("getInfoAll", async ({ tag, type }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.getInfoAll(tag, type));
  });

  socket.on("getBrowserStatus", async ({ deviceId, browserId }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.getBrowserStatus(deviceId, browserId));
  });

  socket.on("getBrowserStatusAll", async ({ tag, browserId }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.getBrowserStatusAll(browserId, tag));
  });

  socket.on("getBrowsers", async ({ deviceId }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.getBrowsers(deviceId));
  });

  socket.on("getBrowsersAll", async ({ tag }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.getBrowsersAll(tag));
  });

  socket.on("start", async ({ deviceId }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.start(deviceId));
  });

  socket.on("startAll", async ({ tag }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.startAll(tag));
  });

  socket.on("reboot", async ({ deviceId }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.reboot(deviceId));
  });

  socket.on("rebootAll", async ({ tag }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.rebootAll(tag));
  });

  socket.on("shutdown", async ({ deviceId }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.shutdown(deviceId));
  });

  socket.on("shutdownAll", async ({ tag }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.shutdownAll(tag));
  });

  socket.on("execute", async ({ deviceId, command }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.execute(deviceId, command));
  });

  socket.on("executeAll", async ({ tag, command }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.executeAll(command, tag));
  });

  socket.on("screenshot", async ({ deviceId, method, screens }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.screenshot(deviceId, method, screens));
  });

  socket.on("screenshotAll", async ({
    tag,
    method,
    screens
  }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.screenshotAll(method, screens, tag));
  });

  socket.on("openBrowser", async ({ deviceId, displayId }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.openBrowser(deviceId, displayId));
  });

  socket.on("openBrowserAll", async ({ tag, displayId }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.openBrowserAll(displayId, tag));
  });

  socket.on("addDevice", async ({ device }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.addDevice(device));
  });
//
  socket.on("setVolume", async ({ deviceId, volume }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.setVolume(deviceId, volume));
  });

  socket.on("setVolumeAll", async ({ volume, tag }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.setVolumeAll(volume, tag));
  });

  socket.on("setSource", async ({ deviceId, source, channel }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.setSource(deviceId, source, channel));
  });

  socket.on("setSourceAll", async ({ source, channel, tag }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.setSourceAll(source, channel, tag));
  });

  socket.on("mute", async ({ deviceId }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.mute(deviceId));
  });

  socket.on("muteAll", async ({ tag }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.muteAll(tag));
  });

  socket.on("unmute", async ({ deviceId }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.unmute(deviceId));
  });

  socket.on("unmuteAll", async ({ tag }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.unmuteAll(tag));
  });

  socket.on("muteAudio", async ({ deviceId }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.muteAudio(deviceId));
  });

  socket.on("muteAudioAll", async ({ tag }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.muteAudioAll(tag));
  });

  socket.on("unmuteAudio", async ({ deviceId }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.unmuteAudio(deviceId));
  });

  socket.on("unmuteAudioAll", async ({ tag }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.unmuteAudioAll(tag));
  });

  socket.on("muteVideo", async ({ deviceId }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.muteVideo(deviceId));
  });

  socket.on("muteVideoAll", async ({ tag }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.muteVideoAll(tag));
  });

  socket.on("unmuteVideo", async ({ deviceId }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.unmuteVideo(deviceId));
  });

  socket.on("unmuteVideoAll", async ({ tag }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.unmuteVideoAll(tag));
  });

  socket.on("closeBrowser", async ({ deviceId, browserId }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.closeBrowser(deviceId, browserId));
  });

  socket.on("closeBrowserAll", async ({ tag, browserId }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.closeBrowserAll(browserId, tag));
  });

  socket.on("closeBrowsers", async ({ deviceId }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.closeBrowsers(deviceId));
  });

  socket.on("closeBrowsersAll", async ({ tag }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.closeBrowsersAll(tag));
  });

  socket.on("removeDevice", async ({ deviceId }, cb) => {
    const callback = wrapCallback(cb);
    callback(await Service.removeDevice(deviceId));
  });

  socket.on("connect_error", err =>
    console.error(`connect_error due to ${err.message}`));
}