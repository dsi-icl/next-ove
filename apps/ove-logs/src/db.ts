import { PrismaClient } from ".prisma/logging-client";
import { execSync } from "child_process";
import { env } from "./env";

export const db = new PrismaClient();

const limitByCount = async () => {
  if (env.DB.CLEANUP === undefined) return;
  const count = await db.log.count();
  if (count <= env.DB.CLEANUP.MAX_RECORDS) return;
  const ids = (
    await db.log.findMany({
      select: {
        id: true
      },
      skip: env.DB.CLEANUP.MAX_RECORDS
    })
  ).map(({ id }) => id);
  await db.log.deleteMany({
    where: {
      id: { in: ids }
    }
  });
};

const limitBySize = async () => {
  if (env.DB.CLEANUP === undefined) return;
  const raw = execSync(
    env.DB.CLEANUP.GET_SIZE_COMMAND.replaceAll("%DB_LOCATION%", env.DB.LOCATION)
  ).toString();
  const size = parseInt(raw.slice(0, /\D/.exec(raw)!.index));
  if (size <= env.DB.CLEANUP.MAX_SIZE) return;
  const sizeRatio = env.DB.CLEANUP.MAX_SIZE / size;
  const dbCount = await db.log.count();
  const ids = (
    await db.log.findMany({
      select: {
        id: true
      },
      skip: Math.ceil(dbCount * sizeRatio)
    })
  ).map(({ id }) => id);
  await db.log.deleteMany({
    where: {
      id: { in: ids }
    }
  });
  await db.$queryRaw`VACUUM`;
};

if (env.DB.CLEANUP !== undefined) {
  setInterval(async () => {
    await limitByCount();
    await limitBySize();
  }, env.DB.CLEANUP.INTERVAL);
}
