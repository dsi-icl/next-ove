const {
  rand, randAnimal, randBetweenDate, randBoolean,
  randEmail, randFloat, randNumber,
  randPassword, randProductDescription, randProductName,
  randRecentDate, randText, randUrl,
  randUserName, randUuid, randVehicleType
} = require('@ngneat/falso');
const Minio = require('minio');
const glob = require('glob').glob;
const dotenv = require('dotenv');
const { Readable } = require('stream');
const { readFileSync } = require('fs');
const path = require('path');
const PrismaClient = require('@prisma/client').PrismaClient;

dotenv.config();

const s3 = new Minio.Client({
  endPoint: process.env.ASSET_STORE_END_POINT,
  port: parseInt(process.env.ASSET_STORE_PORT),
  useSSL: process.env.ASSET_STORE_USE_SSL === 'true',
  accessKey: process.env.ASSET_STORE_ACCESS_KEY,
  secretKey: process.env.ASSET_STORE_SECRET_KEY
});

const prisma = new PrismaClient();

const credentials = JSON.parse(readFileSync('./credentials.json').toString());

/** @type {<T>(arr: T[]) => T[]} */
const unique = arr => arr.filter((x, i, arr) => arr.indexOf(x) === i);

const clear = async () => {
  for (const { name } of (await s3.listBuckets())) {
    const objects = await new Promise((resolve, reject) => {
      const stream = s3
        // @ts-expect-error – missing optional arguments parameter in library type
        .listObjects(name, '', true, { IncludeVersion: true });
      const data = [];
      stream.on('data', obj => data.push(obj));
      stream.on('end', () => resolve(data));
      stream.on('error', err => reject(err));
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

const generateUsers = () => credentials.concat(Array.from({ length: 2 }, (_x) => /** @type {Omit<import('@prisma/client').User, 'id'>} */({
  username: randUserName(),
  email: randEmail(),
  password: randPassword(),
  role: rand(['admin', 'creator', 'client']),
})));

/** @type {(users: import('@prisma/client').User[]) => Omit<import('@prisma/client').Project, 'id'>[]} */
const generateProjects = users => Array.from({ length: 5 }, (_x) => {
  /** @type {string[]} */
  const userIds = users.map(({ id }) => id);
  /** @type {string} */
  const creatorId = rand(userIds);
  /** @type {Date} */
  const createdAt = randRecentDate();
  /** @type {number} */
  const collaboratorLen = randNumber({ min: 0, max: userIds.length });
  const collaboratorIds = unique(/** @type {string[]} */rand(userIds, { length: collaboratorLen })).filter(id => {
    const user = users.find(user => user.id === id);
    return id !== creatorId && user.role !== 'bridge';
  });
  return ({
    creatorId,
    collaboratorIds: collaboratorIds,
    created: createdAt,
    updated: /** @type {Date} */ randBetweenDate({
      from: createdAt,
      to: new Date()
    }), // from: created
    title: randProductName(),
    description: randProductDescription(),
    /** @type {string | null} */
    thumbnail: randBoolean() ? process.env.THUMBNAIL : undefined, // dev thumbnail
    publications: unique(randProductName({ length: 3 })),
    presenterNotes: randText(),
    notes: randText(),
    tags: unique(randVehicleType({ length: 4 })),
    isPublic: randBoolean()
  });
});

const generateSections = projectIds => projectIds.flatMap(projectId => {
  const states = ['__default__'].concat(randAnimal({ length: 6 }));
  return Array.from({ length: /** @type {number} */randNumber({ max: 5 }) }, (_y, j) => {
    /** @type {number} */
    const x = randFloat({ min: 0, max: 1 });
    /** @type {number} */
    const y = randFloat({ min: 0, max: 1 });
    /** @type {number} */
    const width = randFloat({ min: 0.001, max: 1 - x });
    /** @type {number} */
    const height = randFloat({ min: 0.001, max: 1 - y });
    return ({
      width,
      height,
      x,
      y,
      config: undefined,
      asset: randUrl(),
      assetId: randUuid(),
      dataType: rand(['images', 'videos', 'svg', 'audio', 'html', 'latex', 'markdown', 'json', 'data-table']),
      states: unique(rand(states, { length: 4 })),
      ordering: j,
      projectId
    });
  });
});

const createBucket = async title => {
  try {
    const bucketName = title.replaceAll(' ', '-').toLowerCase();
    await s3.makeBucket(bucketName);
    const versioningConfig = { Status: 'Enabled' };
    await s3.setBucketVersioning(bucketName, versioningConfig);
  } catch (e) {
    console.error(e);
  }
};

const uploadFile = async (bucket, path) => {
  try {
    const repeat = randBoolean();
    await s3.fPutObject(bucket.replaceAll(' ', '-').toLowerCase(), path.split('/').at(-1), path);
    if (repeat) {
      await s3.fPutObject(bucket.replaceAll(' ', '-').toLowerCase(), path.split('/').at(-1), path);
    }
  } catch (e) {
    console.error(e);
  }
};

const uploadData = async (bucket, objectName, data) => {
  try {
    const rs = Readable.from(data, { encoding: 'utf-8' });
    s3.putObject(bucket, objectName, rs).catch(console.error);
  } catch (e) {
    console.error(e);
  }
};

const load = async () => {
  await prisma.user.createMany({
    data: generateUsers()
  });

  const users = await prisma.user.findMany({});

  for (const directory of (await glob('./global_buckets/*'))) {
    const bucket = directory.split('/').at(-1);
    await createBucket(bucket);

    for (const file of await glob(`${directory}/*`)) {
      await uploadFile(bucket, file);
    }
  }

  for (const project of generateProjects(users)) {
    await createBucket(project.title);
    await prisma.project.create({
      data: project,
      include: {
        collaborators: true
      }
    });

    let template = readFileSync(path.join('..', 'apps', 'ove-core', 'src', 'assets', 'control-template.html')).toString();
    await uploadData(project.title.replaceAll(' ', '-').toLowerCase(), 'control.html', template);
    await uploadData(project.title.replaceAll(' ', '-').toLowerCase(), 'env.json', '{}');
  }

  const projects = await prisma.project.findMany({});
  const projectIds = projects.map(({ id }) => id);

  await prisma.section.createMany({
    data: generateSections(projectIds)
  });
};

clear().then(load);
