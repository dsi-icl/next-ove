const { PrismaClient } = require("@prisma/logging-client");
const { execSync } = require("child_process");

const db = new PrismaClient();

const limitByCount = async () => {
  if (process.env.MAX_DB_COUNT === undefined) return;
  const count = await db.log.count();
  if (count <= process.env.MAX_DB_COUNT) return;
  const ids = (
    await db.log.findMany({
      select: {
        id: true,
      },
      skip: process.env.MAX_DB_COUNT,
    })
  ).map(({ id }) => id);
  await db.log.deleteMany({
    where: {
      id: { in: ids },
    },
  });
};

const limitBySize = async () => {
  if (
    process.env.MAX_DB_SIZE === undefined ||
    process.env.DB_LOCATION === undefined
  )
    return;
  let size = execSync(
    `du -h ${process.env.DB_LOCATION} | numfmt --from=iec`,
  ).toString();
  size = parseInt(size.slice(0, /\D/.exec(size).index));
  if (size <= process.env.MAX_DB_SIZE) return;
  const sizeRatio = process.env.MAX_DB_SIZE / size;
  const dbCount = await db.log.count();
  const ids = (
    await db.log.findMany({
      select: {
        id: true,
      },
      skip: Math.ceil(dbCount * sizeRatio),
    })
  ).map(({ id }) => id);
  await db.log.deleteMany({
    where: {
      id: { in: ids },
    },
  });
  await db.$queryRaw`VACUUM`;
};

setInterval(async () => {
  await limitByCount();
  await limitBySize();
}, process.env.CLEANUP_INTERVAL);

module.exports = { db };
