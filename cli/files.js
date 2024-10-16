const { z } = require('zod');
const path = require('path');
const {
  makeSchema,
  parseArgs,
  defaultAlias,
  printSchemas,
  run
} = require('./utils');
const tagline = 'Manage next-ove asset files';
const help = 'Use "npm run files [COMMAND] -- --help" for more information about a command';
const descriptions = {
  upload: 'Upload a file to the asset store'
};
const description = 'DESCRIPTION\n\tFile management for the next-ove system.';

const schemas = {
  upload: z.strictObject({
    __cmd__: z.literal('upload')
  })
};

const schema = makeSchema(schemas);

const upload = () => {
  const fp = path.join(__dirname, '..', 'tools', 'files', 'upload.js');
  run(`node ${fp}`);
};

const runAnalysis = args => {
  switch (args.__cmd__) {
    case 'upload':
      upload(args);
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
  runAnalysis(args);
}