import { NextRequest, NextResponse } from 'next/server';
import { UploadPartCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getR2Client, getR2Config } from '@/lib/r2';

export async function POST(req: NextRequest) {
  try {
    const { key, uploadId, partNumber } = await req.json();

    if (!key || !uploadId || !partNumber) {
      return NextResponse.json({ error: 'Missing key, uploadId, or partNumber' }, { status: 400 });
    }

    const { bucketName } = getR2Config();
    const s3 = getR2Client();

    const command = new UploadPartCommand({
      Bucket: bucketName,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return NextResponse.json({ presignedUrl, partNumber });
  } catch (error) {
    console.error('Multipart presign error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to presign part' },
      { status: 500 }
    );
  }
}
