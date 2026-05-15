import { NextRequest, NextResponse } from 'next/server';
import { CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';
import { getR2Client, getR2Config } from '@/lib/r2';

export async function POST(req: NextRequest) {
  try {
    const { key, uploadId, parts } = await req.json();

    if (!key || !uploadId || !parts || !Array.isArray(parts)) {
      return NextResponse.json({ error: 'Missing key, uploadId, or parts' }, { status: 400 });
    }

    const { bucketName, publicUrl } = getR2Config();
    const s3 = getR2Client();

    const command = new CompleteMultipartUploadCommand({
      Bucket: bucketName,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts
          .sort((a: { PartNumber: number }, b: { PartNumber: number }) => a.PartNumber - b.PartNumber)
          .map((p: { PartNumber: number; ETag: string }) => ({
            PartNumber: p.PartNumber,
            ETag: p.ETag,
          })),
      },
    });

    await s3.send(command);

    return NextResponse.json({
      publicUrl: `${publicUrl}/${key}`,
    });
  } catch (error) {
    console.error('Multipart complete error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to complete multipart upload' },
      { status: 500 }
    );
  }
}
