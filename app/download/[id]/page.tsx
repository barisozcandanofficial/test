'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface FileInfo {
  name: string;
  type: string;
  size: number;
  uploadDate: string;
}

export default function DownloadPage() {
  const params = useParams();
  const router = useRouter();
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    
    fetch(`/api/file/info/${id}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Dosya bulunamadı');
        }
        const data = await response.json();
        setFileInfo(data);
      })
      .catch((err) => {
        console.error('Dosya bilgisi alınamadı:', err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.id]);

  const handleDownload = async () => {
    if (!fileInfo || downloading) return;

    setDownloading(true);
    const id = params.id as string;

    try {
      const response = await fetch(`/api/download/${id}`);
      
      if (!response.ok) {
        throw new Error('Download başarısız');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileInfo.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download hatası:', error);
      alert('Dosya indirilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setDownloading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-6"></div>
          <p className="text-gray-400 text-lg">Dosya bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !fileInfo) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-full mb-8">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            Dosya Bulunamadı
          </h1>
          <p className="text-lg text-gray-400 mb-10">
            Bu bağlantı geçersiz veya dosyanın süresi dolmuş olabilir.
          </p>
          
          <button
            onClick={() => router.push('/')}
            className="px-10 py-4 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Dosya İndirmeye Hazır
          </h1>
          <p className="text-xl text-gray-400">
            Aşağıdaki butona tıklayarak dosyanızı indirebilirsiniz
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-zinc-800">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-white mb-4 break-words">
                {fileInfo.name}
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>Boyut: <span className="text-white font-semibold">{formatFileSize(fileInfo.size)}</span></span>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Yüklenme: <span className="text-white font-semibold">{formatDate(fileInfo.uploadDate)}</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full py-5 bg-white text-black rounded-xl font-bold text-lg hover:bg-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {downloading ? (
            <>
              <svg className="animate-spin h-6 w-6 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              İndiriliyor...
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Dosyayı İndir
            </>
          )}
        </button>

        <button
          onClick={() => router.push('/')}
          className="w-full mt-4 py-4 bg-zinc-900 border border-zinc-800 text-white rounded-xl font-semibold hover:bg-zinc-800 hover:border-zinc-700 transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
        >
          Kendi Dosyanı Yükle
        </button>
      </div>
    </div>
  );
}
