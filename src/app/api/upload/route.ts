import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { CLOUDINARY_CONFIG } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const { image, folder = 'scored/media' } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const { cloudName, apiKey, apiSecret } = CLOUDINARY_CONFIG;

    // Build signature string (parameters in alphabetical order)
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

    // Prepare FormData payload for Cloudinary REST API
    const formData = new FormData();
    formData.append('file', image);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('folder', folder);

    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await cloudinaryRes.json();

    if (!cloudinaryRes.ok) {
      console.error('Cloudinary API upload error:', data);
      return NextResponse.json(
        { error: data.error?.message || 'Cloudinary upload failed' },
        { status: cloudinaryRes.status }
      );
    }

    return NextResponse.json({
      url: data.url,
      secure_url: data.secure_url,
      public_id: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
    });
  } catch (error: any) {
    console.error('Server upload handler error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error during media upload' },
      { status: 500 }
    );
  }
}
