import { state } from "../state";
import { io } from "../bridge/sockets";
import { assert } from "@ove/ove-utils";
import type { Context } from "../context";
import { type Bounds, isError } from "@ove/ove-types";
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
    await Promise.all(
      observatories.map(async ({ name }) =>
        assert(
          io.sockets.get(assert(state.bridgeClients.get(name))),
        ).emitWithAck("getGeometry", {}),
      ),
    )
  ).reduce(
    (acc, x) => {
      if (isError(x.response) || x.response === undefined) return acc;
      acc[x.meta.bridge] = x.response;
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
