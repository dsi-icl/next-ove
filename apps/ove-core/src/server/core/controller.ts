import { state } from "../state";
import { io } from "../bridge/sockets";
import { assert } from "@ove/ove-utils";
import type { Context } from "../context";
import { type Bounds, isError } from "@ove/ove-types";

const getObservatories = async (ctx: Context) => {
  const observatories = await ctx.prisma.user.findMany({
    where: {
      role: "bridge"
    },
    select: {
      username: true
    }
  });

  return observatories.map(({ username }) => {
    return ({
      name: username,
      isOnline: state.bridgeClients.has(username)
    });
  });
};

const getObservatoryBounds = async (ctx: Context) => {
  const observatories =
    (await getObservatories(ctx)).filter(({ isOnline }) => isOnline);
  return (await Promise.all(observatories.map(async ({ name }) =>
    assert(io.sockets.get(assert(state.bridgeClients.get(name))))
      .emitWithAck("getGeometry", {}))))
    .reduce((acc, x) => {
      if (isError(x.response) || x.response === undefined) return acc;
      acc[x.meta.bridge] = x.response;
      return acc;
    }, <Record<string, Bounds>>{});
};

const controller = {
  getObservatories,
  getObservatoryBounds
};

export default controller;
