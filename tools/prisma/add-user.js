const bcrypt = require('bcrypt');
const prompt = require('prompt');
const PrismaClient = require('@prisma/client').PrismaClient;

const SALT_ROUNDS = 10;

const prisma = new PrismaClient();

const load = async () => {
  const { username, email, password, role } = await getDetails();
  const hash = role === 'bridge' ? password : bcrypt.hashSync(password, SALT_ROUNDS);
  await prisma.user.create({
    data: {
      username: username,
      email: email,
      password: hash,
      role: role,
    }
  });
};

/** @type { () => Promise<{username: string, password: string, email: string | undefined, role: 'owner' | 'bridge' | 'admin' | 'creator'}> } */
const getDetails = () => {
  prompt.start();
  prompt.message = 'Enter user details:\n';
  prompt.delimiter = '';
  return prompt.get({
    properties: {
      username: {
        message: 'username:',
        required: true
      },
      password: {
        message: 'password:',
        required: true,
        hidden: true
      },
      email: {
        message: 'email:',
        required: false,
      },
      role: {
        message: 'role:',
        required: true,
        pattern: /^(?:admin|owner|bridge|creator)$/
      }
    }
  });
};

load().catch(console.error);
