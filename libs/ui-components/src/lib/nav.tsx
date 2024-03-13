import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger
} from "@ove/ui-base-components";
import React, { type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

export type NavProps = {
  icon: {
    asset: string
    alt: string
  }
  content: {
    title: string
    card: ReactNode | null
    item: ReactNode | null
    location: string | null
  }[]
}

const Nav = ({ icon: { asset, alt }, content }: NavProps) => {
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  const getNavigationMenuItem = (
    card: ReactNode | null,
    title: string,
    item: ReactNode | null
  ) => {
    return <NavigationMenuItem key={title}>
      {card !== null ? <>
        <NavigationMenuTrigger>{title}</NavigationMenuTrigger>
        <NavigationMenuContent>
          {card}
        </NavigationMenuContent></> : item}
    </NavigationMenuItem>;
  };

  return <NavigationMenu
    className={`items-center${isLogin ? "" : " justify-start"} list-none`}>
    <Link to="/" className="mr-auto ml-2">
      <NavigationMenuItem>
        <img src={asset} alt={alt} className="max-h-[10vh]" />
      </NavigationMenuItem>
    </Link>
    {isLogin ? null :
      <NavigationMenuList className="mr-2">
        {content.map(({
          title,
          card,
          item,
          location
        }) => {
          const menuItem = getNavigationMenuItem(card, title, item);
          return location !== null ? <Link
            to={location} key={title}>{menuItem}</Link> : menuItem;
        })}
      </NavigationMenuList>}
  </NavigationMenu>;
};

export default Nav;
