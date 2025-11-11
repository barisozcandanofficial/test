import { NextRequest, NextResponse } from 'next/server';
import { UploadPartCommand } from '@aws-sdk/client-s3';
import { r2Client, BUCKET_NAME } from '@/lib/r2';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const chunk = formData.get('chunk') as Blob;
    const uploadId = formData.get('uploadId') as string;
    const fileKey = formData.get('fileKey') as string;
    const partNumber = parseInt(formData.get('partNumber') as string);

    if (!chunk || !uploadId || !fileKey || !partNumber) {
      return NextResponse.json(
        { error: 'Eksik parametreler' },
        { status: 400 }
      );
    }

    // Convert blob to buffer
    const buffer = Buffer.from(await chunk.arrayBuffer());

    // Upload part
    const command = new UploadPartCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      UploadId: uploadId,
      PartNumber: partNumber,
      Body: buffer,
    });

    const response = await r2Client.send(command);

    return NextResponse.json({
      ETag: response.ETag,
      PartNumber: partNumber,
    });
  } catch (error) {
    console.error('Chunk upload hatası:', error);
    return NextResponse.json(
      { error: 'Chunk yüklenemedi' },
      { status: 500 }
    );
  }
}

