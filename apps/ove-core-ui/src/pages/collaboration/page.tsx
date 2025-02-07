import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Badge
} from "@ove/ui-base-components";
import { logger } from "../../env";
import { Check, X } from "lucide-react";
import { useInvites } from "./hooks/invites";

const Collaboration = () => {
  const { accepted, pending, declined, isLoaded, acceptInvite, declineInvite } = useInvites();

  return isLoaded ? <main>
    <h1 className="text-center w-full font-bold text-2xl mt-4">Invites for Collaboration</h1>
    <ul className="px-64 flex flex-col gap-4 py-0 mt-4">
      {pending.map(invite => <li key={invite.id} className="flex hover:bg-gray-50 flex-row w-full shadow border border-solid border-gray-200 p-4 rounded items-center">
        <div>
        <h4 className="font-semibold text-xl">{invite.project.title}</h4>
        <p>{invite.project.description}</p>
        </div>
        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="default" className="ml-auto">
          Respond
        </Button></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem className="cursor-pointer flex items-center" onClick={() => acceptInvite.mutateAsync({inviteId: ""}).catch(logger.error)}>
              <Check className="h-4 w-4" />
              Accept
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer flex items-center" onClick={() => declineInvite.mutateAsync({inviteId: ""}).catch(logger.error)}>
              <X className="h-4 w-4" />
              Decline
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </li>)}
    </ul>
    <ul className="p-64 flex flex-col gap-4 py-0 mt-4">
      {accepted.map(invite => <li key={invite.id} className="flex hover:bg-green-50 flex-row w-full shadow border border-solid border-green-200 p-4 rounded items-center">
        <div>
          <h4 className="font-semibold text-xl">{invite.project.title}</h4>
          <p>{invite.project.description}</p>
        </div>
        <Badge variant="default" className="bg-green-400 hover:bg-green-200 ml-auto w-20 justify-center flex p-2">Accepted</Badge>
      </li>)}
    </ul>
    <ul className="p-64 flex flex-col gap-4 py-0 mt-4">
      {declined.map(invite => <li key={invite.id} className="flex hover:bg-red-50 flex-row w-full shadow border border-solid border-red-200 p-4 rounded items-center">
        <div>
          <h4 className="font-semibold text-xl">{invite.project.title}</h4>
          <p>{invite.project.description}</p>
        </div>
        <Badge variant="destructive" className="ml-auto w-20 flex justify-center p-2">Declined</Badge>
      </li>)}
    </ul>
  </main> : null;
};

export default Collaboration;
