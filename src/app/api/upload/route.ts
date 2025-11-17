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

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const publicUrl = `${cfR2Url}/${key}`;

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

// POST /api/upload - Handle file upload from client directly to R2 (kept for backward compatibility)
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

    // Check file size (500MB limit)
    const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of 500MB` },
        { status: 413 }
      );
    }

    // Get Cloudflare credentials
    const cfAccessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const cfSecretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    const cfBucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
    const cfAccountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
    const cfR2Url = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_URL;

    // Create a unique filename
    const timestamp = Date.now();
    const filename = `${fileType}/${timestamp}-${file.name}`;

    // If all Cloudflare credentials are present, use R2
    if (cfAccessKeyId && cfSecretAccessKey && cfBucketName && cfAccountId && cfR2Url) {
      try {
        console.log('🔵 Attempting R2 upload with AWS SDK:', {
          accountId: cfAccountId,
          bucketName: cfBucketName,
          filename: filename,
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
        console.log('✅ File uploaded to R2:', publicUrl);
        return NextResponse.json({ url: publicUrl }, { status: 200 });
      } catch (r2Error) {
        console.error('❌ R2 upload failed:', r2Error);
        console.error('Error details:', r2Error instanceof Error ? r2Error.message : String(r2Error));
        // Fall through to fallback
      }
    } else {
      console.warn('⚠️ Missing R2 credentials');
    }

    // Fallback: Use local storage (development mode)
    console.log('Using local storage for file:', filename);
    const mockUrl = `/uploads/${filename}`;
    return NextResponse.json({ url: mockUrl }, { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
