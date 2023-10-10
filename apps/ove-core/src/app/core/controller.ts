import { type Context } from "../context";
import { state } from "../state";

const getObservatories = async (ctx: Context) => {
  const observatories = await ctx.prisma.auth.findMany({
    where: {
      role: "bridge"
    },
    select: {
      username: true
    }
  });
  return observatories.map(({ username }) => ({
    name: username,
    isOnline: Object.keys(state.bridgeClients).includes(username)
  }));
};

export default {
  getObservatories
};
