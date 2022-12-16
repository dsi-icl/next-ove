declare module "screenshot-desktop" {

  type Display = {
    id: number,
    name: string
    primary: boolean
  }

  export function listDisplays(): Promise<Display[]>;
  function takeScreenshot(options: object): void;
  export default takeScreenshot;
}
