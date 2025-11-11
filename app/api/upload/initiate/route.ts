import { NextRequest, NextResponse } from 'next/server';
import { CreateMultipartUploadCommand } from '@aws-sdk/client-s3';
import { r2Client, BUCKET_NAME } from '@/lib/r2';

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileType } = await request.json();

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'Dosya adı ve tipi gerekli' },
        { status: 400 }
      );
    }

    // Generate unique file key
    const fileKey = `${Date.now()}-${Math.random().toString(36).substring(7)}-${fileName}`;

    // Initiate multipart upload
    const command = new CreateMultipartUploadCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
      Metadata: {
        originalName: fileName,
        uploadDate: new Date().toISOString(),
      },
    });

    const response = await r2Client.send(command);

    return NextResponse.json({
      uploadId: response.UploadId,
      fileKey: fileKey,
    });
  } catch (error) {
    console.error('Multipart upload başlatma hatası:', error);
    return NextResponse.json(
      { error: 'Upload başlatılamadı' },
      { status: 500 }
    );
  }
}

