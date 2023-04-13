/**
 * @jest-environment node
 * */

import { createServer } from "http";
import * as mdcControl from "./mdc-control";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

describe("mdcControl", () => {
  let io: Server;
  let port: number;
  let serverSocket: Socket<DefaultEventsMap, DefaultEventsMap>;

  beforeEach(done => {
    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      if (httpServer === null || io === null) return;
      const address = httpServer.address();
      if (typeof address === "string" || address === null) return;
      port = address.port;
      done();
    });
  });

  it("should work", () => {
    expect(typeof mdcControl).toEqual("object");
  });

  it("should send a getStatus message", done => {
    mdcControl.getStatus(0x00, "localhost", port).then(status => {
      expect(status).toEqual("running");
      done();
    });

    io.on("connection", (socket) => {
      serverSocket = socket;
      serverSocket.on("message", m => {
        serverSocket.send("running");
        expect(m).toStrictEqual([170, 0, 0, 0, 0]);
      });
    });
  });

  it("should send a setPower message", done => {
    mdcControl.setPower(0x00, "localhost", port, "on")
      .then(response => {
        expect(response).toEqual("true");
        done();
      });

    io.on("connection", socket => {
      serverSocket = socket;
      serverSocket.on("message", message => {
        serverSocket.send(true);
        expect(message).toStrictEqual([0xAA, 0x11, 0, 1, 1, 19]);
      });
    });
  });

  afterEach(() => {
    io.close();
    if (serverSocket === undefined) return;
    serverSocket.disconnect(true);
  });
});
