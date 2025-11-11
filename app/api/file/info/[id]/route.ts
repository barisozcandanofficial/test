import { NextRequest, NextResponse } from 'next/server';
import { HeadObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, BUCKET_NAME } from '@/lib/r2';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Decode the file key from the download ID
    const fileKey = Buffer.from(id, 'base64url').toString('utf-8');

    // Get object metadata
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    const response = await r2Client.send(command);

    return NextResponse.json({
      name: response.Metadata?.originalname || 'Bilinmeyen Dosya',
      size: response.ContentLength || 0,
      type: response.ContentType || 'application/octet-stream',
      uploadDate: response.Metadata?.uploaddate || response.LastModified?.toISOString(),
    });
  } catch (error: any) {
    console.error('Dosya bilgisi alınamadı:', error);
    
    if (error.name === 'NotFound' || error.name === 'NoSuchKey') {
      return NextResponse.json(
        { error: 'Dosya bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Dosya bilgisi alınamadı' },
      { status: 500 }
    );
  }
}

