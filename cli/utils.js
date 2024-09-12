const path = require("path");
const { execSync } = require('child_process');
const { ZodEffects, z } = require('zod');

const version = require(path.join(__dirname, '..', 'package.json')).version;
const tab = "  ";

const formatSchema = schema => {
  const formatOption = (args, k) => args[k].isOptional() ? `[${k}]` : k;

  if (Object.keys(schema).length > 1) {
    return `${schema.__cmd__.value}: ${Object.keys(schema).filter(x => x !== '__cmd__').map(formatOption.bind(null, schema)).join(' ')}`;
  } else {
    return schema.__cmd__?.value;
  }
};

const pad = (arr, key) => {
  const maxLen = arr.reduce((l, x) => Math.max(l, x.length), 0);
  return `${arr[key]}${Array.from({ length: maxLen - arr[key].length }).map(() => ' ').join('')}`;
};

const getShape = schema => schema instanceof ZodEffects ? schema._def.schema.shape : schema.shape;

module.exports.printSchemas = (schemas, tagline, description, descriptions, help, command) => {
  if (command !== undefined) {
    console.log(formatSchema(getShape(schemas[command])));
    return;
  }
  console.log(`next-ove CLI v${version}\n`);
  console.log(`${tagline}\n`);
  console.log(`${description}\n`);
  console.log(`USAGE`);
  Object.values(schemas).map(getShape).map(formatSchema).filter(Boolean).forEach((output, i, arr) => {
    console.log(`${tab}${pad(arr.map(x => x.split(': ')[0]), i)}  ${output.split(': ').at(1) ?? ''}`);
  });
  console.log('\nAvailable Commands');
  Object.values(schemas).map(schema => getShape(schema).__cmd__?.value).filter(Boolean).forEach((cmd, i, arr) => console.log(`${tab}${pad(arr, i)}${tab}${descriptions[cmd] ?? ""}`));
  console.log('\nFlags');
  console.log(`${tab}-h, --help${tab} help for next-ove CLI`);
  console.log(`${help}`);
};

const zodBooleanPreprocess = x => x === 'true' ? true : (x === 'false' ? false : undefined);
module.exports.zodBooleanPreprocess = zodBooleanPreprocess;

module.exports.handlePathname = (output, default_, suffix) => {
  if (output === undefined) {
    if (default_.startsWith('/')) {
      return path.join('/', ...default_.split('/'), suffix ?? '');
    } else if (default_.startsWith("~")) {
      return path.join(...default_.split('/'), suffix ?? '');
    } else {
      return path.join(__dirname, '..', ...default_.split('/'), suffix ?? '');
    }
  } else if (output.startsWith('/')) {
    return path.join('/', ...output.split('/'), suffix ?? '');
  } else if (output.startsWith("~")) {
    return path.join(...output.split('/'), suffix ?? '');
  } else {
    return path.join(__dirname, '..', ...output.split('/'), suffix ?? '');
  }
};

module.exports.run = command => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(command);
  } else {
    try {
      execSync(command, {stdio: 'inherit'});
    } catch (_e) {
      console.error('Command failed:', command);
    }
  }
};

module.exports.postprocessArgs = (args, positional = []) => {
  args._.forEach((arg, i) => {
    if (i === 0) {
      args.__cmd__ = arg;
    } else if (i === 1) {
      args.__entrypoint__ = arg;
    } else {
      args[positional[i - 2]] = arg;
    }
  });
  return args;
};

module.exports.parseArgs = (schema, hasCommand, alias = {}, arguments = {}) => {
  let hasFlag = false;
  const args = (/** @type{string[]} */process.argv).reduce((args, arg, i) => {
    const [k, v] = arg.split('=');
    if (arg.startsWith('--')) {
      hasFlag = true;
      args[k.slice(2)] = v ?? true;
      return args;
    } else if (arg.startsWith('-')) {
      hasFlag = true;
      args[alias[k.slice(1)] ?? k.slice(1)] = v ?? true;
      return args;
    } else {
      if (hasFlag) throw new Error("Arguments out of order");
      args._.push(arg);
      switch (i) {
        case 0:
          args.__program__ = arg;
          args._.shift();
          break;
        case 1:
          args.__entrypoint__ = arg;
          args._.shift();
          break;
        case 2:
          if (hasCommand) {
            args.__cmd__ = arg;
            args._.shift();
            break;
          }
        default:
          const p = (arguments[args.__cmd__] ?? []);
          if (p.length < i - 3) break;
          args[p[i - 3]] = arg;
          break;
      }
      return args;
    }
  }, { _: [] });
  return args.help ? args : schema.parse(args);
};

const defaultSchema = z.strictObject({
  __program__: z.string(),
  __entrypoint__: z.string(),
  _: z.string().array(),
  help: z.boolean().optional()
});
module.exports.defaultSchema = defaultSchema;

module.exports.defaultAlias = {
  h: "help"
};

module.exports.makeSchema = (schemas, refinements = {}) => z.union(Object.entries(schemas).map(([k, schema]) => {
  const extended = schema.extend(defaultSchema.shape);
  if (k in refinements) {
    return extended.refine(refinements[k]);
  }
  return extended;
}));