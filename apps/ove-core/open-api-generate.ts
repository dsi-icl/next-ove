import { openApiDocument } from "./src/server/open-api";
import * as fs from "fs";
import * as path from "path";
import { env } from "./src/env";

fs.mkdirSync(path.join(process.argv[2], `v${env.API_VERSION}`), { recursive: true });
fs.writeFileSync(path.join(process.argv[2], `v${env.API_VERSION}`, "ove-core.swagger.json"), JSON.stringify(openApiDocument, undefined, 2));
process.exit(0);