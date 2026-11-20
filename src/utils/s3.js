import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import path from "path";
import env from "../config/env.js";

const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

const assertS3Config = () => {
  if (
    !env.AWS_REGION ||
    !env.AWS_ACCESS_KEY_ID ||
    !env.AWS_SECRET_ACCESS_KEY ||
    !env.AWS_S3_BUCKET_NAME
  ) {
    const error = new Error("S3 is not configured");
    error.statusCode = 500;
    throw error;
  }
};

const uploadToS3 = async (file, folder) => {
  assertS3Config();

  const extension = path.extname(file.originalname || "").toLowerCase();
  const key = `${folder}/${randomUUID()}${extension}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  return `https://${env.AWS_S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
};

const deleteFromS3 = async (fileUrl) => {
  if (!fileUrl || !env.AWS_S3_BUCKET_NAME || !fileUrl.includes(env.AWS_S3_BUCKET_NAME)) {
    return;
  }

  const marker = ".amazonaws.com/";
  const index = fileUrl.indexOf(marker);

  if (index === -1) return;

  const key = decodeURIComponent(fileUrl.slice(index + marker.length));

  await s3.send(
    new DeleteObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: key,
    })
  );
};

export { uploadToS3, deleteFromS3 };
