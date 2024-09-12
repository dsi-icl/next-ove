const path = require('path');
const {
  printSchemas,
  run,
  parseArgs, defaultAlias, makeSchema
} = require('./utils');
const z = require('zod').z;

const tagline = 'Development tools for next-ove';
const help = 'Use "npm run dev [COMMAND] -- --help" for more information about a command';
const descriptions = {};
const description = 'DESCRIPTION\n\tDevelopment tools for next-ove.';

const activePatches = { 'optional-deps': path.join(__dirname, '..', 'dev', 'cli', 'remove-optional-deps.sh') };
const supportedTools = {
  'sign-in': path.join(__dirname, '..', 'dev', 'cli', 'generate-token.js'),
  'screen-control': path.join(__dirname, '..', 'dev', 'cli', 'mdc-control.js')
};

const schemas = {
  build: z.strictObject({
    __cmd__: z.literal('build'),
    component: z.union([z.literal('client'), z.literal('bridge'), z.literal('core')]),
    arch: z.union([z.literal('x64'), z.literal('arm64')]).optional(),
    platform: z.union([z.literal('mac'), z.literal('linux'), z.literal('windows'), z.literal('linux/amd64'), z.literal('arm64')]).optional(),
    version: z.string().optional()
  }),
  deploy: z.strictObject({
    __cmd__: z.literal('deploy'),
    component: z.union([z.literal('client'), z.literal('bridge'), z.literal('core')]),
    version: z.string(),
    target: z.string(),
    screens: z.string().optional(),
    asset: z.string().optional()
  }),
  services: z.strictObject({
    __cmd__: z.literal('services'),
    action: z.union([z.literal('start'), z.literal('stop'), z.literal('populate')])
  }),
  patch: z.strictObject({
    __cmd__: z.literal('patch'),
    name: z.string().refine(x => Object.keys(activePatches).includes(x))
  }),
  tools: z.strictObject({
    __cmd__: z.literal('tools'),
    name: z.string().refine(x => Object.keys(supportedTools).includes(x))
  }),
  mock: z.strictObject({
    __cmd__: z.literal('mock'),
    component: z.union([z.literal('bridge'), z.literal('renderer')])
  })
};

const refinements = {
  build: x => {
    switch (x.component) {
      case 'client':
      case 'bridge':
        return x.version === undefined && x.arch !== undefined && (x.platform === undefined || ['mac', 'linux', 'windows'].includes(x.platform));
      case 'core':
        if (x.platform === 'linux/amd64') {
          return x.arch === undefined && x.version !== undefined && /\d+\.\d+\.\d+/.test(x.version);
        } else if (x.platform === 'linux/arm64') {
          return x.arch === undefined && x.version !== undefined && /\d+\.\d+\.\d+-arm/.test(x.version);
        } else return false;
    }
  },
  deploy: x => (x.component === 'client' && x.screens !== undefined) || x.screens === undefined
};

const schema = makeSchema(schemas, refinements);

const mock = args => {
  const mock = path.join(__dirname, '..', 'dev', 'testing', `mock-${args.component}.js`);
  run(`node ${mock}`);
};

const build = args => {
  const toolDir = path.join(__dirname, '..', 'dev', 'deployment', 'scripts');
  let platform = '';
  if (args.platform !== undefined) {
    platform = ` --platform=${args.platform}`;
  }
  switch (args.component) {
    case 'client':
    case 'bridge':
      run(`${path.join(toolDir, `build-${args.component}.sh`)} --arch=${args.arch}${platform}`);
      break;
    case 'core':
      run(`${path.join(toolDir, `build-core.sh`)} --version=${args.version}${platform}`);
      break;
  }
};

const services = args => {
  const composeDir = path.join(__dirname, '..', 'dev', 'services');
  const populate = path.join(__dirname, '..', 'dev', 'cli', 'auto-populate', 'auto-populate.js');
  switch (args.action) {
    case 'start':
      run(`cd ${composeDir} && docker compose up -d`);
      break;
    case 'stop':
      run(`cd ${composeDir} && docker compose down`);
      break;
    case 'populate':
      run(`node ${populate}`);
      break;
  }
};

const tools = args => {
  const tool = supportedTools[args.name];
  run(tool.endsWith('.sh') ? tool : `node ${tool}`);
};

const patch = args => {
  const patch = activePatches[args.name];
  run(patch);
};

const deploy = args => {
  let asset = '';
  let screens = '';
  let script = path.join(__dirname, '..', 'dev', 'deployment', 'scripts', `deploy-${args.component}.sh`);
  if (args.asset !== undefined) {
    asset = ` --asset=${args.asset}`;
  }
  if (args.screens !== undefined) {
    screens = args.screens.split(',').map((screen, i) => ` --screen${i + 1}=${screen}`);
  }

  run(`${script} --version=${args.version} --target=${args.target}${screens}${asset}`);
};

const runDev = args => {
  switch (args.__cmd__) {
    case 'mock':
      mock(args);
      break;
    case 'build':
      build(args);
      break;
    case 'services':
      services(args);
      break;
    case 'tools':
      tools(args);
      break;
    case 'patch':
      patch(args);
      break;
    case 'deploy':
      deploy(args);
      break;
    default:
      throw new Error('Unknown command');
  }
};

const args = parseArgs(schema, true, defaultAlias, {
  build: ["component"],
  deploy: ["component", "version", "target"],
  services: ["action"],
  mock: ["component"],
  tools: ["name"],
  patch: ["name"]
});

if (args.__cmd__ === undefined && args.help) {
  printSchemas(schemas, tagline, description, descriptions, help);
} else if (args.help) {
  printSchemas(schemas, tagline, description, descriptions, help, args.__cmd__);
} else {
  runDev(args);
}
