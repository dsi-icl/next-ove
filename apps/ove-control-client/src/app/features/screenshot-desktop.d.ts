declare module "screenshot-desktop" {

  type Display = {
    id: number,
    name: string
    primary: boolean
  }

  // noinspection JSUnusedGlobalSymbols
  export function listDisplays(): Promise<Display[]>;
  function takeScreenshot(options: object): Promise<Buffer | string>;
  export = takeScreenshot;
}
