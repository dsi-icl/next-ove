const path = require('path');
const {
  printSchemas,
  zodBooleanPreprocess,
  handlePathname,
  run,
  parseArgs, defaultAlias, makeSchema
} = require('./utils');
const z = require('zod').z;

const tagline = 'Analyse the next-ove system';
const help = 'Use "npm run analyse [COMMAND] -- --help" for more information about a command';
const descriptions = {
  bundle: 'Analyse the web bundle of the UI components',
  packages: 'Audit and list dependencies, identify security issues and deprecations',
  css: 'Analyse CSS browser compatibility',
  coverage: 'Determine the coverage of TypeScript types throughout the codebase'
};
const description = 'DESCRIPTION\n\tPackage & bundle analysis, css compatibility and type checking & coverage for the next-ove system.';

const schemas = {
  bundle: z.strictObject({
    __cmd__: z.literal('bundle'),
    component: z.union([z.literal('core'), z.literal('bridge'), z.literal('client')]).optional(),
    open: z.preprocess(zodBooleanPreprocess, z.boolean().optional()),
    outDir: z.string().optional()
  }),
  packages: z.strictObject({
    __cmd__: z.literal('packages'),
    outDir: z.string().optional()
  }),
  css: z.strictObject({
    __cmd__: z.literal('css'),
    outDir: z.string().optional()
  }),
  coverage: z.strictObject({
    __cmd__: z.literal('coverage'),
    outDir: z.string().optional()
  })
};

const schema = makeSchema(schemas);

const bundle = args => {
  const bundleComponent = c => {
    const appDir = path.join(__dirname, '..', 'apps', `ove-${c}-ui`);
    const open = args.open ?? false;
    const outDir = handlePathname(args.outDir, 'out/analysis/bundle');
    const output = path.join(outDir, `ove-${c}.html`);
    const distDir = path.join(__dirname, '..', 'dist');

    [
      `mkdir -p ${outDir}`,
      `cd ${appDir} && npx vite-bundle-visualizer --open=${open} --output=${output}`,
      `npx rimraf ${distDir}`
    ].forEach(run);
  };

  if (args.component === undefined) {
    bundleComponent('client');
    bundleComponent('bridge');
    bundleComponent('core');
  } else {
    bundleComponent(args.component);
  }
};

const packages = args => {
  const outDir = handlePathname(args.outDir, 'out/analysis/packages');
  const auditOutput = path.join(outDir, 'audit.txt');
  const aquaNautilusDir = path.join(__dirname, '..', 'tools', 'aqua-nautilus');
  const aquaNautilus = path.join(aquaNautilusDir, 'analyze.sh');
  const aquaNautilusOutput = path.join(aquaNautilusDir, 'analysis.txt');
  const deprecationOutput = path.join(outDir, 'deprecated.txt');
  const sandwormOutput = path.join(outDir, 'security');
  const packagesTxt = path.join(outDir, 'packages.txt');
  const packagesJSON = path.join(outDir, 'packages.json');
  const updates = path.join(outDir, 'updates.txt');

  [
    `mkdir -p ${sandwormOutput}`,
    `npm audit > ${auditOutput}`,
    `${aquaNautilus}`,
    `cp ${aquaNautilusOutput} ${deprecationOutput}`,
    `npm ls --all --json --silent > ${packagesJSON}`,
    `npm ls --all --silent > ${packagesTxt}`,
    `tail -n +2 ${packagesTxt} > ${packagesTxt}`,
    `npx sandworm-audit -o ${sandwormOutput} --summary -d --max-depth=5`,
    `find ${sandwormOutput} -name *-report.json | xargs -I '{}' mv {} report.json`,
    `find ${sandwormOutput} -name *-dependencies.csv | xargs -I '{}' mv {} dependencies.csv`,
    `find ${sandwormOutput} -name *-treemap.svg | xargs -I '{}' mv {} treemap.svg`,
    `npx taze -l -r --ignore-paths node_modules major --sort time-desc > ${updates}`
  ].forEach(run);
};

const css = args => {
  const outDir = handlePathname(args.outDir, 'out/analysis/css');
  const doiuse = path.join(__dirname, '..', 'tools', 'doiuse', 'doiuse.js');
  const output = path.join(outDir, 'browser-usage.json');

  run(`node ${doiuse} ${output}`);
};

const coverage = args => {
  const outDir = handlePathname(args.outDir, 'out/coverage/types');

  [
    `mkdir -p ${outDir}`,
    `npx typescript-coverage-report -o ${outDir}`
  ].forEach(run);
};

const runAnalysis = args => {
  switch (args.__cmd__) {
    case 'bundle':
      bundle(args);
      break;
    case 'packages':
      packages(args);
      break;
    case 'css':
      css(args);
      break;
    case 'coverage':
      coverage(args);
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
