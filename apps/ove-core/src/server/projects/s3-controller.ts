import Minio from "minio";
import { Readable } from "stream";

type BucketItem = Minio.BucketItem & {
  versionId: string
  isLatest: boolean
  lastModified: Date
}

const listObjects = (
  s3: Minio.Client,
  bucketName: string
) => new Promise<BucketItem[]>((resolve, reject) => {
  const stream = s3
    // @ts-expect-error – missing optional arguments parameter in library type
    .listObjects(bucketName, "", true, { IncludeVersion: true });
  const data: BucketItem[] = [];
  stream.on("data", obj => data.push(obj as typeof data[0]));
  stream.on("end", () => resolve(data));
  stream.on("error", err => reject(err));
});

const createBucket = async (s3: Minio.Client, bucketName: string) => {
  await s3.makeBucket(bucketName);
  const versioningConfig = { Status: "Enabled" };
  await s3.setBucketVersioning(bucketName, versioningConfig);
};

const listBuckets = (s3: Minio.Client) => s3.listBuckets();

const bucketExists = (s3: Minio.Client, bucketName: string) =>
  s3.bucketExists(bucketName);

const uploadFile = (
  s3: Minio.Client,
  bucketName: string,
  objectName: string,
  data: string
) => {
  const rs = Readable.from(data, { encoding: "utf-8" });
  return s3.putObject(bucketName, objectName, rs);
};

const getPresignedGetURL = (
  s3: Minio.Client,
  bucketName: string,
  objectName: string,
  versionId: string | undefined
) => s3.presignedGetObject(
  bucketName,
  objectName,
  24 * 60 * 60,
  versionId === undefined ? undefined : { versionId }
);

const getPresignedPutURL = (
  s3: Minio.Client,
  bucketName: string,
  objectName: string
) => s3.presignedPutObject(bucketName, objectName);

export const S3Controller = {
  listObjects,
  createBucket,
  listBuckets,
  bucketExists,
  uploadFile,
  getPresignedGetURL,
  getPresignedPutURL
};
