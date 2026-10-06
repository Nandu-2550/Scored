/**
 * Cloudinary Media Upload Utility for Scored Platform
 * Credentials & Cloudinary URL:
 * CLOUDINARY_URL=cloudinary://597917962679226:BV4oRy2SltB9MKZh3OjVYyCFBOQ@dd3etpbjs
 */

export const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dd3etpbjs',
  apiKey: process.env.CLOUDINARY_API_KEY || '597917962679226',
  apiSecret: process.env.CLOUDINARY_API_SECRET || 'BV4oRy2SltB9MKZh3OjVYyCFBOQ',
  cloudinaryUrl: process.env.CLOUDINARY_URL || 'cloudinary://597917962679226:BV4oRy2SltB9MKZh3OjVYyCFBOQ@dd3etpbjs'
};

export interface UploadResult {
  url: string;
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
}

/**
 * Upload an image (File or Base64 string) via the Next.js API route
 * Suitable for team logos, player avatars, and tournament banners.
 */
export async function uploadMedia(
  fileOrBase64: File | string, 
  folder: 'team-logos' | 'player-profiles' | 'tournament-banners' = 'team-logos'
): Promise<UploadResult> {
  // If it's a File, convert to base64
  let base64String = '';
  if (typeof fileOrBase64 === 'string') {
    base64String = fileOrBase64;
  } else {
    base64String = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(fileOrBase64);
    });
  }

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: base64String,
      folder: `scored/${folder}`,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to upload media to Cloudinary');
  }

  return response.json();
}
