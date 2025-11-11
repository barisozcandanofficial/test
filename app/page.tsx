'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const CHUNK_SIZE = 4 * 1024 * 1024; // 4 MB

interface UploadProgress {
  uploadedBytes: number;
  totalBytes: number;
  uploadSpeed: number;
  elapsedTime: number;
  estimatedTimeRemaining: number;
  currentChunk: number;
  totalChunks: number;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [downloadId, setDownloadId] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    uploadedBytes: 0,
    totalBytes: 0,
    uploadSpeed: 0,
    elapsedTime: 0,
    estimatedTimeRemaining: 0,
    currentChunk: 0,
    totalChunks: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const startTimeRef = useRef<number>(0);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    return formatBytes(bytesPerSecond) + '/s';
  };

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || seconds < 0) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    startTimeRef.current = Date.now();

    try {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      
      setProgress({
        uploadedBytes: 0,
        totalBytes: file.size,
        uploadSpeed: 0,
        elapsedTime: 0,
        estimatedTimeRemaining: 0,
        currentChunk: 0,
        totalChunks,
      });

      const initiateResponse = await fetch('/api/upload/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      });

      if (!initiateResponse.ok) {
        throw new Error('Upload başlatılamadı');
      }

      const { uploadId, fileKey } = await initiateResponse.json();

      const uploadedParts: { ETag: string; PartNumber: number }[] = [];
      let uploadedBytes = 0;

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('uploadId', uploadId);
        formData.append('fileKey', fileKey);
        formData.append('partNumber', (chunkIndex + 1).toString());

        const partResponse = await fetch('/api/upload/part', {
          method: 'POST',
          body: formData,
        });

        if (!partResponse.ok) {
          throw new Error(`Chunk ${chunkIndex + 1} yüklenemedi`);
        }

        const partData = await partResponse.json();
        uploadedParts.push(partData);

        uploadedBytes += chunk.size;
        const elapsedTime = (Date.now() - startTimeRef.current) / 1000;
        const uploadSpeed = uploadedBytes / elapsedTime;
        const remainingBytes = file.size - uploadedBytes;
        const estimatedTimeRemaining = remainingBytes / uploadSpeed;

        setProgress({
          uploadedBytes,
          totalBytes: file.size,
          uploadSpeed,
          elapsedTime,
          estimatedTimeRemaining,
          currentChunk: chunkIndex + 1,
          totalChunks,
        });
      }

      const completeResponse = await fetch('/api/upload/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadId,
          fileKey,
          parts: uploadedParts,
        }),
      });

      if (!completeResponse.ok) {
        throw new Error('Upload tamamlanamadı');
      }

      const { downloadId: id } = await completeResponse.json();

      setDownloadId(id);
      setUploading(false);
      setUploadComplete(true);
    } catch (error) {
      console.error('Upload hatası:', error);
      alert('Dosya yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      setUploading(false);
    }
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/download/${downloadId}`;
    navigator.clipboard.writeText(url);
  };

  const resetUpload = () => {
    setFile(null);
    setUploadComplete(false);
    setDownloadId('');
    setProgress({
      uploadedBytes: 0,
      totalBytes: 0,
      uploadSpeed: 0,
      elapsedTime: 0,
      estimatedTimeRemaining: 0,
      currentChunk: 0,
      totalChunks: 0,
    });
  };

  if (uploadComplete) {
    const downloadUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/download/${downloadId}`;
    
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="w-full max-w-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-8">
              <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Dosya Yüklendi
            </h1>
            <p className="text-lg text-gray-400 mb-8 break-words px-4">
              {file?.name}
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">İndirme Bağlantısı</p>
            <div className="flex items-center gap-3">
              <input
                type="text"
                readOnly
                value={downloadUrl}
                className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm font-mono text-gray-300 focus:outline-none focus:border-white transition-colors"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-3 bg-white text-black rounded-xl hover:bg-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                title="Kopyala"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          <button
            onClick={resetUpload}
            className="w-full py-4 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
          >
            Başka Dosya Yükle
          </button>
        </div>
      </div>
    );
  }

  if (uploading) {
    const progressPercentage = (progress.uploadedBytes / progress.totalBytes) * 100;

    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">
              Dosya Yükleniyor
            </h1>
            <p className="text-gray-400 break-words px-4">
              {file?.name}
            </p>
          </div>

          {/* Main Progress Bar */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-400">İlerleme</span>
              <span className="text-2xl font-bold text-white tabular-nums">{progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-zinc-900 rounded-full h-4 overflow-hidden border border-zinc-800">
              <div
                className="bg-white h-4 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {/* Upload Speed */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Hız</p>
                  <p className="text-xl font-bold text-white truncate tabular-nums">
                    {formatSpeed(progress.uploadSpeed)}
                  </p>
                </div>
              </div>
            </div>

            {/* Time Remaining */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Kalan Süre</p>
                  <p className="text-xl font-bold text-white truncate tabular-nums">
                    {formatTime(progress.estimatedTimeRemaining)}
                  </p>
                </div>
              </div>
            </div>

            {/* Uploaded */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Yüklenen</p>
                  <p className="text-xl font-bold text-white truncate tabular-nums">
                    {formatBytes(progress.uploadedBytes)}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Size */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Toplam Boyut</p>
                  <p className="text-xl font-bold text-white truncate tabular-nums">
                    {formatBytes(progress.totalBytes)}
                  </p>
                </div>
              </div>
            </div>

            {/* Chunks */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Parçalar</p>
                  <p className="text-xl font-bold text-white truncate tabular-nums">
                    {progress.currentChunk} / {progress.totalChunks}
                  </p>
                </div>
              </div>
            </div>

            {/* Elapsed Time */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Geçen Süre</p>
                  <p className="text-xl font-bold text-white truncate tabular-nums">
                    {formatTime(progress.elapsedTime)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">Lütfen sayfayı kapatmayın, yükleme devam ediyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Dosya Gönder
          </h1>
          <p className="text-xl text-gray-400">
            Basit, hızlı ve güvenli dosya paylaşımı
          </p>
        </div>

        {!file ? (
          <div
            className={`relative border-2 border-dashed rounded-3xl p-16 transition-all ${
              dragActive
                ? 'border-white bg-white/5'
                : 'border-zinc-800 hover:border-zinc-700'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleChange}
              className="hidden"
            />
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-8 border border-zinc-800">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              
              <p className="text-2xl text-white font-semibold mb-3">
                Dosyaları buraya sürükleyin
              </p>
              <p className="text-gray-500 mb-8">
                veya
              </p>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-10 py-4 bg-white text-black rounded-xl font-semibold text-lg hover:bg-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
              >
                Dosya Seç
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-5">
                <div className="flex-shrink-0 w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center border border-zinc-800">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-white truncate mb-1">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatBytes(file.size)} • {Math.ceil(file.size / CHUNK_SIZE)} parça
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <button
              onClick={handleUpload}
              className="w-full py-5 bg-white text-black rounded-xl font-bold text-lg hover:bg-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
            >
              Dosyayı Yükle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
