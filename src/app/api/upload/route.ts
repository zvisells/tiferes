import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

// GET /api/upload?filename=X&fileType=Y - Get a presigned URL for direct R2 upload
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filename = searchParams.get('filename');
    const fileType = searchParams.get('fileType');

    if (!filename || !fileType) {
      return NextResponse.json(
        { error: 'Missing filename or fileType' },
        { status: 400 }
      );
    }

    // Get Cloudflare credentials (support both naming conventions)
    const cfAccessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID || process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const cfSecretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY || process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    const cfBucketName = process.env.CLOUDFLARE_BUCKET_NAME || process.env.CLOUDFLARE_R2_BUCKET_NAME;
    const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CLOUDFLARE_R2_ACCOUNT_ID;
    const cfR2Url = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_URL;

    if (!cfAccessKeyId || !cfSecretAccessKey || !cfBucketName || !cfAccountId || !cfR2Url) {
      console.error('Missing R2 credentials');
      return NextResponse.json(
        { error: 'R2 not configured' },
        { status: 500 }
      );
    }

    // Create a unique key
    const timestamp = Date.now();
    const randomId = crypto.randomBytes(6).toString('hex');
    const key = `${fileType}/${timestamp}-${randomId}-${filename}`;

    console.log('🔵 Generating presigned URL for:', key);

    // Create S3 client for R2
    const s3Client = new S3Client({
      region: 'auto',
      credentials: {
        accessKeyId: cfAccessKeyId,
        secretAccessKey: cfSecretAccessKey,
      },
      endpoint: `https://${cfAccountId}.r2.cloudflarestorage.com`,
    });

    // Generate presigned PUT URL (valid for 1 hour)
    const command = new PutObjectCommand({
      Bucket: cfBucketName,
      Key: key,
    });

    // Get the presigned URL - this will generate the correct R2 URL
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    // For the public URL, use the configured public domain
    const publicUrl = `${cfR2Url}/${key}`;

    console.log('Presigned URL generated:', presignedUrl);
    console.log('Public URL will be:', publicUrl);

    console.log('✅ Presigned URL generated');

    return NextResponse.json(
      {
        presignedUrl,
        publicUrl,
        key,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Presigned URL error:', error);
    return NextResponse.json(
      { error: `Failed to generate presigned URL: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// POST /api/upload - Handle file upload from client directly to R2
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('fileType') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log(`📥 Received upload request: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    // Get Cloudflare credentials
    const cfAccessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const cfSecretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    const cfBucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
    const cfAccountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
    const cfR2Url = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_URL;

    if (!cfAccessKeyId || !cfSecretAccessKey || !cfBucketName || !cfAccountId || !cfR2Url) {
      console.error('Missing R2 credentials');
      return NextResponse.json(
        { error: 'R2 not configured' },
        { status: 500 }
      );
    }

    // Create a unique filename
    const timestamp = Date.now();
    const filename = `${fileType}/${timestamp}-${file.name}`;

    try {
      console.log('🔵 Starting R2 upload with AWS SDK:', {
        accountId: cfAccountId,
        bucketName: cfBucketName,
        filename: filename,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      });

      // Convert file to Buffer
      const buffer = await file.arrayBuffer();
      const bufferData = Buffer.from(buffer);

      // Create S3 client for R2
      const s3Client = new S3Client({
        region: 'auto',
        credentials: {
          accessKeyId: cfAccessKeyId,
          secretAccessKey: cfSecretAccessKey,
        },
        endpoint: `https://${cfAccountId}.r2.cloudflarestorage.com`,
      });

      // Upload to R2
      console.log('🚀 Uploading via AWS SDK...');
      const command = new PutObjectCommand({
        Bucket: cfBucketName,
        Key: filename,
        Body: bufferData,
        ContentType: file.type || 'application/octet-stream',
      });

      const response = await s3Client.send(command);
      console.log('✅ Upload successful, ETag:', response.ETag);

      // Return public URL
      const publicUrl = `${cfR2Url}/${filename}`;
      console.log('✅ File available at:', publicUrl);
      return NextResponse.json({ url: publicUrl }, { status: 200 });
    } catch (r2Error) {
      console.error('❌ R2 upload failed:', r2Error);
      const errorMessage = r2Error instanceof Error ? r2Error.message : String(r2Error);
      console.error('Error details:', errorMessage);
      return NextResponse.json(
        { error: `R2 upload failed: ${errorMessage}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    return NextResponse.json(
      { error: `Upload failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
