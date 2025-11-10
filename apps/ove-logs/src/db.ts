import { env } from "./env";
import { PrismaClient } from ".prisma/logging-client";

export const db = new PrismaClient();

const limitByCount = async () => {
  if (env.DB.CLEANUP?.MAX_RECORDS === undefined) return;
  const total = await db.log.count();
  if (total <= env.DB.CLEANUP.MAX_RECORDS) return;

  const toDelete = await db.log.findMany({
    select: { id: true },
    orderBy: { date: "desc" },
    skip: env.DB.CLEANUP.MAX_RECORDS,
  });
  const ids = toDelete.map((r) => r.id);
  if (ids.length > 0) {
    await db.log.deleteMany({ where: { id: { in: ids } } });
  }
};

async function limitBySize() {
  if (env.DB.CLEANUP?.MAX_SIZE === undefined) return;

  const [{ size }] = await db.$queryRaw<
    { size: bigint }[]
  >`SELECT pg_database_size(current_database()) AS size`;
  const currentSize = Number(size);
  if (currentSize <= env.DB.CLEANUP.MAX_SIZE) return;

  const total = await db.log.count();
  const keep = Math.ceil((env.DB.CLEANUP.MAX_SIZE / currentSize) * total);

  const toDelete = await db.log.findMany({
    select: { id: true },
    orderBy: { date: "desc" },
    skip: keep,
  });
  const ids = toDelete.map((r) => r.id);
  if (ids.length > 0) {
    await db.log.deleteMany({ where: { id: { in: ids } } });
    await db.$executeRaw`VACUUM`;
  }
}

if (env.DB.CLEANUP !== undefined) {
  limitByCount().catch(console.error);
  limitBySize().catch(console.error);
  setInterval(async () => {
    await limitByCount();
    await limitBySize();
  }, env.DB.CLEANUP.INTERVAL);
}
