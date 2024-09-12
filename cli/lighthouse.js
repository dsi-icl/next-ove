const path = require('path');
const {
  printSchemas,
  handlePathname,
  run,
  parseArgs, makeSchema, defaultAlias
} = require('./utils');
const z = require('zod').z;

const tagline = 'Lighthouse scoring for next-ove';
const help = 'Use "npm run lighthouse [COMMAND] -- --help" for more information about a command';
const descriptions = {};
const description = 'DESCRIPTION\n\tGenerates Lighthouse scores for the next-ove UIs.';

const schemas = {
  audit: z.strictObject({
    __cmd__: z.literal('audit'),
    config: z.string().optional()
  }),
  wizard: z.strictObject({
    __cmd__: z.literal('wizard')
  }),
  server: z.strictObject({
    __cmd__: z.literal('server'),
    config: z.string().optional(),
    port: z.coerce.number().optional(),
    storageMethod: z.string().optional(),
    sqlDialect: z.string().optional(),
    sqlDatabasePath: z.string().optional()
  })
};

const schema = makeSchema(schemas);

const audit = args => {
  const lighthouse = path.join(__dirname, '..', 'tools', 'lighthouseci', 'audit.js');
  const config = handlePathname(args.config, 'tools/lighthouseci/config.json');
  const outDir = handlePathname(args.outDir, 'out/lighthouse');

  [
    `mkdir -p ${outDir}`,
    `node ${lighthouse} ${config}`
  ].forEach(run);
};

const wizard = () => {
  run("npx lhci wizard");
};

const server = args => {
  const config = handlePathname(args.config, 'tools/lighthouseci/lighthouserc.json');
  const port = args.port ?? 9002;
  const storageMethod = args.storageMethod ?? 'sql';
  const sqlDialect = args.sqlDialect ?? 'sqlite';
  const sqlDatabasePath = handlePathname(args.sqlDatabasePath, 'tools/lighthouseci/db.sql');

  run(`npx lhci server --config=${config} --port=${port} --storage.storageMethod=${storageMethod} --storage.sqlDialect=${sqlDialect} --storage.sqlDatabasePath=${sqlDatabasePath}`);
};

const runLighthouse = args => {
  switch (args.__cmd__) {
    case 'audit':
      audit(args);
      break;
    case 'wizard':
      wizard();
      break;
    case 'server':
      server(args);
      break;
  }
};

const args = parseArgs(schema, true, defaultAlias);

if (args.__cmd__ === undefined && args.help) {
  printSchemas(schemas, tagline, description, descriptions, help);
} else if (args.help) {
  printSchemas(schemas, tagline, description, descriptions, help, args.__cmd__);
} else {
  runLighthouse(args);
}
