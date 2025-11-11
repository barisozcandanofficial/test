import { NextRequest, NextResponse } from 'next/server';
import { CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';
import { r2Client, BUCKET_NAME } from '@/lib/r2';

export async function POST(request: NextRequest) {
  try {
    const { uploadId, fileKey, parts } = await request.json();

    if (!uploadId || !fileKey || !parts || !Array.isArray(parts)) {
      return NextResponse.json(
        { error: 'Eksik parametreler' },
        { status: 400 }
      );
    }

    // Complete multipart upload
    const command = new CompleteMultipartUploadCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map((part: any) => ({
          ETag: part.ETag,
          PartNumber: part.PartNumber,
        })),
      },
    });

    const response = await r2Client.send(command);

    // Generate a shorter, user-friendly ID for the download URL
    const downloadId = Buffer.from(fileKey).toString('base64url');

    return NextResponse.json({
      success: true,
      downloadId: downloadId,
      location: response.Location,
    });
  } catch (error) {
    console.error('Upload tamamlama hatası:', error);
    return NextResponse.json(
      { error: 'Upload tamamlanamadı' },
      { status: 500 }
    );
  }
}

