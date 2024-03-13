import React from "react";
import Logo from "../assets/icon.svg";
import { Link } from "react-router-dom";
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
            <Link to="/hardware" style={{ color: "white" }}>
              Hardware
            </Link>
          </NavigationMenuLink>
          <NavigationMenuLink asChild style={{ margin: "0 2rem" }}>
            <Link to="/live-view" style={{ color: "white" }}>
              Live View
            </Link>
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
