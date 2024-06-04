const prompt = require('prompt');
const PrismaClient = require('@prisma/client').PrismaClient;
const getDetails = () => {
  prompt.start();
  prompt.message = 'Enter username:\n';
  prompt.delimiter = '';
  return prompt.get({
    properties: {
      username: {
        message: 'username:',
        required: true
      }
    }
  });
};

const signOut = async ({ username }) => {
  const prisma = new PrismaClient();
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      username
    }
  });
  await prisma.refreshToken.delete({
    where: {
      userId: user.id
    }
  });
};

getDetails().then(signOut).catch(console.error);
