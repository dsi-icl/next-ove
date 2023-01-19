declare module "screenshot-desktop" {
  import { Display } from "../../types";

  // noinspection JSUnusedGlobalSymbols
  export function listDisplays(): Promise<Display[]>;
  function takeScreenshot(options: object): Promise<Buffer | string>;
  export = takeScreenshot;
}
