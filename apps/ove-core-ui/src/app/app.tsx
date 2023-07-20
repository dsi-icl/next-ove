import Router from "./router";
import { useState } from "react";
import { Tokens } from "@ove/ove-types";
import { Nav } from "@ove/ui-components";
import { useNavigate } from "react-router-dom";
import { HddStack } from "react-bootstrap-icons";
import {
  NavigationMenuLink,
  NavigationMenuListItem
} from "@ove/ui-base-components";

import Logo from "../assets/icon.svg";

export function App() {
  const [tokens, setTokens] = useState<Tokens | null>(() => {
    const stored = sessionStorage.getItem("tokens");
    if (stored === null) return stored;
    return JSON.parse(stored);
  });

  const navigate = useNavigate();

  const login = () => {
    navigate("/login");
  };
  const logout = () => {
    localStorage.removeItem("tokens");
    setTokens(null);
    navigate("/", { replace: true });
  };

  const navContent = [{
    title: "Hardware",
    item: null,
    card: <ul
      className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
      <li className="row-span-3">
        <NavigationMenuLink asChild>
          <a
            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
            href="/hardware"
          >
            <HddStack />
            <h4 className="mb-2 mt-4 text-lg font-medium">
              Hardware Manager
            </h4>
            <p
              className="text-sm leading-tight text-muted-foreground">
              Manage all connected hardware.
            </p>
          </a>
        </NavigationMenuLink>
      </li>
      <NavigationMenuListItem href="/spaces" title="Spaces">
        Manage the OVE canvas.
      </NavigationMenuListItem>
    </ul>
  }];

  return (
    <>
      <Nav auth={{ tokens, login, logout }}
           icon={{ asset: Logo, alt: "OVE Core Logo" }} content={navContent} />
      <Router tokens={tokens} setTokens={(tokens) => setTokens(tokens)} />
    </>
  );
}

export default App;
