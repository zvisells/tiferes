import { NextRequest, NextResponse } from 'next/server';
import { CreateMultipartUploadCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import { getR2Client, getR2Config } from '@/lib/r2';

export async function POST(req: NextRequest) {
  try {
    const { filename, fileType, contentType } = await req.json();

    if (!filename || !fileType) {
      return NextResponse.json({ error: 'Missing filename or fileType' }, { status: 400 });
    }

    const { bucketName, publicUrl } = getR2Config();
    const s3 = getR2Client();

    const timestamp = Date.now();
    const randomId = crypto.randomBytes(6).toString('hex');
    const key = `${fileType}/${timestamp}-${randomId}-${filename}`;

    const command = new CreateMultipartUploadCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType || 'application/octet-stream',
    });

    const { UploadId } = await s3.send(command);

    return NextResponse.json({
      uploadId: UploadId,
      key,
      publicUrl: `${publicUrl}/${key}`,
    });
  } catch (error) {
    console.error('Multipart start error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start multipart upload' },
      { status: 500 }
    );
  }
}
