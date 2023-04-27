import SystemControl from "./system-control";

describe("OVE System Control", () => {
  it("can get system information", async () => {
    expect(Object.keys(SystemControl())).toStrictEqual(["shutdown", "reboot", "execute"]);
  });
});
