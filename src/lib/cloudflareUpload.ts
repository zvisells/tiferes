// Cloudflare R2 upload utility
export async function uploadToCloudflare(
  file: File,
  fileType: 'audio' | 'image'
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileType', fileType);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.url;
}

