const {
  printSchemas,
  run,
  parseArgs, defaultAlias, makeSchema
} = require('./utils');
const z = require('zod').z;

const tagline = 'Test the next-ove system';
const help = 'Use "npm run test [COMMAND] -- --help" for more information about a command';
const descriptions = {
  unit: 'Run unit tests',
  integration: 'Run integration tests'
};
const description = 'DESCRIPTION\n\tRun unit and integration tests on the next-ove system.';

const schemas = {
  unit: z.strictObject({
    __cmd__: z.literal('unit')
  }),
  integration: z.strictObject({
    __cmd__: z.literal('integration')
  })
};

const schema = makeSchema(schemas);

const unit = () => {
  run('npx nx run-many --target=test -- --coverage');
};

const integration = () => {
  run('npx jest --coverage --config jest.integration.config.ts');
};

const runTest = args => {
  switch (args.__cmd__) {
    case 'integration':
      integration();
      break;
    case 'unit':
      unit();
      break;
    default:
      throw new Error('Unknown command');
  }
};

const args = parseArgs(schema, true, defaultAlias);

if (args.__cmd__ === undefined && args.help) {
  printSchemas(schemas, tagline, description, descriptions, help);
} else if (args.help) {
  printSchemas(schemas, tagline, description, descriptions, help, args.__cmd__);
} else {
  runTest(args);
}
