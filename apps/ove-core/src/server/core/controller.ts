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
  console.log(observatories.length);
  return observatories.map(({ username }) => {
    return ({
      name: username,
      isOnline: state.bridgeClients.has(username)
    });
  });
};

export default {
  getObservatories
};
