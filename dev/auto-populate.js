const PrismaClient = require('@prisma/client').PrismaClient;
const {readFileSync} = require('fs');
const {
    rand, randAnimal, randBetweenDate, randBoolean,
    randEmail, randFloat, randNumber,
    randPassword, randProductDescription, randProductName,
    randRecentDate, randText, randUrl,
    randUserName, randUuid, randVehicleType
} = require('@ngneat/falso');
const dotenv = require('dotenv');

dotenv.config();

const prisma = new PrismaClient();

const credentials = JSON.parse(readFileSync("./credentials.json").toString());

const clear = async () => {
    await prisma.invite.deleteMany({});
    await prisma.refreshToken.deleteMany({});
    await prisma.section.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({});
};

const generateUsers = () => credentials.concat(Array.from({length: 2}, (_x) => /** @type {Omit<import('@prisma/client').User, "id">} */({
    username: randUserName(),
    email: randEmail(),
    password: randPassword(),
    role: rand(['admin', 'creator']),
})));

const generateProjects = userIds => Array.from({length: 5}, (_x) => {
    /** @type {string} */
    const creatorId = rand(userIds);
    /** @type {Date} */
    const createdAt = randRecentDate();
    const collaboratorIds = [creatorId].concat(/** @type {string[]} */ rand(userIds.filter(x => x !== creatorId), {length: 4}));
    return ({
        creatorId,
        collaboratorIds: collaboratorIds,
        created: createdAt,
        updated: /** @type {Date} */ randBetweenDate({from: createdAt, to: new Date()}), // from: created
        title: randProductName(),
        description: randProductDescription(),
        thumbnail: randBoolean() ? process.env.THUMBNAIL : undefined, // dev thumbnail
        publications: randProductName({length: 3}),
        presenterNotes: randText(),
        notes: randText(),
        tags: randVehicleType({length: 4}),
        isSaved: randBoolean()
    });
});

const generateSections = projectIds => projectIds.flatMap(x =>
    Array.from({length: /** @type {number} */randNumber({max: 5})}, (_y, j) => ({
        width: randFloat({min: 0, max: 1}),
        height: randFloat({min: 0, max: 1}),
        x: randFloat({min: 0, max: 1}),
        y: randFloat({min: 0, max: 1}),
        config: undefined,
        asset: randUrl(),
        assetId: randUuid(),
        dataType: rand(['image', 'video']),
        states: randAnimal({length: 4}),
        ordering: j,
        projectId: x
    })));

const load = async () => {
    await prisma.user.createMany({
        data: generateUsers()
    });

    const users = await prisma.user.findMany({});
    const userIds = users.map(({id}) => id);

    for (const project of generateProjects(userIds)) {
        await prisma.project.create({
            data: project,
            include: {
                collaborators: true
            }
        })
    }

    const projects = await prisma.project.findMany({});
    const projectIds = projects.map(({id}) => id);

    await prisma.section.createMany({
        data: generateSections(projectIds)
    });
};

clear().then(load);
