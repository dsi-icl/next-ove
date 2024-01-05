const z = require('zod').z;
const readFileSync = require('fs').readFileSync;
const writeFileSync = require('fs').writeFileSync;
const execSync = require('child_process').execSync;

const ConfigSchema = z.strictObject({
  configFile: z.string(),
  adminToken: z.string(),
  buildToken: z.string(),
  baseURL: z.string(),
  serverBaseURL: z.string()
});

const config = ConfigSchema.parse(JSON.parse(readFileSync(process.argv.at(2)).toString()));

/** @type {() => string[]} */
const buildURLs = () => [
  config.baseURL,
  `${config.baseURL}/login`,
  `${config.baseURL}/hardware`
];

const urls = buildURLs();
writeFileSync(config.configFile, JSON.stringify({
  ci: {
    collect: {
      url: urls
    },
    upload: {
      target: 'lhci',
      serverBaseUrl: config.serverBaseURL,
      token: config.buildToken
    },
  }
}, undefined, 2));

/** @type {Buffer} */
const res = execSync(`lhci autorun --config=${config.configFile} --disable-storage-reset`);
console.log(res.toString());
