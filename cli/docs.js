const path = require('path');
const {
  printSchemas,
  handlePathname,
  run,
  parseArgs, defaultAlias, makeSchema
} = require('./utils');
const glob = require('glob');
const z = require('zod').z;
const fs = require('fs');
const execSync = require('child_process').execSync;

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
    coverageDir: z.string().optional(),
    cssDir: z.string().optional()
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
  const docsDir = path.join(__dirname, '..', 'docs');
  const specsDir = path.join(__dirname, '..', 'docs', 'specs');

  const buildCode = () => {
    const codeDir = handlePathname(args.codeDir, 'out/documentation/code');
    if (!fs.existsSync(codeDir)) {
      console.log('Missing code documentation, this can be generated using "npm run analyse code".');
      return [];
    }
    return [`cp -R ${codeDir} ${docsDir}`];
  };

  const buildTypes = () => {
    const typesDir = handlePathname(args.typesDir, 'out/documentation/types');
    if (!fs.existsSync(typesDir)) {
      console.log('Missing type documentation, this can be generated using "npm run analyse types".');
      return [];
    }
    return [`cp -R ${typesDir} ${docsDir}`];
  };

  const buildAPIs = () => {
    const apiDir = handlePathname(args.apiDir, 'out/documentation/api');
    if (!fs.existsSync(apiDir)) {
      console.log('Missing API documentation, this can be generated using "npm run analyse api".');
      return [];
    }
    return [`cp -R ${apiDir} ${docsDir}`];
  };

  const buildCoverage = () => {
    const coverageDir = handlePathname(args.coverageDir, 'out/coverage');
    if (!fs.existsSync(coverageDir)) {
      console.log('Missing test & type coverage, this can be generated using "npm run test" for test coverage and "npm run analyse types" for type coverage.');
      return [];
    }
    return [`cp -R ${coverageDir} ${docsDir}`];
  };

  const buildFeatures = () => {
    const featuresDir = path.join(__dirname, '..', 'docs', 'features');
    if (!fs.existsSync(featuresDir)) {
      console.log('Missing feature documentation, this can be found on the GitHub.');
      return [];
    }
    let pandocInstalled;
    const featuresPublicDir = path.join(featuresDir, 'public');
    const template = path.join(__dirname, '..', 'tools', 'doc-viewer', 'templates', 'feature.html');

    try {
      execSync('pandoc -v');
      pandocInstalled = true;
    } catch (e) {
      pandocInstalled = false;
    }

    if (!pandocInstalled) {
      console.log('Using unformatted feature documentation, for formatted output, please install pandoc.');
      return [];
    }

    return [
      `mkdir -p ${featuresPublicDir}`,
      ...glob.globSync(path.join(__dirname, '..', 'docs', 'features', '*.md')).flatMap(feature => {
        const name = feature.split('/').at(-1).split('.').at(0);
        const title = name.split('-').map(x => `${x.charAt(0).toUpperCase()}${x.slice(1)}`).join(' ');
        const file = path.join(featuresPublicDir, `${name}.html`);

        return [
          `pandoc ${feature} > ${file}`,
          `node -e "${[
            'const fs = require(\'fs\')',
            `const data = fs.readFileSync('${file}').toString()`,
            `const template = fs.readFileSync('${template}').toString().replace('%%title%%', '${title}').replace('%%body%%', data)`,
            `fs.writeFileSync('${file}', template);`
          ].join('; ')}"`
        ];
      })
    ];
  };

  const buildPackages = () => {
    const packagesDir = handlePathname(args.packageDir, 'out/analysis/packages');
    if (!fs.existsSync(packagesDir)) {
      console.log('Missing package analysis, this can be generated using "npm run analyse packages".');
      return [];
    }
    return [`cp -R ${packagesDir} ${docsDir}`];
  };

  const buildCSS = () => {
    const cssDir = handlePathname(args.cssDir, 'out/analysis/css');
    if (!fs.existsSync(cssDir)) {
      console.log('Missing CSS compatibility information, this can be generated using "npm run analyse css".');
      return [];
    }
    return [`cp -R ${cssDir} ${docsDir}`];
  };

  if (!fs.existsSync(specsDir)) {
    console.log('Missing specifications, these can be found on the GitHub');
  }

  [
    ...buildCSS(),
    ...buildPackages(),
    ...buildTypes(),
    ...buildCode(),
    ...buildAPIs(),
    ...buildCoverage(),
    ...buildFeatures()
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
  const docsDir = path.join(__dirname, '..', 'tools', 'doc-viewer');
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
