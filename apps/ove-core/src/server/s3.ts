/* global globalThis */

import { env } from "../env";
import * as Minio from "minio";

const globalForS3 = globalThis as unknown as {s3: Minio.Client | null};

const createMinio = () => {
  if (globalForS3.s3 !== undefined) return globalForS3.s3;
  if (env.ASSET_STORE_CONFIG === undefined) return null;
  return new Minio.Client({
    endPoint: env.ASSET_STORE_CONFIG.END_POINT,
    port: env.ASSET_STORE_CONFIG.PORT,
    useSSL: env.ASSET_STORE_CONFIG.USE_SSL,
    accessKey: env.ASSET_STORE_CONFIG.ACCESS_KEY,
    secretKey: env.ASSET_STORE_CONFIG.SECRET_KEY
  });
};
export const s3 = createMinio();

if (env.NODE_ENV !== "production") globalForS3.s3 = s3;
