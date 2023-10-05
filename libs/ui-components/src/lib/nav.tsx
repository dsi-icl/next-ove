import * as React from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger
} from "@ove/ui-base-components";
import { Link, useLocation } from "react-router-dom";

export type NavProps = {
  icon: {
    asset: string
    alt: string
  }
  content: {
    title: string
    card: JSX.Element | null
    item: JSX.Element | null
    location: string | null
  }[]
}

const Nav = ({ icon: { asset, alt }, content }: NavProps) => {
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  const getNavigationMenuItem = (card: JSX.Element | null, title: string, item: JSX.Element | null) => {
    return <NavigationMenuItem key={title}>
      {card !== null ? <>
        <NavigationMenuTrigger>{title}</NavigationMenuTrigger>
        <NavigationMenuContent>
          {card}
        </NavigationMenuContent></> : item}
    </NavigationMenuItem>;
  };

  return (
    <>
      <NavigationMenu
        className={`items-center${isLogin ? "" : " justify-start"} list-none`}>
        <h1 className="z-50"></h1>
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
            }) => location !== null ? <Link
              to={location}
              key={title}>{getNavigationMenuItem(card, title, item)}</Link> : getNavigationMenuItem(card, title, item))}
          </NavigationMenuList>}
      </NavigationMenu>
    </>
  );
};

export default Nav;
