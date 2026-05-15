const CHUNK_SIZE = 50 * 1024 * 1024; // 50MB per part
const MAX_CONCURRENT = 3;
const MULTIPART_THRESHOLD = 100 * 1024 * 1024; // 100MB

export function shouldUseMultipart(file: File): boolean {
  return file.size > MULTIPART_THRESHOLD;
}

interface MultipartUploadOptions {
  file: File;
  fileType: string;
  onProgress?: (percent: number) => void;
}

export async function multipartUpload({
  file,
  fileType,
  onProgress,
}: MultipartUploadOptions): Promise<string> {
  const totalParts = Math.ceil(file.size / CHUNK_SIZE);

  // 1. Initiate multipart upload
  const startRes = await fetch('/api/upload/multipart/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      fileType,
      contentType: file.type || 'application/octet-stream',
    }),
  });

  if (!startRes.ok) {
    const err = await startRes.json();
    throw new Error(err.error || 'Failed to start multipart upload');
  }

  const { uploadId, key, publicUrl } = await startRes.json();

  // 2. Upload parts in parallel batches
  const completedParts: { PartNumber: number; ETag: string }[] = [];
  let uploadedBytes = 0;

  const uploadPart = async (partNumber: number): Promise<void> => {
    const start = (partNumber - 1) * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    // Get presigned URL for this part
    const presignRes = await fetch('/api/upload/multipart/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, uploadId, partNumber }),
    });

    if (!presignRes.ok) {
      throw new Error(`Failed to presign part ${partNumber}`);
    }

    const { presignedUrl } = await presignRes.json();

    // Upload the chunk with XHR for progress tracking
    const etag = await new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const partUploaded = e.loaded;
          const totalUploaded = uploadedBytes + partUploaded;
          const percent = Math.round((totalUploaded / file.size) * 100);
          onProgress?.(Math.min(percent, 99));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const responseEtag = xhr.getResponseHeader('ETag');
          if (responseEtag) {
            resolve(responseEtag);
          } else {
            reject(new Error(`Part ${partNumber}: no ETag in response`));
          }
        } else {
          reject(new Error(`Part ${partNumber} upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error(`Part ${partNumber}: network error`));
      });

      xhr.open('PUT', presignedUrl);
      xhr.send(chunk);
    });

    uploadedBytes += (end - start);
    completedParts.push({ PartNumber: partNumber, ETag: etag });
  };

  // Upload in batches of MAX_CONCURRENT
  for (let i = 0; i < totalParts; i += MAX_CONCURRENT) {
    const batch = [];
    for (let j = i; j < Math.min(i + MAX_CONCURRENT, totalParts); j++) {
      batch.push(uploadPart(j + 1));
    }
    await Promise.all(batch);
  }

  // 3. Complete multipart upload
  const completeRes = await fetch('/api/upload/multipart/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key,
      uploadId,
      parts: completedParts,
    }),
  });

  if (!completeRes.ok) {
    const err = await completeRes.json();
    throw new Error(err.error || 'Failed to complete multipart upload');
  }

  onProgress?.(100);
  return publicUrl;
}
