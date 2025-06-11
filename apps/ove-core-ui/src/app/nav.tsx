import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@ove/ui-base-components";
import React, { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Server } from "lucide-react";
import { useStore } from "../store";
import { api } from "../utils/api";
import { isError } from "@ove/ove-types";
import { env } from "../env";
import { useLoggedIn, useLogout } from "../hooks/auth";

const Persona = () => {
  const user = useStore((state) => state.user);
  const navigate = useNavigate();
  const logout = useLogout();
  const getPendingInviteCount = api.projects.getPendingInviteCount.useQuery();

  return user !== null ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="mr-1 cursor-pointer">
          <AvatarImage
            src={user.icon ?? undefined}
            alt={user.name ?? "collaborator name"}
          />
          <AvatarFallback>{user.name?.charAt(0) ?? "?"}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex cursor-pointer"
          onClick={() => navigate("/collaboration")}
        >
          Invites
          {getPendingInviteCount.status === "success" &&
          !isError(getPendingInviteCount.data) ? (
            <Badge variant="destructive" className="ml-auto">
              {getPendingInviteCount.data}
            </Badge>
          ) : null}
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={logout}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : null;
};

const Nav = () => {
  const location = useLocation();
  const isLogin = useMemo(
    () => location.pathname === "/login",
    [location.pathname],
  );
  const loggedIn = useLoggedIn();

  return (
    <NavigationMenu
      className={`items-center${isLogin ? "" : "justify-start"} h-full list-none`}
    >
      <Link to="/" className="ml-2 mr-auto">
        <NavigationMenuItem>
          <img
            src={`${env.BASE_URL}/logo.svg`}
            alt="OVE Core Logo"
            className="max-h-[10vh]"
          />
        </NavigationMenuItem>
      </Link>
      {isLogin ? null : (
        <NavigationMenuList className="mr-2 h-full">
          {loggedIn ? (
            <NavigationMenuItem>
              <NavigationMenuTrigger>Hardware</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-3">
                    <Link to="/hardware">
                      <NavigationMenuLink className="from-muted/50 to-muted flex size-full select-none flex-col justify-end rounded-md bg-gradient-to-b p-6 no-underline outline-none focus:shadow-md">
                        <Server />
                        <h4 className="mb-2 mt-4 text-lg font-medium">
                          Hardware Manager
                        </h4>
                        <p className="text-muted-foreground text-sm leading-tight">
                          Manage all connected hardware.
                        </p>
                      </NavigationMenuLink>
                    </Link>
                  </li>
                  <li>
                    <Link to="/sockets">
                      <NavigationMenuLink className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors">
                        <div className="text-sm font-medium leading-none">
                          Sockets
                        </div>
                        <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                          Socket.IO Admin UI
                        </p>
                      </NavigationMenuLink>
                    </Link>
                  </li>
                  <li>
                    <Link to="/logs">
                      <NavigationMenuLink className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors">
                        <div className="text-sm font-medium leading-none">
                          Logs
                        </div>
                        <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                          View live and historical logs across next-ove
                        </p>
                      </NavigationMenuLink>
                    </Link>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ) : null}
          <NavigationMenuItem className="flex h-[10vh] items-center">
            {loggedIn ? (
              <Persona />
            ) : (
              <Link to="/login">
                <NavigationMenuLink className="p-4 font-bold text-white">
                  Login
                </NavigationMenuLink>
              </Link>
            )}
          </NavigationMenuItem>
        </NavigationMenuList>
      )}
    </NavigationMenu>
  );
};

export default Nav;
