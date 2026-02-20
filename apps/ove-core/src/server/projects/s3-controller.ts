/* global Buffer */

import * as Minio from "minio";
import { Readable } from "stream";

type BucketItem = Minio.BucketItem & {
  versionId: string;
  isLatest: boolean;
  lastModified: Date;
};

const listObjects = (s3: Minio.Client, bucketName: string) =>
  new Promise<BucketItem[]>((resolve, reject) => {
    const stream = s3.listObjects(bucketName, "", true, {
      IncludeVersion: true,
    });
    const data: BucketItem[] = [];
    stream.on("data", (obj) => data.push(obj as (typeof data)[0]));
    stream.on("end", () => resolve(data));
    stream.on("error", (err) => reject(err));
  });

const createBucket = async (s3: Minio.Client, bucketName: string) => {
  await s3.makeBucket(bucketName);
  const versioningConfig = { Status: "Enabled" as const };
  await s3.setBucketVersioning(bucketName, versioningConfig);
};

const listBuckets = (s3: Minio.Client) => s3.listBuckets();

const bucketExists = (s3: Minio.Client, bucketName: string) =>
  s3.bucketExists(bucketName);

const uploadFile = (
  s3: Minio.Client,
  bucketName: string,
  objectName: string,
  data: string | Buffer | Uint8Array,
) => {
  const rs =
    typeof data === "string"
      ? Readable.from([Buffer.from(data, "utf8")])
      : Buffer.isBuffer(data)
        ? Readable.from([data])
        : Readable.from(data);
  return s3.putObject(bucketName, objectName, rs);
};

const getPresignedGetURL = (
  s3: Minio.Client,
  bucketName: string,
  objectName: string,
  versionId: string | undefined,
) =>
  s3.presignedGetObject(
    bucketName,
    objectName,
    24 * 60 * 60,
    versionId === undefined ? undefined : { versionId },
  );

const getPresignedPutURL = (
  s3: Minio.Client,
  bucketName: string,
  objectName: string,
) => s3.presignedPutObject(bucketName, objectName);

const statObject = (s3: Minio.Client, bucketName: string, objectName: string) =>
  s3.statObject(bucketName, objectName);

const setBucketNotification = async (
  s3: Minio.Client,
  bucketName: string,
  args: { arn: string },
) => {
  const bucketNotification = new Minio.NotificationConfig();

  const suffixes = [
    ".md",
    ".markdown",
    ".tex",
    ".latex",
    ".png",
    ".jpg",
    ".jpeg",
    ".tiff",
    ".tif",
    ".webp",
  ];
  for (const suffix of suffixes) {
    const queue = new Minio.QueueConfig(args.arn);
    queue.addEvent(Minio.ObjectCreatedAll);
    queue.addFilterSuffix(suffix);
    bucketNotification.add(queue);
  }
  await s3.setBucketNotification(bucketName, bucketNotification);
};

export const S3Controller = {
  listObjects,
  createBucket,
  listBuckets,
  bucketExists,
  uploadFile,
  getPresignedGetURL,
  getPresignedPutURL,
  statObject,
  setBucketNotification,
};
