import {
  rand,
  randAnimal,
  randBetweenDate,
  randBoolean,
  randEmail,
  randFloat,
  randNumber,
  randPassword,
  randProductDescription,
  randProductName,
  randRecentDate,
  randText,
  randUrl,
  randUserName,
  randUuid,
  randVehicleType,
} from "@ngneat/falso";
import Minio from "minio";
import { glob } from "glob";
import dotenv from "dotenv";
import { Readable } from "node:stream";
import { readFileSync } from "node:fs";
import path from "node:path";
import { type User, PrismaClient } from ".prisma/client";
import type { RemoveObjectsParam } from "minio/src/internal/type";

dotenv.config();

const s3 = new Minio.Client({
  endPoint: process.env.ASSET_STORE_END_POINT ?? "localhost:9000",
  port: parseInt(process.env.ASSET_STORE_PORT ?? "-1"),
  useSSL: process.env.ASSET_STORE_USE_SSL === "true",
  accessKey: process.env.ASSET_STORE_ACCESS_KEY,
  secretKey: process.env.ASSET_STORE_SECRET_KEY,
});

const prisma = new PrismaClient();

const credentials = JSON.parse(
  readFileSync(path.join(import.meta.dirname, "data", "credentials.json")).toString(),
) as {username: string; password: string; role: string; email: string; }[];

const unique = <T>(arr: T[]) => arr.filter((x, i, arr) => arr.indexOf(x) === i);

const clear = async () => {
  for (const { name } of await s3.listBuckets()) {
    const objects: RemoveObjectsParam = await new Promise((resolve, reject) => {
      const stream = s3
        .listObjects(name, "", true, { IncludeVersion: true });
      const data: string[] = [];
      stream.on("data", (obj) => data.push(obj.name ?? ""));
      stream.on("end", () => resolve(data));
      stream.on("error", (err) => reject(err));
    });
    await s3.removeObjects(name, objects);
    await s3.removeBucket(name);
  }
  await prisma.invite.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.section.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});
};

const generateUsers = () =>
  credentials.concat(
    Array.from(
      { length: 2 },
      (_x) => ({
        username: randUserName(),
        email: randEmail(),
        password: randPassword() as unknown as string,
        role: rand(["admin", "creator", "client"]),
      }),
    ),
  );

const generateProjects = (users: User[]) =>
  Array.from({ length: 5 }, (_x) => {
    const userIds = users.map(({ id }) => id);
    const creatorId = rand(userIds);
    const createdAt = randRecentDate();
    const collaboratorLen = randNumber({ min: 0, max: userIds.length });
    const collaboratorIds = unique(rand(userIds, { length: collaboratorLen }),
    ).filter((id) => {
      const user = users.find((user) => user.id === id);
      return id !== creatorId && user?.role !== "bridge";
    });
    return {
      creatorId,
      collaboratorIds: collaboratorIds,
      created: createdAt,
      updated: randBetweenDate({
        from: createdAt,
        to: new Date(),
      }),
      title: randProductName(),
      description: randProductDescription(),
      thumbnail: randBoolean() ? process.env.THUMBNAIL : undefined,
      publications: unique(randProductName({ length: 3 })),
      presenterNotes: randText(),
      notes: randText(),
      tags: unique(randVehicleType({ length: 4 })),
      isPublic: randBoolean(),
    };
  });

const generateSections = (projectIds: string[]) =>
  projectIds.flatMap((projectId) => {
    const states = ["__default__"].concat(randAnimal({ length: 6 }));
    return Array.from(
      { length: randNumber({ max: 5 }) },
      (_y, j) => {
        const x = randFloat({ min: 0, max: 1 });
        const y = randFloat({ min: 0, max: 1 });
        const width = randFloat({ min: 0.001, max: 1 - x });
        const height = randFloat({ min: 0.001, max: 1 - y });
        return {
          width,
          height,
          x,
          y,
          config: undefined,
          asset: randUrl(),
          assetId: randUuid(),
          dataType: rand([
            "images",
            "videos",
            "svg",
            "audio",
            "html",
            "latex",
            "markdown",
            "json",
            "data-table",
          ]),
          states: unique(rand(states, { length: 4 })),
          ordering: j,
          projectId,
        };
      },
    );
  });

const createBucket = async (title: string) => {
  try {
    const bucketName = title.replaceAll(" ", "-").toLowerCase();
    await s3.makeBucket(bucketName);
    const versioningConfig = { Status: "Enabled" as const };
    await s3.setBucketVersioning(bucketName, versioningConfig);
  } catch (e) {
    console.error(e);
  }
};

const uploadFile = async (bucket: string, path: string) => {
  try {
    const repeat = randBoolean();
    await s3.fPutObject(
      bucket.replaceAll(" ", "-").toLowerCase(),
      path.split("/").at(-1) ?? "",
      path,
    );
    if (repeat) {
      await s3.fPutObject(
        bucket.replaceAll(" ", "-").toLowerCase(),
        path.split("/").at(-1) ?? "",
        path,
      );
    }
  } catch (e) {
    console.error(e);
  }
};

const uploadData = async (bucket: string, objectName: string, data: string) => {
  try {
    const rs = Readable.from(data, { encoding: "utf-8" });
    s3.putObject(bucket, objectName, rs).catch(console.error);
  } catch (e) {
    console.error(e);
  }
};

const load = async () => {
  await prisma.user.createMany({
    data: generateUsers(),
  });

  const users = await prisma.user.findMany({});

  for (const directory of await glob(
    path.join(import.meta.dirname, "data", "global_buckets", "*"),
  )) {
    const bucket = directory.split("/").at(-1) ?? "";
    await createBucket(bucket);

    for (const file of await glob(`${directory}/*`)) {
      await uploadFile(bucket, file);
    }
  }

  for (const project of generateProjects(users)) {
    await createBucket(project.title);
    await prisma.project.create({
      data: project,
    });

    let template = readFileSync(
      path.join(
        import.meta.dirname,
        "..",
        "..",
        "apps",
        "ove-core",
        "src",
        "assets",
        "control-template.html",
      ),
    ).toString();
    await uploadData(
      project.title.replaceAll(" ", "-").toLowerCase(),
      "control.html",
      template,
    );
    await uploadData(
      project.title.replaceAll(" ", "-").toLowerCase(),
      "env.json",
      "{}",
    );
  }

  const projects = await prisma.project.findMany({});
  const projectIds = projects.map(({ id }) => id);

  await prisma.section.createMany({
    data: generateSections(projectIds),
  });
};

clear().then(load);
