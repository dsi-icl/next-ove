import browsers from "./browser-control";

describe("OVE Browser Control", () => {
  it("can get system information", async () => {
    expect(Object.keys(browsers()))
      .toStrictEqual([
        "init",
        "openBrowser",
        "closeBrowser",
        "closeBrowsers",
        "screenshot"
      ]);
  });
});
