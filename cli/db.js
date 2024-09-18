const path = require('path');
const {
  printSchemas,
  run,
  parseArgs, defaultAlias, makeSchema
} = require('./utils');
const z = require('zod').z;

const tagline = 'Manage the next-ove database';
const help = 'Use "npm run db [COMMAND] -- --help" for more information about a command';
const descriptions = {
  sync: 'Generate type definitions from DB schema',
  push: 'Push schema changes to the database',
  pull: 'Pull schema changes from the database',
  user: 'User management functionality. Currently supports adding users',
  show: 'Open database viewer in browser'
};
const description = 'DESCRIPTION\n\tManage the next-ove database.';

const schemas = {
  sync: z.strictObject({
    __cmd__: z.literal('sync')
  }),
  push: z.strictObject({
    __cmd__: z.literal('push')
  }),
  pull: z.strictObject({
    __cmd__: z.literal('pull')
  }),
  user: z.strictObject({
    __cmd__: z.literal('user'),
    action: z.union([z.literal('add')])
  }),
  show: z.strictObject({
    __cmd__: z.literal('show')
  })
};

const schema = makeSchema(schemas);

const show = () => {
  const dbDir = path.join(__dirname, '..', 'tools', 'db');
  run(`cd ${dbDir} && npx prisma studio`);
};

const sync = () => {
  const dbDir = path.join(__dirname, '..', 'tools', 'db');
  run(`cd ${dbDir} && npx prisma generate`);
};

const push = () => {
  const dbDir = path.join(__dirname, '..', 'tools', 'db');
  run(`cd ${dbDir} && npx prisma db push`);
};

const pull = () => {
  const dbDir = path.join(__dirname, '..', 'tools', 'db');
  run(`cd ${dbDir} && npx prisma db pull`);
};

const user = args => {
  let script;

  switch (args.action) {
    case 'add':
      script = path.join(__dirname, '..', 'tools', 'db', 'add-user.js');
      break;
    default:
      throw new Error('Unknown action');
  }

  run(`node ${script}`);
};

const runDB = args => {
  switch (args.__cmd__) {
    case 'sync':
      sync();
      break;
    case 'push':
      push();
      break;
    case 'pull':
      pull();
      break;
    case 'user':
      user(args);
      break;
    case 'show':
      show();
      break;
    default:
      throw new Error('Unknown command');
  }
};

const args = parseArgs(schema, true, defaultAlias, {
  user: ["action"]
});

if (args.__cmd__ === undefined && args.help) {
  printSchemas(schemas, tagline, description, descriptions, help);
} else if (args.help) {
  printSchemas(schemas, tagline, description, descriptions, help, args.__cmd__);
} else {
  runDB(args);
}
