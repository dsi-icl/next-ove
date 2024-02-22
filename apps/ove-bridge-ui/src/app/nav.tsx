import React from "react";
import Logo from "../assets/icon.svg";
// TODO: investigate circular dependency
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Nav as Navigation } from "@ove/ui-components";
import { NavigationMenuLink } from "@ove/ui-base-components";

const Nav = () => {
  const navContent = [
    {
      title: "Hardware",
      card: null,
      item: (
        <>
          <NavigationMenuLink asChild style={{ margin: "0 2rem" }}>
            <a href="/hardware" style={{ color: "white" }}>
              Hardware
            </a>
          </NavigationMenuLink>
          <NavigationMenuLink asChild style={{ margin: "0 2rem" }}>
            <a href="/live-view" style={{ color: "white" }}>
              Live View
            </a>
          </NavigationMenuLink>
        </>
      ),
      location: null
    }
  ];

  return (
    <Navigation
      icon={{ asset: Logo, alt: "OVE Bridge Icon" }}
      content={navContent}
    />
  );
};

export default Nav;
