import { openApiDocument } from "./src/open-api";
import { env } from "./src/env";
import * as fs from "fs";
import * as path from "path";

fs.mkdirSync(path.join(process.argv[2], `v${env.API_VERSION}`), { recursive: true });
fs.writeFileSync(path.join(process.argv[2], `v${env.API_VERSION}`, "ove-client.swagger.json"), JSON.stringify(openApiDocument, undefined, 2));
process.exit(0);