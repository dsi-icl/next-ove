import Router from "./router";
import Logo from "../assets/icon.svg";
import { Nav } from "@ove/ui-components";
import { API } from "@ove/ove-bridge-shared";
import { NavigationMenuLink } from "@ove/ui-base-components";

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    electron: API & {
      receive: (event: string, listener: (...args: any[]) => void) => void
    };
  }
}

/**
 * OVE Bridge App
 * @constructor
 */
export function App() {
  const navContent = [{
    title: "Hardware",
    card: null,
    item: <NavigationMenuLink asChild style={{margin: "0 2rem"}}><a href="/hardware" style={{color: "white"}}>Hardware</a></NavigationMenuLink>
  }];

  return (
    <>
      <Nav auth={{
        tokens: null, login: () => {
        }, logout: () => {
        }
      }} icon={{ asset: Logo, alt: "OVE Bridge Icon" }} content={navContent} />
      <Router />
    </>
  );
}

export default App;
