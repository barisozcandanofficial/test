# Cloudflare R2 Kurulum Rehberi

Bu belge, Cloudflare R2'yi projenizle entegre etmek için adım adım talimatlar içerir.

## 📋 Gerekli Bilgiler

Projenizin çalışması için aşağıdaki bilgilere ihtiyacınız var:

- **Account ID**: Cloudflare hesap ID'niz
- **Access Key ID**: R2 API erişim anahtarı
- **Secret Access Key**: R2 API gizli anahtarı
- **Bucket Name**: Oluşturduğunuz R2 bucket adı
- **Endpoint URL**: R2 endpoint URL'i

---

## 🔧 Adım 1: Cloudflare R2 Bucket Oluşturma

### 1.1 Cloudflare Dashboard'a Giriş
- [dash.cloudflare.com](https://dash.cloudflare.com) adresine gidin
- Hesabınıza giriş yapın

### 1.2 R2 Sayfasına Git
- Sol menüden **R2** sekmesini seçin
- **Create bucket** butonuna tıklayın

### 1.3 Bucket Oluştur
- Bucket adı girin (örn: `my-file-sharing-bucket`)
- Location seçin (önerilen: Automatic)
- **Create bucket** butonuna tıklayın

### 1.4 Account ID'yi Kaydedin
- R2 sayfasının sağ üst köşesinde **Account ID**'nizi görebilirsiniz
- Bu ID'yi kopyalayın, `.env.local` dosyasında kullanacaksınız

---

## 🔑 Adım 2: API Token Oluşturma

### 2.1 API Token Sayfasına Git
- R2 sayfasında **Manage R2 API Tokens** butonuna tıklayın
- Veya doğrudan: R2 > Overview > **Manage R2 API Tokens**

### 2.2 Yeni Token Oluştur
- **Create API token** butonuna tıklayın

### 2.3 Token Ayarlarını Yapılandır
- **Token name**: `file-upload-app` (veya istediğiniz bir isim)
- **Permissions**: 
  - ✅ **Admin Read & Write** seçin
  - (Bu, bucket'lara okuma ve yazma izni verir)
- **TTL**: Leave as "Forever" (veya istediğiniz süre)
- **Specific buckets** (opsiyonel): Sadece belirli bir bucket'a erişim vermek isterseniz seçin

### 2.4 Token'ı Oluştur ve Kaydet
- **Create API Token** butonuna tıklayın
- ⚠️ **ÖNEMLİ**: Gösterilen bilgileri hemen kaydedin!
  - **Access Key ID**
  - **Secret Access Key**
- Bu bilgiler sadece bir kez gösterilir, sonra tekrar göremezsiniz

---

## 📝 Adım 3: .env.local Dosyası Oluşturma

### 3.1 Proje Kök Dizininde .env.local Dosyası Oluşturun

Proje klasörünüzün ana dizininde (package.json ile aynı seviyede) `.env.local` adında bir dosya oluşturun.

### 3.2 Aşağıdaki İçeriği Yapıştırın

```env
# Cloudflare R2 Configuration

# Your Cloudflare Account ID (R2 sayfasında sağ üstte görünür)
R2_ACCOUNT_ID=your_account_id_here

# R2 Access Key ID (API token oluştururken verilen)
R2_ACCESS_KEY_ID=your_access_key_id_here

# R2 Secret Access Key (API token oluştururken verilen)
R2_SECRET_ACCESS_KEY=your_secret_access_key_here

# Your R2 Bucket Name (oluşturduğunuz bucket'ın adı)
R2_BUCKET_NAME=your_bucket_name_here

# R2 Endpoint (account_id'nizi kullanarak oluşturun)
R2_ENDPOINT=https://your_account_id_here.r2.cloudflarestorage.com
```

### 3.3 Değerleri Değiştirin

Aşağıdaki değerleri kendi bilgilerinizle değiştirin:

- `your_account_id_here` → Cloudflare Account ID'niz
- `your_access_key_id_here` → R2 Access Key ID
- `your_secret_access_key_here` → R2 Secret Access Key
- `your_bucket_name_here` → R2 Bucket adınız

**Endpoint URL için:**
- `https://[ACCOUNT_ID].r2.cloudflarestorage.com` formatını kullanın
- `[ACCOUNT_ID]` yerine kendi Account ID'nizi yazın

### 3.4 Örnek Dolu .env.local

```env
R2_ACCOUNT_ID=a1b2c3d4e5f6g7h8i9j0
R2_ACCESS_KEY_ID=1234567890abcdef1234567890abcdef
R2_SECRET_ACCESS_KEY=abcdefghijklmnopqrstuvwxyz1234567890ABCD
R2_BUCKET_NAME=my-file-sharing-bucket
R2_ENDPOINT=https://a1b2c3d4e5f6g7h8i9j0.r2.cloudflarestorage.com
```

---

## ✅ Adım 4: Kurulumu Test Etme

### 4.1 Development Server'ı Başlatın

```bash
npm run dev
```

### 4.2 Tarayıcıda Açın

`http://localhost:3000` adresine gidin

### 4.3 Dosya Yüklemeyi Test Edin

1. Bir dosya seçin veya sürükle-bırak yapın
2. "Dosyayı Yükle" butonuna tıklayın
3. İlerleme çubuğunu ve istatistikleri gözlemleyin
4. Yükleme tamamlandığında paylaşım linkini kopyalayın
5. Linki yeni bir sekmede açarak dosyayı indirin

---

## 🔍 Sorun Giderme

### "Upload başlatılamadı" Hatası

**Neden:** Environment variables yanlış yapılandırılmış olabilir.

**Çözüm:**
1. `.env.local` dosyasının proje kök dizininde olduğundan emin olun
2. Tüm değerlerin doğru girildiğini kontrol edin
3. Development server'ı yeniden başlatın (Ctrl+C sonra `npm run dev`)
4. Tarayıcı console'unda hata mesajlarını kontrol edin

### "Access Denied" veya "403 Forbidden" Hatası

**Neden:** API token izinleri yetersiz olabilir.

**Çözüm:**
1. Cloudflare Dashboard > R2 > API Tokens
2. Token'ın **Admin Read & Write** iznine sahip olduğunu kontrol edin
3. Gerekirse yeni bir token oluşturun

### "Bucket not found" Hatası

**Neden:** Bucket adı yanlış veya bucket mevcut değil.

**Çözüm:**
1. Cloudflare Dashboard > R2 > Buckets
2. Bucket'ın var olduğundan emin olun
3. `.env.local` dosyasındaki `R2_BUCKET_NAME` değerinin bucket adıyla tam olarak eşleştiğini kontrol edin

### Endpoint Connection Hatası

**Neden:** Endpoint URL yanlış formatlanmış olabilir.

**Çözüm:**
1. Endpoint URL formatı: `https://[ACCOUNT_ID].r2.cloudflarestorage.com`
2. Account ID'nin doğru olduğundan emin olun
3. URL'de ekstra boşluk veya karakter olmadığını kontrol edin

---

## 🔒 Güvenlik Önerileri

### ✅ Yapılması Gerekenler:
- `.env.local` dosyasını asla Git'e commit etmeyin (`.gitignore`'da olduğundan emin olun)
- API token'larınızı kimseyle paylaşmayın
- Production'da Environment Variables'ı hosting platformunuzda (Vercel, etc.) ayarlayın

### ❌ Yapılmaması Gerekenler:
- API anahtarlarını kodda hard-code etmeyin
- `.env.local` dosyasını public repository'lere yüklemeyin
- Token'ları tarayıcı console'una yazdırmayın

---

## 📊 R2 Kullanım Limitleri

Cloudflare R2 ücretsiz tier limitleri:

- **Storage**: 10 GB/ay
- **Class A Operations** (write, list): 1 milyon istek/ay
- **Class B Operations** (read): 10 milyon istek/ay
- **Egress**: Ücretsiz (sınırsız)

Bu limitler aşıldığında ücretlendirme başlar. Detaylar için: [Cloudflare R2 Pricing](https://developers.cloudflare.com/r2/pricing/)

---

## 🚀 Production Deployment

### Vercel

1. Projeyi GitHub'a push edin
2. Vercel Dashboard'da import edin
3. **Environment Variables** bölümünde `.env.local` içeriğini ekleyin:
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`
   - `R2_ENDPOINT`
4. Deploy edin

### Diğer Platformlar

Herhangi bir Node.js destekleyen platformda deploy edebilirsiniz, environment variables'ı platform ayarlarından ekleyin.

---

## 📚 Ek Kaynaklar

- [Cloudflare R2 Dokümantasyonu](https://developers.cloudflare.com/r2/)
- [R2 API Dokümantasyonu](https://developers.cloudflare.com/r2/api/s3/)
- [AWS SDK v3 for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/)

---

## ❓ Sık Sorulan Sorular

### Dosya boyutu limiti var mı?

R2'de tek dosya için teorik limit yoktur. Ancak bu proje 5 MB chunk'lar kullanır, bu nedenle çok büyük dosyalar (GB'lar) da yüklenebilir.

### Dosyalar ne kadar süre saklanır?

R2'de dosyalar manuel olarak silinene kadar kalır. Otomatik silme için lifecycle policies ayarlayabilirsiniz.

### Public URL ile dosyaları paylaşabilir miyim?

Evet, R2 bucket'ınıza custom domain bağlayarak public URL'ler oluşturabilirsiniz:
- R2 Dashboard > Bucket > Settings > Public Access

### Yükleme hızı nasıl artırılır?

- Chunk sayısını artırmak için CHUNK_SIZE değerini azaltabilirsiniz (lib/r2.ts)
- Paralel chunk upload implementasyonu eklenebilir
- CDN kullanımı hızı artırabilir

---

**Başarılar! 🎉**

Herhangi bir sorun yaşarsanız, projenin issue tracker'ını kullanabilirsiniz.

