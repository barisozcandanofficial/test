import { S3Client } from '@aws-sdk/client-s3';

// R2 is S3-compatible, so we use AWS SDK
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
export const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB

