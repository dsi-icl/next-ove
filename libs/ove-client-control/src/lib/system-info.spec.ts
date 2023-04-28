import info from "./system-info";

describe("OVE System Information", () => {
  it("can get system information", async () => {
    expect(Object.keys(info().general()))
      .toStrictEqual(["version", "time", "type"]);
  });
});
