import BrowserControl from "./browser-control";

describe("OVE Browser Control", () => {
  it("can get system information", async () => {
    expect(Object.keys(BrowserControl))
      .toStrictEqual([
        "init",
        "openBrowser",
        "closeBrowser",
        "closeBrowsers",
        "screenshot"
      ]);
  });
});
