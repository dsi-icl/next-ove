import { appRouter, createInnerContext } from "@ove/ove-client-router";

const setupTRPC = async () => {
  const ctx = await createInnerContext();
  return appRouter.createCaller(ctx);
};

describe("TRPC Router", () => {
  it("has a default welcome message", async () => {
    const caller = await setupTRPC();
    expect(await caller.home()).toStrictEqual({ message: "Welcome to control-client!" });
  });

  it("can provide a status", async () => {
    const caller = await setupTRPC();
    expect(await caller.getStatus()).toStrictEqual({status: "running"});
  });

  it("can provide general information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo();
    expect(info).toHaveProperty("version");
    expect(info).toHaveProperty("time");
  });

  it("can provide system information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({type: "system"});

    expect(info).toHaveProperty("system");
    expect(info).toHaveProperty("bios");
    expect(info).toHaveProperty("baseboard");
    expect(info).toHaveProperty("chassis");
  });

  it("can provide CPU information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({type: "cpu"});
    expect(info).toHaveProperty("cpu");
    expect(info).toHaveProperty("flags");
    expect(info).toHaveProperty("cache");
    expect(info).toHaveProperty("currentSpeed");
    expect(info).toHaveProperty("temperature");
  });

  it("can provide memory information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({type: "memory"});
    expect(info).toHaveProperty("memory");
    expect(info).toHaveProperty("layout");
  });

  it("can provide battery information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({type: "battery"});
    expect(info).toHaveProperty("battery");
  });

  it("can provide graphics information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({type: "graphics"});
    expect(info).toHaveProperty("graphics");
  });

  it("can provide OS information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({type: "os"});
    expect(info).toHaveProperty("os");
    expect(info).toHaveProperty("uuid");
    expect(info).toHaveProperty("versions");
    expect(info).toHaveProperty("shell");
    expect(info).toHaveProperty("users");
  });

  it("can provide processes information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({type: "processes"});

    expect(info).toHaveProperty("currentLoad");
    expect(info).toHaveProperty("fullLoad");
    expect(info).toHaveProperty("processes");
  });

  it("can provide FS information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({type: "fs"});

    expect(info).toHaveProperty("diskLayout");
    expect(info).toHaveProperty("blockDevices");
    expect(info).toHaveProperty("disksIO");
    expect(info).toHaveProperty("fsSize");
    expect(info).toHaveProperty("fsOpenFiles");
    expect(info).toHaveProperty("fsStats");
  });

  it("can provide USB information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({type: "usb"});

    expect(info).toHaveProperty("usb");
  });

  it("can provide printer information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({type: "printer"});

    expect(info).toHaveProperty("printer");
  });

  it("can provide audio information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({type: "audio"});

    expect(info).toHaveProperty("audio");
  });

  it("can provide network information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({type: "network"});

    expect(info).toHaveProperty("interfaces");
    expect(info).toHaveProperty("interfaceDefault");
    expect(info).toHaveProperty("gatewayDefault");
    expect(info).toHaveProperty("stats");
    expect(info).toHaveProperty("connections");
    expect(info).toHaveProperty("inetChecksite");
    expect(info).toHaveProperty("inetLatency");
  });

  it("can provide wifi information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({type: "wifi"});

    expect(info).toHaveProperty("networks");
    expect(info).toHaveProperty("interfaces");
    expect(info).toHaveProperty("connections");
  });

  it("can provide bluetooth information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({type: "bluetooth"});

    expect(info).toHaveProperty("devices");
  });

  it("can provide docker information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({type: "docker"});

    expect(info).toHaveProperty("docker");
    expect(info).toHaveProperty("images");
    expect(info).toHaveProperty("containers");
    expect(info).toHaveProperty("containerStats");
    expect(info).toHaveProperty("containerProcesses");
    expect(info).toHaveProperty("volumes");
  });

  it("can provide vbox information on the device", async () => {
    const caller = await setupTRPC();
    const info = await caller.getInfo({type: "vbox"});

    expect(info).toHaveProperty("vbox");
  });
});
