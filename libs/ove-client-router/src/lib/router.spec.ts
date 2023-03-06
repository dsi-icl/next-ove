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
});
