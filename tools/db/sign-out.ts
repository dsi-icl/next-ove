import prompt from "prompt";
import { PrismaClient } from ".prisma/client";

const getDetails = () => {
  prompt.start();
  prompt.message = "Enter username:\n";
  prompt.delimiter = "";
  return prompt.get({
    properties: {
      username: {
        message: "username:",
        required: true,
      },
    },
  }) as Promise<{ username: string }>;
};

const signOut = async ({ username }: { username: string }) => {
  const prisma = new PrismaClient();
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      username,
    },
  });
  await prisma.refreshToken.delete({
    where: {
      userId: user.id,
    },
  });
};

getDetails().then(signOut).catch(console.error);
