import * as React from "react";
import {
  cn,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from "@ove/ui-base-components";
import { HddStack } from "react-bootstrap-icons";
import { Link, useLocation } from "react-router-dom";
import { Tokens } from "../pages/login/page";

export type NavProps = {
  auth: {
    tokens: Tokens | null
    login: () => void
    logout: () => void
  } | null
  icon: {
    asset: string
    alt: string
  }
}

const Nav = ({ auth, icon: { asset, alt } }: NavProps) => {
  const location = useLocation();
  const isLogin = auth !== null && location.pathname === "/login";
  let loginSection = null;

  if (auth === null) {
    loginSection = null;
  }

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
            <NavigationMenuItem>
              <NavigationMenuTrigger>Hardware</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul
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
                  <ListItem href="/spaces" title="Spaces">
                    Manage the OVE canvas.
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            {}

          </NavigationMenuList>}
      </NavigationMenu>
    </>
  );
};

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p
            className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export default Nav;
