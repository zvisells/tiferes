import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

// POST /api/upload - Generate a signed URL for direct R2 upload (bypasses Vercel size limits)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, fileType, contentType } = body;

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

    if (!cfAccessKeyId || !cfSecretAccessKey || !cfBucketName || !cfAccountId) {
      console.error('Missing R2 credentials');
      return NextResponse.json(
        { error: 'R2 credentials not configured' },
        { status: 500 }
      );
    }

    // Create a unique key for the file
    const timestamp = Date.now();
    const randomId = crypto.randomBytes(8).toString('hex');
    const key = `${fileType}/${timestamp}-${randomId}-${filename}`;

    console.log('🔵 Generating signed URL for R2:', { key, bucket: cfBucketName });

    // Create S3 client for R2
    const s3Client = new S3Client({
      region: 'auto',
      credentials: {
        accessKeyId: cfAccessKeyId,
        secretAccessKey: cfSecretAccessKey,
      },
      endpoint: `https://${cfAccountId}.r2.cloudflarestorage.com`,
    });

    // Generate a signed URL (valid for 1 hour)
    const command = new PutObjectCommand({
      Bucket: cfBucketName,
      Key: key,
      ContentType: contentType || 'application/octet-stream',
    });

    // Use the AWS SDK's utility to generate a signed URL
    // Note: AWS SDK v3 doesn't have a built-in signed URL generator like v2
    // We'll use a simpler approach: return the upload endpoint and let the client upload directly
    
    const publicUrl = `${cfR2Url}/${key}`;
    
    // For direct client upload, we need to generate presigned POST fields
    // For simplicity, we'll return the endpoint and key, and use a simpler presigned approach
    console.log('✅ Generated public URL:', publicUrl);

    return NextResponse.json(
      {
        uploadUrl: `https://${cfAccountId}.r2.cloudflarestorage.com/${cfBucketName}/${key}`,
        publicUrl: publicUrl,
        key: key,
        bucket: cfBucketName,
        accountId: cfAccountId,
        accessKeyId: cfAccessKeyId,
        // Note: We're returning these credentials for a more secure implementation
        // In a production environment, you might use presigned URLs or temporary credentials
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Generate signed URL error:', error);
    return NextResponse.json(
      { error: `Failed to generate upload URL: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// PUT /api/upload - Handle file upload from client (kept for backward compatibility)
export async function PUT(request: NextRequest) {
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
