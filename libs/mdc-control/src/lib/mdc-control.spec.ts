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
    mdcControl.getStatus(0xFF, "localhost", port).then(status => {
      expect(status).toEqual("running");
      done();
    });

    io.on("connection", socket => {
      serverSocket = socket;
      serverSocket.on("message", m => {
        serverSocket.send("running");
        expect(m).toStrictEqual([0xAA, 0, 0xFF, 0, 0xFF]);
      });
    });
  });

  // noinspection DuplicatedCode
  it("should send a setPower 'off' message", done => {
    mdcControl.setPower(0xFF, "localhost", port, "on")
      .then(response => {
        expect(response).toEqual("true");
        done();
      });

    io.on("connection", socket => {
      serverSocket = socket;
      serverSocket.on("message", message => {
        serverSocket.send(true);
        expect(message).toStrictEqual([0xAA, 0x11, 0xFF, 1, 1, 0x12]);
      });
    });
  });

  // noinspection DuplicatedCode
  it("should send a setPower 'on' message", done => {
    mdcControl.setPower(0xFF, "localhost", port, "on")
      .then(response => {
        expect(response).toEqual("true");
        done();
      });

    io.on("connection", socket => {
      serverSocket = socket;
      serverSocket.on("message", message => {
        serverSocket.send(true);
        expect(message).toStrictEqual([0xAA, 0x11, 0xFF, 1, 1, 0x12]);
      });
    });
  });

  it("should send a getPower message", done => {
    mdcControl.getPower(0xFF, "localhost", port).then(power => {
      expect(power).toEqual("on");
      done();
    });

    io.on("connection", socket => {
      serverSocket = socket;
      serverSocket.on("message", message => {
        serverSocket.send("on");
        expect(message).toStrictEqual([0xAA, 0x11, 0xFF, 0, 0x10]);
      });
    });
  });

  it("should send a setVolume message", done => {
    mdcControl.setVolume(0xFF, "localhost", port, 70)
      .then(response => {
        expect(response).toEqual("true");
        done();
      });

    io.on("connection", socket => {
      serverSocket = socket;
      serverSocket.on("message", message => {
        serverSocket.send(true);
        expect(message).toStrictEqual([0xAA, 0x12, 0xFF, 0x01, 0x46, 0x58]);
      });
    });
  });

  it("should send a getVolume message", done => {
    mdcControl.getVolume(0xFF, "localhost", port).then(volume => {
      expect(volume).toEqual("70");
      done();
    });

    io.on("connection", socket => {
      serverSocket = socket;
      serverSocket.on("message", message => {
        serverSocket.send(70);
        expect(message).toStrictEqual([0xAA, 0x12, 0xFF, 0, 0x11]);
      });
    });
  });

  it("should send a setIsMute message", done => {
    mdcControl.setIsMute(0xFF, "localhost", port, true)
      .then(response => {
        expect(response).toEqual("true");
        done();
      });

    io.on("connection", socket => {
      serverSocket = socket;
      socket.on("message", message => {
        serverSocket.send(true);
        expect(message).toStrictEqual([0xAA, 0x13, 0xFF, 0x01, 0x01, 0x14]);
      });
    });
  });

  it("should send a getIsMute message", done => {
    mdcControl.getIsMute(0xFF, "localhost", port).then(isMute => {
      expect(isMute).toEqual("true");
      done();
    });

    io.on("connection", socket => {
      serverSocket = socket;
      socket.on("message", message => {
        serverSocket.send(true);
        expect(message).toStrictEqual([0xAA, 0x13, 0xFF, 0x00, 0x12]);
      });
    });
  });

  it("should send a setSource message", done => {
    mdcControl.setSource(0xFF, "localhost", port, mdcControl.sources.DP)
      .then(response => {
        expect(response).toEqual("true");
        done();
      });

    io.on("connection", socket => {
      serverSocket = socket;
      serverSocket.on("message", message => {
        serverSocket.send(true);
        expect(message)
          .toStrictEqual([0xAA, 0x14, 0xFF, 0x01, 0x25, 0x39]);
      });
    });
  });

  it("should send a getSource message", done => {
    mdcControl.getSource(0xFF, "localhost", port).then(source => {
      expect(source).toEqual("DP");
      done();
    });

    io.on("connection", socket => {
      serverSocket = socket;
      serverSocket.on("message", message => {
        serverSocket.send("DP");
        expect(message).toStrictEqual([0xAA, 0x14, 0xFF, 0x00, 0x13]);
      });
    });
  });

  it("should send a getModel message", done => {
    mdcControl.getModel(0xFF, "localhost", port).then(model => {
      expect(model).toEqual("Samsung");
      done();
    });

    io.on("connection", socket => {
      serverSocket = socket;
      serverSocket.on("message", message => {
        serverSocket.send("Samsung");
        expect(message).toStrictEqual([0xAA, 0x10, 0xFF, 0x00, 0x0F]);
      });
    });
  });

  afterEach(() => {
    io.close();
    if (serverSocket === undefined) return;
    serverSocket.disconnect(true);
  });
});
