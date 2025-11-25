import bcrypt from "bcryptjs";
import prompt from "prompt";
import { PrismaClient } from ".prisma/client";

const SALT_ROUNDS = 10;

const prisma = new PrismaClient();

const load = async () => {
  const { username, email, password, role } = await getDetails();
  const hash = bcrypt.hashSync(password, SALT_ROUNDS);
  await prisma.user.create({
    data: {
      username: username,
      email: email,
      password: hash,
      role: role,
    },
  });
};

const getDetails = () => {
  prompt.start();
  prompt.message = "Enter user details:\n";
  prompt.delimiter = "";
  return prompt.get({
    properties: {
      username: {
        message: "username:",
        required: true,
      },
      password: {
        message: "password:",
        required: true,
        hidden: true,
      },
      email: {
        message: "email:",
        required: false,
      },
      role: {
        message: "role:",
        required: true,
        pattern: /^(?:admin|bridge|creator|client)$/,
      },
    },
  }) as Promise<{
    username: string;
    password: string;
    email: string | undefined;
    role: "admin" | "creator";
  }>;
};

load().catch(console.error);
