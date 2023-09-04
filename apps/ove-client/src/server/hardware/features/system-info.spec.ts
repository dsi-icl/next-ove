import SystemInfo from "./system-info";

describe("OVE System Information", () => {
  it("can get system information", async () => {
    expect(Object.keys(SystemInfo.general()))
      .toStrictEqual(["version", "time", "type"]);
  });
});
