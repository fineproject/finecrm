# FineCRM

**Next.js (App Router) + Material-UI + PostgreSQL + Prisma** ile geliştirilmiş; şirket, proje, cari ve aşama (milestone) takibi yapan, raporlama ve bildirim altyapısı içeren modern yönetim paneli.

## Özellikler

- **Kimlik Doğrulama** — Auth.js (NextAuth v5) credentials girişi; korunmuş rotalar (middleware), rol tabanlı yetki.
- **Kullanıcı Yönetimi** — kullanıcı oluşturma/düzenleme/silme (yalnızca Yönetici); rol atama (Yönetici / Müdür / Üye), bcrypt ile şifre.
- **Görev & Hatırlatma** — cari/projeye bağlı görevler, öncelik, son tarih, atanan kullanıcı; vadesi geçenler vurgulanır; dashboard'da "Geciken / Bugün / Bu Hafta" widget'ı.
- **Etkileşim Kayıtları** — cari notları arama / e-posta / toplantı / not tipiyle etiketlenir ve timeline'da görünür.
- **Gerçek E-posta (SMTP)** — `SMTP_HOST` tanımlıysa Nodemailer ile gerçek gönderim, aksi halde simülasyon.
- **RBAC & Denetim** — rol tabanlı menü/işlem erişimi (silme işlemleri Müdür+); tüm hareketler için Denetim (Audit) sayfası (kim/ne zaman/ne).
- **İçe/Dışa Aktarım** — tüm tablolarda hızlı filtre + CSV dışa aktarım (DataGrid toolbar); carileri CSV'den toplu içe aktarma.
- **Şirket Yönetimi** — CRUD, DataGrid listeleme (sıralama/filtre/sayfalama).
- **Proje Yönetimi** — şirkete bağlı projeler; başlangıç/bitiş tarihi, bütçe, durum (Bekliyor / Devam Ediyor / Tamamlandı / Beklemede / İptal).
- **Cari Yönetimi** — projeye bağlı müşteri/paydaş; satış hunisi aşaması (Eklendi → Bilgi Verildi → Tekrar Arandı → Davet Edildi) ve bağlı proje aşaması takibi.
- **Cari İşlem Timeline'ı** — her cari için işlem geçmişi dikey zaman çizelgesinde; hızlı aşama ilerletme ve **not/işlem ekleme**.
- **Aşama (Milestone) Takibi** — projelere aşama tanımlama; durum değiştikçe **log** ve **bildirim** üretimi.
- **Bildirim Altyapısı** — in-app + **e-posta simülasyonu** (PENDING → SENT → READ). Aşama/durum değişiminde ilgili carilere otomatik bildirim.
- **Raporlama** — **Cari Satış Hunisi** (Gelen / Bilgi Verilen / Dönüş Yapılan / Potansiyele Dönüşen) Günlük/Haftalık/Aylık; şirket bazında kırılım; işlem geçmişi filtreleme (tip + dönem); dashboard istatistik kartları ve grafikler (MUI X Charts).
- **PDF / CSV Dışa Aktarım** — kapsamlı raporun tek tıkla indirilmesi. PDF'te Türkçe karakter desteği için gömülü font (`public/fonts/LiberationSans`), tablo düzeni jsPDF + autoTable ile.
- **UI/UX** — dark/light mod, sidebar'lı responsive layout, MUI DataGrid, drawer tabanlı formlar.

### Örnek giriş bilgileri (seed sonrası)

| Rol | E-posta | Şifre |
|---|---|---|
| Yönetici | `admin@finecrm.local` | `admin123` |
| Müdür | `mudur@finecrm.local` | `mudur123` |
| Üye | `uye@finecrm.local` | `uye123` |

## Teknoloji

| Katman | Seçim |
|---|---|
| Framework | Next.js 14 (App Router, Server Actions) |
| UI | Material-UI v6 + MUI X (DataGrid, Charts) |
| Veritabanı | PostgreSQL |
| ORM | Prisma |

## Kurulum

```bash
# 1) Bağımlılıklar
npm install

# 2) Ortam değişkenleri
cp .env.example .env
#   .env içindeki DATABASE_URL'i kendi PostgreSQL bilginizle güncelleyin
#   AUTH_SECRET üretin:  openssl rand -base64 32

# 3) Şemayı veritabanına uygula + Prisma Client üret
npm run db:migrate      # (ilk kurulumda migration oluşturur)
#   veya hızlı prototip için:  npm run db:push

# 4) Örnek veri
npm run db:seed

# 5) Geliştirme sunucusu
npm run dev             # http://localhost:3000
```

## Komutlar

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | `prisma generate` + prod derleme |
| `npm run start` | Prod sunucu |
| `npm run db:migrate` | Migration oluştur/uygula |
| `npm run db:push` | Şemayı doğrudan uygula (migration'sız) |
| `npm run db:seed` | Örnek veri yükle |
| `npm run db:studio` | Prisma Studio |
| `npm run typecheck` | TypeScript denetimi |

## Proje Yapısı

```
prisma/
  schema.prisma          # Veri modeli (Company, Project, Milestone, Cari, ActivityLog, Notification)
  seed.ts                # Örnek veri
src/
  app/
    layout.tsx           # Kök layout + ThemeRegistry
    (dashboard)/
      layout.tsx         # Sidebar'lı kabuk (AppShell)
      page.tsx           # Genel Bakış (dashboard + grafikler)
      companies/         # Şirketler
      projects/          # Projeler
      cariler/           # Cariler
      reports/           # Raporlar
      notifications/     # Bildirimler
  actions/               # Server Actions (CRUD + iş kuralları)
  server/                # Sunucu tarafı okuma sorguları (DTO döner)
  components/            # UI bileşenleri (layout, dashboard, tablolar, drawer formlar)
  lib/                   # prisma, activity/notification servisleri, labels, format
  theme/                 # MUI teması + ThemeRegistry
  types/                 # DTO tipleri
```

## Mimari Notlar

- **Server Actions** tüm mutasyonları yürütür ve `logActivity()` üzerinden merkezî audit-log + bildirim tetikler.
- **Okuma sorguları** `src/server/*` içinde toplanır; Prisma `Decimal`/`Date` alanları istemciye taşınmadan serileştirilir.
- **Bildirim simülasyonu** `src/lib/notifications.ts` içindedir; gerçek e-posta servisi (Resend/Nodemailer) buraya kolayca takılır.
