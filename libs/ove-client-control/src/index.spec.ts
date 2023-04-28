import service from "./lib/service";

describe("OVE Client Control", () => {
  it("can get system information", async () => {
    expect(Object.keys(await service().getInfo("general")))
      .toStrictEqual(["version", "time", "type"]);
  });
});
