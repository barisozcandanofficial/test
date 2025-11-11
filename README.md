# Dosya Paylaşım Platformu

WeTransfer benzeri modern, hızlı ve güvenli dosya paylaşım platformu.

## 🚀 Özellikler

- **Multipart Upload**: 5 MB chunk boyutu ile optimize edilmiş yükleme
- **Detaylı İlerleme Takibi**: 
  - Upload hızı
  - Yüklenen/Toplam boyut
  - Parça sayısı
  - Geçen/Kalan süre
- **Cloudflare R2 Entegrasyonu**: S3-compatible object storage
- **Apple-tarzı UI**: Temiz, minimalist ve modern tasarım
- **Türkçe Arayüz**: Tam Türkçe dil desteği

## 📋 Gereksinimler

- Node.js 18+
- Cloudflare hesabı ve R2 bucket
- npm veya yarn

## 🛠️ Kurulum

1. Projeyi klonlayın:
```bash
git clone <repo-url>
cd testt
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env.local` dosyası oluşturun ve Cloudflare R2 bilgilerinizi ekleyin:
```env
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_id_here
R2_SECRET_ACCESS_KEY=your_secret_access_key_here
R2_BUCKET_NAME=your_bucket_name_here
R2_ENDPOINT=https://your_account_id_here.r2.cloudflarestorage.com
```

4. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

5. Tarayıcınızda açın: `http://localhost:3000`

## 🔧 Cloudflare R2 Kurulumu

1. [Cloudflare Dashboard](https://dash.cloudflare.com)'a gidin
2. **R2** > **Create bucket** ile yeni bir bucket oluşturun
3. **Manage R2 API Tokens** > **Create API token**
4. **Admin Read & Write** izinlerini verin
5. Oluşturulan Access Key ID ve Secret Access Key'i `.env.local`'e ekleyin

## 📁 Proje Yapısı

```
├── app/
│   ├── page.tsx                 # Ana yükleme sayfası
│   ├── download/[id]/page.tsx   # İndirme sayfası
│   └── api/
│       ├── upload/
│       │   ├── initiate/        # Multipart upload başlatma
│       │   ├── part/            # Chunk yükleme
│       │   └── complete/        # Upload tamamlama
│       ├── download/[id]/       # Dosya indirme
│       └── file/info/[id]/      # Dosya bilgileri
├── lib/
│   └── r2.ts                    # R2 client konfigürasyonu
└── .env.local                   # Ortam değişkenleri
```

## 🎨 Teknolojiler

- **Next.js 15**: React framework
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS
- **AWS SDK for JavaScript v3**: S3-compatible API
- **Cloudflare R2**: Object storage

## 📝 API Endpoints

### Upload Flow

1. **POST** `/api/upload/initiate`
   - Multipart upload başlatır
   - Returns: `{ uploadId, fileKey }`

2. **POST** `/api/upload/part`
   - Her chunk'ı yükler (5 MB)
   - FormData: `chunk`, `uploadId`, `fileKey`, `partNumber`
   - Returns: `{ ETag, PartNumber }`

3. **POST** `/api/upload/complete`
   - Upload'u tamamlar
   - Body: `{ uploadId, fileKey, parts }`
   - Returns: `{ downloadId }`

### Download Flow

1. **GET** `/api/file/info/[id]`
   - Dosya bilgilerini getirir
   - Returns: `{ name, size, type, uploadDate }`

2. **GET** `/api/download/[id]`
   - Dosyayı indirir
   - Returns: File stream

## 🔒 Güvenlik

- Environment variables ile güvenli credential yönetimi
- CORS koruması
- Input validation
- S3-compatible güvenlik standartları

## 🚀 Production Deployment

### Vercel

1. GitHub'a push edin
2. Vercel'e import edin
3. Environment variables'ı ayarlayın
4. Deploy edin

```bash
npm run build
npm start
```

## 📄 Lisans

MIT

## 🤝 Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır!

## 📧 İletişim

Sorularınız için issue açabilirsiniz.
