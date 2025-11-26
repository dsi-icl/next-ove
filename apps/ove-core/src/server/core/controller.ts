import { state } from "../state";
import { io } from "../bridge/sockets";
import { assert, filterRejected } from "@ove/ove-utils";
import type { Context } from "../context";
import type { Bounds } from "@ove/ove-types";
import { env } from "../../env";

const getObservatories = async (ctx: Context) => {
  const observatories = await ctx.prisma.service.findMany({
    where: {
      role: "bridge",
    },
    select: {
      service: true,
    },
  });

  return observatories.map(({ service }) => {
    return {
      name: service,
      isOnline: state.bridgeClients.has(service),
    };
  });
};

const getObservatoryBounds = async (ctx: Context) => {
  const observatories = (await getObservatories(ctx)).filter(
    ({ isOnline }) => isOnline,
  );
  return (
    await Promise.allSettled(
      observatories.map(async ({ name }) => {
        const res = await assert(
          io.sockets.get(assert(state.bridgeClients.get(name))),
        ).emitWithAck("getGeometry", {});
        return { name, response: res };
      }),
    )
  ).reduce(
    (acc, x) => {
      if (
        filterRejected(x) ||
        x.value.response.status === "error" ||
        x.value.response.data === undefined
      )
        return acc;
      acc[x.value.name] = x.value.response.data;
      return acc;
    },
    <Record<string, Bounds>>{},
  );
};

const getRenderer = async () => env.TEMPLATES?.CONTROLLER?.RENDERER ?? null;

const controller = {
  getObservatories,
  getObservatoryBounds,
  getRenderer,
};

export default controller;
