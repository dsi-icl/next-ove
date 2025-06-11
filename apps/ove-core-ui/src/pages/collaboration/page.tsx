import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ove/ui-base-components";
import React from "react";
import { logger } from "../../env";
import { Check, X } from "lucide-react";
import { useInvites } from "./hooks/invites";

const Collaboration = () => {
  const { accepted, pending, declined, isLoaded, acceptInvite, declineInvite } =
    useInvites();

  return isLoaded ? (
    <main>
      <h1 className="mt-4 w-full text-center text-2xl font-bold">
        Invites for Collaboration
      </h1>
      <ul className="mt-4 flex flex-col gap-4 px-64 py-0">
        {pending.map((invite) => (
          <li
            key={invite.id}
            className="flex w-full flex-row items-center rounded border border-solid border-gray-200 p-4 shadow hover:bg-gray-50"
          >
            <div>
              <h4 className="text-xl font-semibold">{invite.project.title}</h4>
              <p>{invite.project.description}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" className="ml-auto">
                  Respond
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  className="flex cursor-pointer items-center"
                  onClick={() =>
                    acceptInvite
                      .mutateAsync({ inviteId: "" })
                      .catch(logger.error)
                  }
                >
                  <Check className="size-4" />
                  Accept
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex cursor-pointer items-center"
                  onClick={() =>
                    declineInvite
                      .mutateAsync({ inviteId: "" })
                      .catch(logger.error)
                  }
                >
                  <X className="size-4" />
                  Decline
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        ))}
      </ul>
      <ul className="mt-4 flex flex-col gap-4 p-64 py-0">
        {accepted.map((invite) => (
          <li
            key={invite.id}
            className="flex w-full flex-row items-center rounded border border-solid border-green-200 p-4 shadow hover:bg-green-50"
          >
            <div>
              <h4 className="text-xl font-semibold">{invite.project.title}</h4>
              <p>{invite.project.description}</p>
            </div>
            <Badge
              variant="default"
              className="ml-auto flex w-20 justify-center bg-green-400 p-2 hover:bg-green-200"
            >
              Accepted
            </Badge>
          </li>
        ))}
      </ul>
      <ul className="mt-4 flex flex-col gap-4 p-64 py-0">
        {declined.map((invite) => (
          <li
            key={invite.id}
            className="flex w-full flex-row items-center rounded border border-solid border-red-200 p-4 shadow hover:bg-red-50"
          >
            <div>
              <h4 className="text-xl font-semibold">{invite.project.title}</h4>
              <p>{invite.project.description}</p>
            </div>
            <Badge
              variant="destructive"
              className="ml-auto flex w-20 justify-center p-2"
            >
              Declined
            </Badge>
          </li>
        ))}
      </ul>
    </main>
  ) : null;
};

export default Collaboration;
