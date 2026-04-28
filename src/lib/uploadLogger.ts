function parseUserAgent(ua: string) {
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop';

  if (/CriOS/i.test(ua)) browser = 'Chrome (iOS)';
  else if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/Chrome\/[\d.]+/i.test(ua)) browser = 'Chrome';
  else if (/Firefox\/[\d.]+/i.test(ua)) browser = 'Firefox';
  else if (/Safari\/[\d.]+/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/MSIE|Trident/i.test(ua)) browser = 'IE';

  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  if (/Mobile|Android|iPhone|iPad/i.test(ua)) device = 'Mobile';
  if (/iPad|Tablet/i.test(ua)) device = 'Tablet';

  return { browser, os, device };
}

function getConnectionType(): string {
  const nav = navigator as any;
  if (nav.connection) {
    return nav.connection.effectiveType || nav.connection.type || 'unknown';
  }
  return 'unknown';
}

interface LogPayload {
  shiurTitle?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  mediaType?: string;
  status: 'started' | 'success' | 'failed';
  errorMessage?: string;
  uploadMethod?: string;
}

export function logUpload(payload: LogPayload) {
  try {
    const ua = navigator.userAgent;
    const { browser, os, device } = parseUserAgent(ua);

    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        userAgent: ua,
        browser,
        os,
        device,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        connectionType: getConnectionType(),
      }),
    }).catch(() => {});
  } catch {
    // never block uploads due to logging failure
  }
}
