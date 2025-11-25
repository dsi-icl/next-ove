import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@ove/ui-base-components";
import React, { useMemo } from "react";
import type { User } from ".prisma/client";
import { Check, X } from "lucide-react";
import { useInvites } from "./hooks/invites";
import { api } from "../../utils/api";
import { assert } from "@ove/ove-utils";
import { toast } from "sonner";

const getStatusClass = (status: string) => {
  switch (status) {
    case "accepted":
      return "green";
    case "declined":
      return "red";
    default:
      return "yellow";
  }
};

type Invite = {
  status: string;
  id: string;
  project: {
    id: string;
    title: string;
    description: string;
  };
  senderId: string;
  recipientId: string;
};

const Pending = ({ invite }: { invite: Invite }) => {
  const { acceptInvite, declineInvite } = useInvites();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default">Respond</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          className="flex cursor-pointer items-center"
          onClick={() =>
            toast.promise(acceptInvite.mutateAsync({ inviteId: invite.id }), {
              loading: "Accepting invite...",
              error: "Failed to accept invite",
              success: "Accepted invite",
            })
          }
        >
          <Check className="size-4" />
          Accept
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex cursor-pointer items-center"
          onClick={() =>
            toast.promise(declineInvite.mutateAsync({ inviteId: invite.id }), {
              loading: "Declining invite...",
              error: "Failed to decline invite",
              success: "Declined invite",
            })
          }
        >
          <X className="size-4" />
          Decline
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Accepted = () => {
  return (
    <Badge variant="green" className="justify-centerp-2 ml-auto flex w-20">
      Accepted
    </Badge>
  );
};

const Declined = () => {
  return (
    <Badge variant="red" className="ml-auto flex w-20 justify-center p-2">
      Declined
    </Badge>
  );
};

const Sent = ({ invite }: { invite: Invite }) => {
  return (
    <Badge variant={getStatusClass(invite.status)} className="ml-auto">
      {invite.status}
    </Badge>
  );
};

type InviteType = "pending" | "accepted" | "declined" | "sent";

const getContent = (invite: Invite, type: InviteType) => {
  switch (type) {
    case "pending":
      return <Pending invite={invite} />;
    case "accepted":
      return <Accepted />;
    case "declined":
      return <Declined />;
    case "sent":
      return <Sent invite={invite} />;
  }
};

const InviteCard = ({
  invite,
  user,
  type,
}: {
  invite: Invite;
  user: Omit<User, "password">;
  type: InviteType;
}) => {
  return (
    <li key={invite.id} className="h-full">
      <Card className="flex h-full w-full flex-row items-center justify-center">
        <CardHeader className="flex h-full flex-row items-center gap-4">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Avatar>
                <AvatarImage alt={user.username} src={user.icon ?? undefined} />
                <AvatarFallback>{user.username.slice(0, 1)}</AvatarFallback>
              </Avatar>
            </HoverCardTrigger>
            <HoverCardContent>
              <h4 className="text-center font-bold">{user.name ?? ""}</h4>
              <p className="text-center text-black/80">{user.email ?? ""}</p>
            </HoverCardContent>
          </HoverCard>
          <div className="flex h-full flex-col">
            <CardTitle className="text-lg font-semibold">
              {invite.project.title}
            </CardTitle>
            <CardDescription>{invite.project.description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="ml-auto flex h-full items-center pt-6">
          {getContent(invite, type)}
        </CardContent>
      </Card>
    </li>
  );
};

const Collaboration = () => {
  const { accepted, pending, declined, isLoaded, sent } = useInvites();
  const getUsers = api.projects.getUsers.useQuery();
  const users = useMemo(() => {
    if (getUsers.status !== "success") return [];
    return getUsers.data;
  }, [getUsers.status, getUsers.data]);

  return isLoaded ? (
    <main>
      {pending.length > 0 || accepted.length > 0 || declined.length > 0 ? (
        <h2 className="mt-4 px-64 text-xl font-bold">Inbox</h2>
      ) : null}
      <ul className="mt-4 flex flex-col gap-4 px-64 py-0">
        {pending.map((invite) => (
          <InviteCard
            key={invite.id}
            invite={invite}
            type="pending"
            user={assert(users.find((user) => user.id === invite.senderId))}
          />
        ))}
      </ul>
      <ul className="mt-4 flex flex-col gap-4 p-64 py-0">
        {accepted.map((invite) => (
          <InviteCard
            key={invite.id}
            invite={invite}
            type="accepted"
            user={assert(users.find((user) => user.id === invite.senderId))}
          />
        ))}
      </ul>
      <ul className="mt-4 flex flex-col gap-4 p-64 py-0">
        {declined.map((invite) => (
          <InviteCard
            key={invite.id}
            invite={invite}
            type="declined"
            user={assert(users.find((user) => user.id === invite.senderId))}
          />
        ))}
      </ul>
      {sent.length > 0 ? (
        <h2 className="mt-4 px-64 text-xl font-bold">Outbox</h2>
      ) : null}
      <ul className="mt-4 flex flex-col gap-4 px-64 py-0">
        {sent.map((invite) => (
          <InviteCard
            key={invite.id}
            invite={invite}
            type="sent"
            user={assert(users.find((user) => user.id === invite.recipientId))}
          />
        ))}
      </ul>
    </main>
  ) : null;
};

export default Collaboration;
