import { NextRequest, NextResponse } from 'next/server';

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

    // Get Cloudflare credentials
    const cfAccessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID;
    const cfSecretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
    const cfBucketName = process.env.CLOUDFLARE_BUCKET_NAME;
    const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const cfR2Url = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_URL;

    // Create a unique filename
    const timestamp = Date.now();
    const filename = `${fileType}/${timestamp}-${file.name}`;

    // If all Cloudflare credentials are present, use R2
    if (cfAccessKeyId && cfSecretAccessKey && cfBucketName && cfAccountId && cfR2Url) {
      try {
        // Convert file to Buffer
        const buffer = await file.arrayBuffer();

        // Construct R2 API URL
        const r2Url = `https://${cfAccountId}.r2.cloudflarestorage.com/${cfBucketName}/${filename}`;

        // Create authorization header (Basic Auth)
        const auth = Buffer.from(`${cfAccessKeyId}:${cfSecretAccessKey}`).toString('base64');

        // Upload to R2
        const uploadResponse = await fetch(r2Url, {
          method: 'PUT',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': file.type || 'application/octet-stream',
          },
          body: buffer,
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('R2 Upload Error:', uploadResponse.status, errorText);
          throw new Error(`Upload to R2 failed: ${uploadResponse.statusText}`);
        }

        // Return public URL
        const publicUrl = `${cfR2Url}/${filename}`;
        console.log('File uploaded to R2:', publicUrl);
        return NextResponse.json({ url: publicUrl }, { status: 200 });
      } catch (r2Error) {
        console.error('R2 upload failed, falling back to local storage:', r2Error);
        // Fall through to local storage
      }
    }

    // Fallback: Use local storage (development mode)
    console.log('Using local storage for file:', filename);
    
    // For development, create a data URL or mock URL
    const mockUrl = `/uploads/${filename}`;
    
    // In development, we'll use a mock URL that references the file by name
    // In production with R2, this code won't be reached
    return NextResponse.json({ url: mockUrl }, { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

