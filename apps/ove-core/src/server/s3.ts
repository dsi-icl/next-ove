/* global globalThis */

import Minio from "minio";
import { env } from "../env";

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

const listObjects = (s3_: Minio.Client, bucketName: string) =>
  new Promise<(Minio.BucketItem & {versionId: string})[]>((resolve, reject) => {
    const stream = s3_
      // @ts-expect-error – missing optional arguments parameter in library type
      .listObjects(bucketName, "", true, { IncludeVersion: true });
    const data: (Minio.BucketItem & {versionId: string})[] = [];
    stream.on("data", obj => data.push(obj as typeof data[0]));
    stream.on("end", () => resolve(data));
    stream.on("error", err => reject(err));
  });

export const S3Controller = {
  listObjects
};
