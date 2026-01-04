# 🗄️ Supabase Kurulum Rehberi

Bu rehber LangTracker için Supabase veritabanı kurulumunu adım adım açıklar.

## 1. Supabase Projesi Oluşturma

1. [supabase.com](https://supabase.com) adresine gidin
2. "Start your project" butonuna tıklayın
3. GitHub ile giriş yapın
4. "New project" butonuna tıklayın
5. Proje bilgilerini doldurun:
   - **Name**: `langtracker` (veya istediğiniz isim)
   - **Database Password**: Güçlü bir şifre girin (kaydedin!)
   - **Region**: `Frankfurt (eu-central-1)` (Türkiye'ye en yakın)
6. "Create new project" butonuna tıklayın
7. Projenin oluşmasını bekleyin (~2 dakika)

## 2. API Bilgilerini Alma

1. Proje hazır olduğunda **Settings** > **API** bölümüne gidin
2. Aşağıdaki bilgileri kopyalayın:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon (public) key**: Dashboard'dan kopyalayın

## 3. Environment Variables Ayarlama

Proje kök dizininde `.env` dosyası oluşturun:

```bash
# .env dosyası (GIT'e EKLEME!)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 4. Veritabanı Şemasını Oluşturma

1. Supabase Dashboard'da **SQL Editor** bölümüne gidin
2. **New query** butonuna tıklayın
3. `supabase/schema.sql` dosyasının içeriğini kopyalayın
4. Editor'a yapıştırın
5. **Run** butonuna tıklayın
6. "Success" mesajını görün ✅

## 5. Authentication Ayarları

### Email/Password Authentication
1. **Authentication** > **Providers** bölümüne gidin
2. **Email** provider'ı etkinleştirin
3. "Confirm email" opsiyonunu kapatabilirsiniz (test için)

### Google OAuth (Opsiyonel)
1. [Google Cloud Console](https://console.cloud.google.com/) adresine gidin
2. Yeni proje oluşturun veya mevcut projeyi seçin
3. **APIs & Services** > **Credentials** bölümüne gidin
4. **Create Credentials** > **OAuth 2.0 Client IDs**
5. Application type: **Web application**
6. Authorized redirect URIs: `https://xxxxx.supabase.co/auth/v1/callback`
7. Client ID ve Client Secret'ı kopyalayın
8. Supabase'de **Authentication** > **Providers** > **Google**
9. Client ID ve Secret'ı yapıştırın

### GitHub OAuth (Opsiyonel)
1. [GitHub Developer Settings](https://github.com/settings/developers) adresine gidin
2. **New OAuth App** butonuna tıklayın
3. Application name: `LangTracker`
4. Homepage URL: `http://localhost:5173` (veya production URL)
5. Callback URL: `https://xxxxx.supabase.co/auth/v1/callback`
6. Client ID ve Secret'ı Supabase'e ekleyin

## 6. Test Etme

```bash
# Projeyi çalıştır
npm run dev
```

Tarayıcı konsolunda Supabase bağlantısını kontrol edin:
```javascript
// Console'da çalıştır
import { supabase } from './src/services/SupabaseService.js'
console.log('Supabase:', supabase ? 'Bağlı ✅' : 'Bağlı Değil ❌')
```

## 7. Production Deployment

### Vercel ile Deploy
1. [vercel.com](https://vercel.com) adresine gidin
2. GitHub repo'nuzu import edin
3. Environment Variables bölümüne ekleyin:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy butonuna tıklayın

### Netlify ile Deploy
1. [netlify.com](https://netlify.com) adresine gidin
2. GitHub repo'nuzu bağlayın
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Environment variables ekleyin
5. Deploy site butonuna tıklayın

## Tablo Yapısı

| Tablo | Açıklama |
|-------|----------|
| `profiles` | Kullanıcı profilleri |
| `user_series` | Takip edilen diziler |
| `progress` | İzleme ilerlemesi |
| `vocabulary` | Kelime defteri |
| `notes` | Kullanıcı notları |
| `watchlist` | İzleme listesi |
| `activity_log` | Aktivite geçmişi |

## Güvenlik

- ✅ Row Level Security (RLS) tüm tablolarda aktif
- ✅ Kullanıcılar sadece kendi verilerini görebilir
- ✅ `anon` key güvenli (sadece public işlemler)
- ⚠️ `service_role` key'i frontend'de KULLANMAYIN!

## Sorun Giderme

### "relation does not exist" hatası
- SQL şemasını çalıştırdığınızdan emin olun

### "new row violates row-level security policy" hatası
- Kullanıcı giriş yapmış olmalı
- RLS politikalarını kontrol edin

### Bağlantı hatası
- `.env` dosyasını kontrol edin
- URL ve key'in doğru olduğundan emin olun
- Supabase projesinin aktif olduğunu kontrol edin
