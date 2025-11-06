/* global globalThis */

import { env, logger } from "../env";
import * as Minio from "minio";
import * as https from "node:https";
import * as fs from "node:fs";

const globalForS3 = globalThis as unknown as { s3: Minio.Client | null };

const createMinio = () => {
  if (globalForS3.s3 !== undefined) return globalForS3.s3;
  if (env.SERVICES.ASSET_STORE === undefined) return null;
  let agent: https.Agent | undefined = undefined;
  if (env.SERVICES.ASSET_STORE.USE_SSL && env.SERVICES.ASSET_STORE.CA_FILE !== undefined) {
    const ca = fs.readFileSync(env.SERVICES.ASSET_STORE.CA_FILE);
    agent = new https.Agent({
      ca
    });
  }
  return new Minio.Client({
    endPoint: env.SERVICES.ASSET_STORE.END_POINT,
    port: env.SERVICES.ASSET_STORE.PORT,
    useSSL: env.SERVICES.ASSET_STORE.USE_SSL,
    transportAgent: agent,
    accessKey: env.SERVICES.ASSET_STORE.ACCESS_KEY,
    secretKey: env.SERVICES.ASSET_STORE.SECRET_KEY,
  });
};
export const s3 = createMinio();
s3?.listBuckets().then(() => logger.info("S3 store connected")).catch((e) => logger.error("Could not connect to S3 store:", e));

if (env.ENVIRONMENT !== "production") globalForS3.s3 = s3;
