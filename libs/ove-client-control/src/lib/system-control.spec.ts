import control from "./system-control";

describe("OVE System Control", () => {
  it("can get system information", async () => {
    expect(Object.keys(control()))
      .toStrictEqual(["shutdown", "reboot", "execute"]);
  });
});
