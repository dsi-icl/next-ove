const path = require("path");
const {
  printSchemas,
  run,
  parseArgs,
  defaultAlias,
  makeSchema,
} = require("./utils.cjs");
const z = require("zod").z;

const tagline = "Manage the next-ove database";
const help =
  'Use "npm run db [COMMAND] -- --help" for more information about a command';
const descriptions = {
  sync: "Generate type definitions from DB schema",
  push: "Push schema changes to the database",
  pull: "Pull schema changes from the database",
  user: "User management functionality. Currently supports adding users",
  service:
    "Service management functionality. Currently supports adding services",
  show: "Open database viewer in browser",
};
const description = "DESCRIPTION\n\tManage the next-ove database.";

const schemas = {
  sync: z.strictObject({
    __cmd__: z.literal("sync"),
    component: z.union([z.literal("core"), z.literal("logging")]).optional(),
  }),
  push: z.strictObject({
    __cmd__: z.literal("push"),
    component: z.union([z.literal("core"), z.literal("logging")]).optional(),
  }),
  pull: z.strictObject({
    __cmd__: z.literal("pull"),
    component: z.union([z.literal("core"), z.literal("logging")]).optional(),
  }),
  user: z.strictObject({
    __cmd__: z.literal("user"),
    action: z.union([z.literal("add")]),
  }),
  service: z.strictObject({
    __cmd__: z.literal("service"),
    action: z.union([z.literal("add")]),
  }),
  show: z.strictObject({
    __cmd__: z.literal("show"),
    component: z.union([z.literal("core"), z.literal("logging")]).optional(),
  }),
};

const schema = makeSchema(schemas);

const show = (schema) => {
  const schemaFile = path.join(__dirname, "..", "tools", "db", schema);

  run(`pnpm prisma studio --schema='${schemaFile}'`, args.dryRun);
};

const sync = (schema) => {
  const schemaFile = path.join(__dirname, "..", "tools", "db", schema);
  run(`pnpm prisma generate --schema='${schemaFile}'`, args.dryRun);
};

const push = (schema) => {
  const schemaFile = path.join(__dirname, "..", "tools", "db", schema);
  run(`pnpm prisma db push --schema='${schemaFile}'`, args.dryRun);
};

const pull = (schema) => {
  const schemaFile = path.join(__dirname, "..", "tools", "db", schema);
  run(`pnpm prisma db pull --schema='${schemaFile}'`, args.dryRun);
};

const user = (args) => {
  let script;

  switch (args.action) {
    case "add":
      script = path.join(__dirname, "..", "tools", "db", "add-user.cjs");
      break;
    default:
      throw new Error("Unknown action");
  }

  run(`node ${script}`, args.dryRun);
};

const service = (args) => {
  let script;

  switch (args.action) {
    case "add":
      script = path.join(__dirname, "..", "tools", "db", "add-service.cjs");
      break;
    default:
      throw new Error("Unknown action");
  }

  run(`node ${script}`, args.dryRun);
};

const runDB = (args) => {
  const schema =
    args.component === "logging" ? "logging-schema.prisma" : "schema.prisma";
  switch (args.__cmd__) {
    case "sync":
      sync(schema);
      break;
    case "push":
      push(schema);
      break;
    case "pull":
      pull(schema);
      break;
    case "user":
      user(args);
      break;
    case "service":
      service(args);
      break;
    case "show":
      show(schema);
      break;
    default:
      throw new Error("Unknown command");
  }
};

const args = parseArgs(schema, true, defaultAlias, {
  user: ["action"],
  service: ["action"],
});

if (args.__cmd__ === undefined && args.help) {
  printSchemas(schemas, tagline, description, descriptions, help);
} else if (args.help) {
  printSchemas(schemas, tagline, description, descriptions, help, args.__cmd__);
} else {
  runDB(args);
}
