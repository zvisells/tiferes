import { S3Client } from '@aws-sdk/client-s3';

export function getR2Config() {
  const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID || process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '';
  const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY || process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '';
  const bucketName = process.env.CLOUDFLARE_BUCKET_NAME || process.env.CLOUDFLARE_R2_BUCKET_NAME || '';
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CLOUDFLARE_R2_ACCOUNT_ID || '';
  const publicUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_URL || '';

  if (!accessKeyId || !secretAccessKey || !bucketName || !accountId || !publicUrl) {
    throw new Error('R2 not configured');
  }

  return { accessKeyId, secretAccessKey, bucketName, accountId, publicUrl };
}

export function getR2Client() {
  const { accessKeyId, secretAccessKey, accountId } = getR2Config();

  return new S3Client({
    region: 'auto',
    credentials: { accessKeyId, secretAccessKey },
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  });
}
