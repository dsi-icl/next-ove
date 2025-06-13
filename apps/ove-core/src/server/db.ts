/* global globalThis */

import { env } from "../env";
import { PrismaClient } from ".prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();

if (env.ENVIRONMENT !== "production") globalForPrisma.prisma = prisma;
