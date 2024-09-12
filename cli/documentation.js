const path = require('path');
const {
  printSchemas,
  handlePathname,
  run,
  parseArgs, defaultAlias, makeSchema
} = require('./utils');
const z = require('zod').z;

const tagline = 'Document the next-ove system';
const help = 'Use "npm run document [COMMAND] -- --help" for more information about a command';
const descriptions = {};
const description = 'DESCRIPTION\n\tCode and type documentation for the next-ove system.';

const schemas = {
  api: z.strictObject({
    __cmd__: z.literal('api'),
    outDir: z.string().optional(),
    coreConfig: z.string().optional(),
    clientConfig: z.string().optional()
  }),
  code: z.strictObject({
    __cmd__: z.literal('code'),
    input: z.string().optional(),
    config: z.string().optional(),
    outDir: z.string().optional()
  }),
  types: z.strictObject({
    __cmd__: z.literal('types'),
    config: z.string().optional(),
    tsConfig: z.string().optional(),
    outDir: z.string().optional()
  }),
  build: z.strictObject({
    __cmd__: z.literal('build'),
    codeDir: z.string().optional(),
    typesDir: z.string().optional(),
    apiDir: z.string().optional(),
    coverageDir: z.string().optional()
  }),
  show: z.strictObject({
    __cmd__: z.literal('show')
  })
};

const schema = makeSchema(schemas);

const code = args => {
  const input = handlePathname(args.input, '.');
  const config = handlePathname(args.config, 'tools/jsdoc/jsdoc.json');
  const outDir = handlePathname(args.outDir, 'out/documentation');
  const rootDir = path.join(__dirname, '..');

  [
    `mkdir -p ${outDir}`,
    `cd ${rootDir} && npx jsdoc ${input} -c ${config}`
  ].forEach(run);
};

const types = args => {
  const config = handlePathname(args.config, 'tools/typedoc/typedoc.json');
  const tsConfig = handlePathname(args.tsConfig, 'tsconfig.json');
  const rootDir = path.join(__dirname, '..');
  const outDir = handlePathname(args.outDir, 'out/documentation');

  [
    `mkdir -p ${outDir}`,
    `cd ${rootDir} && npx typedoc --options ${config} --tsconfig ${tsConfig}`
  ].forEach(run);
};

const build = args => {
  const codeDir = handlePathname(args.codeDir, 'out/documentation/code');
  const typesDir = handlePathname(args.typesDir, 'out/documentation/types');
  const apiDir = handlePathname(args.apiDir, 'out/documentation/api');
  const docsDir = path.join(__dirname, '..', 'docs');
  const coverageDir = handlePathname(args.coverageDir, 'out/coverage');

  [
    `cp -R ${codeDir} ${docsDir}`,
    `cp -R ${typesDir} ${docsDir}`,
    `cp -R ${apiDir} ${docsDir}`,
    `cp -R ${coverageDir} ${docsDir}`
  ].forEach(run);
};

const api = args => {
  const core = path.join(__dirname, '..', 'apps', 'ove-core', 'open-api-generate.ts');
  const client = path.join(__dirname, '..', 'apps', 'ove-client', 'open-api-generate.ts');
  const outDir = handlePathname(args.outDir, 'out/documentation/api');
  const coreConfig = args.coreConfig ?? 'api-config.json';
  const clientConfig = handlePathname(args.clientConfig, '~/Application Support/Electron/ove-client-config.json');
  [
    `mkdir -p "${outDir}"`,
    `npx tsx ${core} ${outDir} --configFile="${coreConfig}"`,
    `npx tsx ${client} ${outDir} --configFile="${clientConfig}"`
  ].forEach(run);
};

const show = () => {
  const docsDir = path.join(__dirname, '..', 'docs');
  run(`cd ${docsDir} && node server.js`);
};

const runDocumentation = args => {
  switch (args.__cmd__) {
    case 'api':
      api(args);
      break;
    case 'code':
      code(args);
      break;
    case 'types':
      types(args);
      break;
    case 'build':
      build(args);
      break;
    case 'show':
      show();
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
  runDocumentation(args);
}
