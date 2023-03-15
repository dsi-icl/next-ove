import { createContext } from "./context";
import { appRouter, init } from "./router";
import * as cp from "child_process";
import { DesktopCapturerSource, NativeImage } from "electron";

const setupTRPC = async () => {
  const ctx = await createContext();
  return appRouter.createCaller(ctx);
};

describe("TRPC Router", () => {
  it("has a default welcome message", async () => {
    const caller = await setupTRPC();
    expect(await caller.home())
      .toStrictEqual({ message: "Welcome to control-client!" });
  });

  it("can provide a status", async () => {
    const caller = await setupTRPC();
    expect(await caller.getStatus()).toStrictEqual({ status: "running" });
  });

  it("can provide general information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo();
    expect(info).toHaveProperty("version");
    expect(info).toHaveProperty("time");
  });

  it("can provide system information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({ type: "system" });

    expect(info).toHaveProperty("system");
    expect(info).toHaveProperty("bios");
    expect(info).toHaveProperty("baseboard");
    expect(info).toHaveProperty("chassis");
  });

  it("can provide CPU information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({ type: "cpu" });
    expect(info).toHaveProperty("cpu");
    expect(info).toHaveProperty("flags");
    expect(info).toHaveProperty("cache");
    expect(info).toHaveProperty("currentSpeed");
    expect(info).toHaveProperty("temperature");
  });

  it("can provide memory information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({ type: "memory" });
    expect(info).toHaveProperty("memory");
    expect(info).toHaveProperty("layout");
  });

  it("can provide battery information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({ type: "battery" });
    expect(info).toHaveProperty("battery");
  });

  it("can provide graphics information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({ type: "graphics" });
    expect(info).toHaveProperty("graphics");
  });

  it("can provide OS information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({ type: "os" });
    expect(info).toHaveProperty("os");
    expect(info).toHaveProperty("uuid");
    expect(info).toHaveProperty("versions");
    expect(info).toHaveProperty("shell");
    expect(info).toHaveProperty("users");
  });

  it("can provide processes information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({ type: "processes" });

    expect(info).toHaveProperty("currentLoad");
    expect(info).toHaveProperty("fullLoad");
    expect(info).toHaveProperty("processes");
  });

  it("can provide FS information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({ type: "fs" });

    expect(info).toHaveProperty("diskLayout");
    expect(info).toHaveProperty("blockDevices");
    expect(info).toHaveProperty("disksIO");
    expect(info).toHaveProperty("fsSize");
    expect(info).toHaveProperty("fsOpenFiles");
    expect(info).toHaveProperty("fsStats");
  }, 10_000);

  it("can provide USB information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({ type: "usb" });

    expect(info).toHaveProperty("usb");
  });

  it("can provide printer information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({ type: "printer" });

    expect(info).toHaveProperty("printer");
  });

  it("can provide audio information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({ type: "audio" });

    expect(info).toHaveProperty("audio");
  });

  it("can provide network information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({ type: "network" });

    expect(info).toHaveProperty("interfaces");
    expect(info).toHaveProperty("interfaceDefault");
    expect(info).toHaveProperty("gatewayDefault");
    expect(info).toHaveProperty("stats");
    expect(info).toHaveProperty("connections");
    expect(info).toHaveProperty("inetChecksite");
    expect(info).toHaveProperty("inetLatency");
  }, 10_000);

  it("can provide wifi information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({ type: "wifi" });

    expect(info).toHaveProperty("networks");
    expect(info).toHaveProperty("interfaces");
    expect(info).toHaveProperty("connections");
  }, 10_000);

  it("can provide bluetooth information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({ type: "bluetooth" });

    expect(info).toHaveProperty("devices");
  });

  it("can provide docker information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({ type: "docker" });

    expect(info).toHaveProperty("docker");
    expect(info).toHaveProperty("images");
    expect(info).toHaveProperty("containers");
    expect(info).toHaveProperty("containerStats");
    expect(info).toHaveProperty("containerProcesses");
    expect(info).toHaveProperty("volumes");
  });

  it("can provide vbox information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({ type: "vbox" });

    expect(info).toHaveProperty("vbox");
  });

  it("can shutdown the device", async () => {
    // noinspection JSUnusedLocalSymbols
    jest.spyOn(cp, "execSync").mockImplementationOnce(function(this: cp.ChildProcess, command: string, options: any, callback?: (error: cp.ExecException | null, stdout: string, stderr: string) => void): string | Buffer {
      return "This is a mocked shutdown";
    });
    const caller = await setupTRPC();
    const res = await caller.shutdown();
    expect(res).toBe("This is a mocked shutdown");
  });

  it("can reboot the device", async () => {
    // noinspection JSUnusedLocalSymbols
    jest.spyOn(cp, "execSync").mockImplementationOnce(function(this: cp.ChildProcess, command: string, options: any, callback?: (error: cp.ExecException | null, stdout: string, stderr: string) => void): string | Buffer {
      return "This is a mocked reboot";
    });
    const caller = await setupTRPC();
    const res = await caller.reboot();
    expect(res).toBe("This is a mocked reboot");
  });

  it("can execute arbitrary code on the device", async () => {
    // noinspection JSUnusedLocalSymbols
    jest.spyOn(cp, "execSync").mockImplementationOnce(function(this: cp.ChildProcess, command: string, options: any, callback?: (error: cp.ExecException | null, stdout: string, stderr: string) => void): string | Buffer {
      return "This is a mocked execution";
    });

    const caller = await setupTRPC();
    const res = await caller.execute({ command: "echo hello world" });

    expect(res).toBe("This is a mocked execution");
  });

  it("can take a screenshot of one screen of the device", async () => {
    const createWindow = jest.fn(() => {
    });
    const takeScreenshots = jest.fn(async () => [<DesktopCapturerSource>{
      display_id: "1",
      id: "test screen id",
      appIcon: <NativeImage>{
        toDataURL: (): string => "appIcon"
      },
      name: "test screen name",
      thumbnail: <NativeImage>{
        toDataURL: (): string => "thumbnail"
      }
    }]);
    init(createWindow, takeScreenshots);

    const caller = await setupTRPC();
    const res = await caller.screenshot({ method: "return", screens: [1] });

    expect(res).toStrictEqual(["thumbnail"]);
  });

  it("can take screenshots of multiple screens of the device", async () => {
    const createWindow = jest.fn(() => {
    });
    const takeScreenshots = jest.fn(async () => [
      <DesktopCapturerSource>{
        display_id: "1",
        id: "ts1",
        name: "test screen 1",
        appIcon: <NativeImage>{
          toDataURL: (): string => "app icon 1"
        },
        thumbnail: <NativeImage>{
          toDataURL: (): string => "thumbnail 1"
        }
      },
      <DesktopCapturerSource>{
        display_id: "2",
        id: "ts2",
        name: "test screen 2",
        appIcon: <NativeImage>{
          toDataURL: (): string => "app icon 2"
        },
        thumbnail: <NativeImage>{
          toDataURL: (): string => "thumbnail 2"
        }
      }
    ]);
    init(createWindow, takeScreenshots);

    const caller = await setupTRPC();
    const res = await caller.screenshot({ method: "return", screens: [1, 2] });

    expect(res).toStrictEqual(["thumbnail 1", "thumbnail 2"]);
  });

  it("can open a browser", async () => {
    const caller = await setupTRPC();
    const res = await caller.openBrowser({displayId: 1});

    expect(res).toBe(0);
  });
});
