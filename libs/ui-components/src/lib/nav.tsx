import * as React from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger
} from "@ove/ui-base-components";
import { Link, useLocation } from "react-router-dom";
import { Tokens } from "@ove/ove-types";

export type NavProps = {
  auth: {
    tokens: Tokens | null
    login: () => void | null
    logout: () => void | null
  } | null
  icon: {
    asset: string
    alt: string
  }
  content: {
    title: string
    card: JSX.Element | null
    item: JSX.Element | null
  }[]
}

const Nav = ({ auth, icon: { asset, alt }, content }: NavProps) => {
  const location = useLocation();
  const isLogin = auth !== null && location.pathname === "/login";

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
            {content.map(({title, card, item}) => <NavigationMenuItem key={title}>
              {card !== null ? <><NavigationMenuTrigger>{title}</NavigationMenuTrigger>
              <NavigationMenuContent>
                {card}
              </NavigationMenuContent></> : item}
            </NavigationMenuItem>)}
          </NavigationMenuList>}
      </NavigationMenu>
    </>
  );
};

export default Nav;
