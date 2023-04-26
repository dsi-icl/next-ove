import { procedure, router } from "../trpc";
import { logger } from "../app";
import { io as SocketServer } from "../sockets";
import { HardwareServerToClientEvents, HardwareClientToServerEvents, CoreAPIRoutes } from "@ove/ove-types";
import { Namespace, Socket } from "socket.io";

const getSocket: (socketId: string) => Socket<HardwareClientToServerEvents, HardwareServerToClientEvents> =
  (socketId: string) => io.sockets.get(state.clients[socketId]);

const state = { clients: {} };
logger.info("Initialising Hardware");
const io: Namespace<HardwareClientToServerEvents, HardwareServerToClientEvents> =
  SocketServer.of("/hardware");

io.on("connection", socket => {
  logger.info(`${socket.id} connected via /hardware`);
  logger.debug(`Socket ID: ${socket.handshake.auth.name}`);
  state.clients = { ...state.clients, [socket.handshake.auth.name]: socket.id };
  logger.debug(JSON.stringify(state.clients));

  socket.on("disconnect", reason => {
    delete state.clients[socket.handshake.auth.name];
    logger.debug(JSON.stringify(state.clients));
    logger.info(`${socket.id} disconnected with reason: ${reason}`);
  });
});

export const hardwareRouter = router({
  getStatus: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/hardware/{bridgeId}/{deviceId}/status"
      }
    })
    .input(CoreAPIRoutes.getStatus.args)
    .output(CoreAPIRoutes.getStatus.bridge)
    .query(async ({
      input: {
        bridgeId,
        deviceId
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("getStatus", { deviceId }, resolve))),
  getStatusAll: procedure
    .meta({ openapi: { method: "GET", path: "/hardware/{bridgeId}/status" } })
    .input(CoreAPIRoutes.getStatusAll.args)
    .output(CoreAPIRoutes.getStatusAll.bridge)
    .query(async ({
      input: {
        bridgeId,
        tag
      }
    }) => {
      console.log(bridgeId);
      const response = await new Promise(resolve =>
        getSocket(bridgeId).emit("getStatusAll", { tag }, resolve))
      console.log(response);
      CoreAPIRoutes.getStatusAll.bridge.parse(response);
      return response;
    }),
  getInfo: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/hardware/{bridgeId}/{deviceId}/info"
      }
    })
    .input(CoreAPIRoutes.getInfo.args)
    .output(CoreAPIRoutes.getInfo.bridge)
    .query(async ({ input: { bridgeId, deviceId, type } }) =>
      new Promise(resolve => getSocket(bridgeId).emit("getInfo", {
        deviceId,
        type
      }, resolve))),
  getInfoAll: procedure
    .meta({ openapi: { method: "GET", path: "/hardware/{bridgeId}/info" } })
    .input(CoreAPIRoutes.getInfoAll.args)
    .output(CoreAPIRoutes.getInfoAll.bridge)
    .query(async ({ input: { bridgeId, tag, type } }) => {
      const response = await new Promise(resolve => getSocket(bridgeId).emit("getInfoAll", {
        tag,
        type
      }, resolve))
      console.log(response);
      return response;
      }),
  getBrowserStatus: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/hardware/{bridgeId}/{deviceId}/browser/{browserId}/status"
      }
    })
    .input(CoreAPIRoutes.getBrowserStatus.args)
    .output(CoreAPIRoutes.getBrowserStatus.bridge)
    .query(async ({
      input: {
        bridgeId,
        deviceId,
        browserId
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("getBrowserStatus", {
        deviceId,
        browserId
      }, resolve))),
  getBrowserStatusAll: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/hardware/{bridgeId}/browser/{browserId}/status"
      }
    })
    .input(CoreAPIRoutes.getBrowserStatusAll.args)
    .output(CoreAPIRoutes.getBrowserStatusAll.bridge)
    .query(async ({
      input: {
        bridgeId,
        tag,
        browserId
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("getBrowserStatusAll", {
        tag,
        browserId
      }, resolve))),
  getBrowsers: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/hardware/{bridgeId}/{deviceId}/browsers"
      }
    })
    .input(CoreAPIRoutes.getBrowsers.args)
    .output(CoreAPIRoutes.getBrowsers.bridge)
    .query(async ({
      input: {
        bridgeId,
        deviceId
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("getBrowsers", { deviceId }, resolve))),
  getBrowsersAll: procedure
    .meta({ openapi: { method: "GET", path: "/hardware/{bridgeId}/browsers" } })
    .input(CoreAPIRoutes.getBrowsersAll.args)
    .output(CoreAPIRoutes.getBrowsersAll.bridge)
    .query(async ({
      input: {
        bridgeId,
        tag
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("getBrowsersAll", { tag }, resolve))),
  addDevice: procedure
    .meta({ openapi: { method: "POST", path: "/hardware/{bridgeId}/device" } })
    .input(CoreAPIRoutes.addDevice.args)
    .output(CoreAPIRoutes.addDevice.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        device
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("addDevice", { device }, resolve))),
  start: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/hardware/{bridgeId}/{deviceId}/start"
      }
    })
    .input(CoreAPIRoutes.start.args)
    .output(CoreAPIRoutes.start.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        deviceId
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("start", { deviceId }, resolve))),
  startAll: procedure
    .meta({ openapi: { method: "POST", path: "/hardware/{bridgeId}/start" } })
    .input(CoreAPIRoutes.startAll.args)
    .output(CoreAPIRoutes.startAll.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        tag
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("startAll", { tag }, resolve))),
  reboot: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/hardware/{bridgeId}/{deviceId}/reboot"
      }
    })
    .input(CoreAPIRoutes.reboot.args)
    .output(CoreAPIRoutes.reboot.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        deviceId
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("reboot", { deviceId }, resolve))),
  rebootAll: procedure
    .meta({ openapi: { method: "POST", path: "/hardware/{bridgeId/reboot" } })
    .input(CoreAPIRoutes.rebootAll.args)
    .output(CoreAPIRoutes.rebootAll.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        tag
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("rebootAll", { tag }, resolve))),
  shutdown: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/hardware/{bridgeId}/{deviceId}/shutdown"
      }
    })
    .input(CoreAPIRoutes.shutdown.args)
    .output(CoreAPIRoutes.shutdown.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        deviceId
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("shutdown", { deviceId }, resolve))),
  shutdownAll: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/hardware/{bridgeId}/shutdown"
      }
    })
    .input(CoreAPIRoutes.shutdownAll.args)
    .output(CoreAPIRoutes.shutdownAll.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        tag
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("shutdownAll", { tag }, resolve))),
  execute: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/hardware/{bridgeId}/{deviceId}/execute"
      }
    })
    .input(CoreAPIRoutes.execute.args)
    .output(CoreAPIRoutes.execute.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        deviceId,
        command
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("execute", {
        deviceId,
        command
      }, resolve))),
  executeAll: procedure
    .meta({ openapi: { method: "POST", path: "/hardware/{bridgeId}/execute" } })
    .input(CoreAPIRoutes.executeAll.args)
    .output(CoreAPIRoutes.executeAll.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        tag,
        command
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("executeAll", {
        tag,
        command
      }, resolve))),
  screenshot: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/hardware/{bridgeId}/{deviceId}/screenshot"
      }
    })
    .input(CoreAPIRoutes.screenshot.args)
    .output(CoreAPIRoutes.screenshot.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        deviceId,
        method,
        screens
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("screenshot", {
        deviceId,
        method,
        screens
      }, resolve))),
  screenshotAll: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/hardware/{bridgeId}/screenshot"
      }
    })
    .input(CoreAPIRoutes.screenshotAll.args)
    .output(CoreAPIRoutes.screenshotAll.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        tag,
        method,
        screens
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("screenshotAll", {
        tag,
        method,
        screens
      }, resolve))),
  openBrowser: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/hardware/{bridgeId}/{deviceId}/browser"
      }
    })
    .input(CoreAPIRoutes.openBrowser.args)
    .output(CoreAPIRoutes.openBrowser.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        deviceId,
        displayId
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("openBrowser", {
        deviceId,
        displayId
      }, resolve))),
  openBrowserAll: procedure
    .meta({ openapi: { method: "POST", path: "/hardware/{bridgeId}/browser" } })
    .input(CoreAPIRoutes.openBrowserAll.args)
    .output(CoreAPIRoutes.openBrowserAll.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        tag,
        displayId
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("openBrowserAll", {
        tag,
        displayId
      }, resolve))),
  closeBrowser: procedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/hardware/{bridgeId}/{deviceId}/browser"
      }
    })
    .input(CoreAPIRoutes.closeBrowser.args)
    .output(CoreAPIRoutes.closeBrowser.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        deviceId,
        browserId
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("closeBrowser", {
        deviceId,
        browserId
      }, resolve))),
  closeBrowserAll: procedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/hardware/{bridgeId}/browser"
      }
    })
    .input(CoreAPIRoutes.closeBrowserAll.args)
    .output(CoreAPIRoutes.closeBrowserAll.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        tag,
        browserId
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("closeBrowserAll", {
        tag,
        browserId
      }, resolve))),
  closeBrowsers: procedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/hardware/{bridgeId}/{deviceId}/browsers"
      }
    })
    .input(CoreAPIRoutes.closeBrowsers.args)
    .output(CoreAPIRoutes.closeBrowsers.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        deviceId
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("closeBrowsers", { deviceId }, resolve))),
  closeBrowsersAll: procedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/hardware/{bridgeId}/browsers"
      }
    })
    .input(CoreAPIRoutes.closeBrowsersAll.args)
    .output(CoreAPIRoutes.closeBrowsersAll.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        tag
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("closeBrowsersAll", { tag }, resolve))),
  setVolume: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/hardware/{bridgeId}/{deviceId}/volume"
      }
    })
    .input(CoreAPIRoutes.setVolume.args)
    .output(CoreAPIRoutes.setVolume.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        deviceId,
        volume
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("setVolume", {
        deviceId,
        volume
      }, resolve))),
  setVolumeAll: procedure
    .meta({ openapi: { method: "POST", path: "/hardware/{bridgeId}/volume" } })
    .input(CoreAPIRoutes.setVolumeAll.args)
    .output(CoreAPIRoutes.setVolumeAll.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        tag,
        volume
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("setVolumeAll", {
        tag,
        volume
      }, resolve))),
  setSource: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/hardware/{bridgeId}/{deviceId}/source"
      }
    })
    .input(CoreAPIRoutes.setSource.args)
    .output(CoreAPIRoutes.setSource.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        deviceId,
        source,
        channel
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("setSource", {
        deviceId,
        source,
        channel
      }, resolve))),
  setSourceAll: procedure
    .meta({ openapi: { method: "POST", path: "/hardware/{bridgeId}/source" } })
    .input(CoreAPIRoutes.setSourceAll.args)
    .output(CoreAPIRoutes.setSourceAll.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        tag,
        source,
        channel
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("setSourceAll", {
        tag,
        source,
        channel
      }, resolve))),
  mute: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/hardware/{bridgeId}/{deviceId}/mute"
      }
    })
    .input(CoreAPIRoutes.mute.args)
    .output(CoreAPIRoutes.mute.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        deviceId
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("mute", { deviceId }, resolve))),
  muteAll: procedure
    .meta({ openapi: { method: "POST", path: "/hardware/{bridgeId}/mute" } })
    .input(CoreAPIRoutes.muteAll.args)
    .output(CoreAPIRoutes.muteAll.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        tag
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("muteAll", { tag }, resolve))),
  unmute: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/hardware/{bridgeId}/{deviceId}/unmute"
      }
    })
    .input(CoreAPIRoutes.unmute.args)
    .output(CoreAPIRoutes.unmute.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        deviceId
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("unmute", { deviceId }, resolve))),
  unmuteAll: procedure
    .meta({ openapi: { method: "POST", path: "/hardware/{bridgeId}/unmute" } })
    .input(CoreAPIRoutes.unmuteAll.args)
    .output(CoreAPIRoutes.unmuteAll.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        tag
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("unmuteAll", { tag }, resolve))),
  muteAudio: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/hardware/{bridgeId}/{deviceId}/muteAudio"
      }
    })
    .input(CoreAPIRoutes.muteAudio.args)
    .output(CoreAPIRoutes.muteAudio.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        deviceId
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("muteAudio", { deviceId }, resolve))),
  muteAudioAll: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/hardware/{bridgeId}/muteAudio"
      }
    })
    .input(CoreAPIRoutes.muteAudioAll.args)
    .output(CoreAPIRoutes.muteAudioAll.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        tag
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("muteAudioAll", { tag }, resolve))),
  unmuteAudio: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/hardware/{bridgeId}/{deviceId}/unmuteAudio"
      }
    })
    .input(CoreAPIRoutes.unmuteAudio.args)
    .output(CoreAPIRoutes.unmuteAudio.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        deviceId
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("unmuteAudio", { deviceId }, resolve))),
  unmuteAudioAll: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/hardware/{bridgeId}/unmuteAudio"
      }
    })
    .input(CoreAPIRoutes.unmuteAudioAll.args)
    .output(CoreAPIRoutes.unmuteAudioAll.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        tag
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("unmuteAudioAll", { tag }, resolve))),
  muteVideo: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/hardware/{bridgeId}/{deviceId}/muteVideo"
      }
    })
    .input(CoreAPIRoutes.muteVideo.args)
    .output(CoreAPIRoutes.muteVideo.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        deviceId
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("muteVideo", { deviceId }, resolve))),
  muteVideoAll: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/hardware/{bridgeId}/muteVideo"
      }
    })
    .input(CoreAPIRoutes.muteVideoAll.args)
    .output(CoreAPIRoutes.muteVideoAll.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        tag
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("muteVideoAll", { tag }, resolve))),
  unmuteVideo: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/hardware/{bridgeId}/{deviceId}/unmuteVideo"
      }
    })
    .input(CoreAPIRoutes.unmuteVideo.args)
    .output(CoreAPIRoutes.unmuteVideo.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        deviceId
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("unmuteVideo", { deviceId }, resolve))),
  unmuteVideoAll: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/hardware/{bridgeId}/unmuteVideo"
      }
    })
    .input(CoreAPIRoutes.unmuteVideoAll.args)
    .output(CoreAPIRoutes.unmuteVideoAll.bridge)
    .mutation(async ({
      input: {
        bridgeId,
        tag
      }
    }) => new Promise(resolve =>
      getSocket(bridgeId).emit("unmuteVideoAll", { tag }, resolve)))
});
