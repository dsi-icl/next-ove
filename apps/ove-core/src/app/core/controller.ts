import { PrismaClient } from "@prisma/client";
import { state } from "../state";

const getObservatories = async () => {
  const prisma = new PrismaClient();
  const observatories = await prisma.auth.findMany({
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
