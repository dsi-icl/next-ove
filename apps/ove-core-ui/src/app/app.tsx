import Router from "./router";
import { Nav } from "@ove/ui-components";
import { HddStack } from "react-bootstrap-icons";
import {
  NavigationMenuLink,
} from "@ove/ui-base-components";

export const App = () => {
  const navContent = [
    {
      title: "Hardware",
      item: null,
      card: <ul
        className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
        <li className="row-span-3">
          <NavigationMenuLink asChild>
            <a
              className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
              href={`${import.meta.env.BASE_URL}/hardware`}
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
      </ul>
    },
    // TODO: add login button
    {
      title: "Login",
      item: <div>Login</div>,
      card: null
    }
  ];

  return <>
    <Nav icon={{ asset: "/logo.svg", alt: "OVE Core Logo" }} content={navContent} />
    <Router />
  </>;
};

export default App;
