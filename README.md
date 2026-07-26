# FineCRM

Şirket → Proje → Cari hiyerarşisiyle çalışan, **4 aşamalı timeline** destekli proje satış / rehber CRM paneli.

## Özellikler

- **Şirket yönetimi** — Şirket ekleme, yeniden adlandırma, silme.
- **Proje yönetimi** — Seçilen şirkete projeler tanımlama.
- **Cari yönetimi** — Seçilen projeye cari ekleme. Her cari için:
  - Ad, Soyad, Telefon, **Verilen Bilgi Durumu**
- **4 aşamalı timeline sistemi** (kanban görünümü):
  1. **Eklendi** — yeni kayıt
  2. **Bilgi Verildi**
  3. **Tekrar Arandı**
  4. **Davet Edildi**
- **Aşamaya göre filtreleme** ve cari arama (ad / telefon / bilgi durumu).
- **İşlem geçmişi** — her cari için oluşturma, aşama değişikliği, bilgi güncellemesi ve serbest notlar zaman damgasıyla kaydedilir.
- Tüm veriler tarayıcıda **localStorage** üzerinde saklanır — sunucu/veritabanı gerektirmez.

## Kurulum ve Çalıştırma

```bash
npm install
npm run dev      # geliştirme sunucusu (http://localhost:5173)
```

Üretim derlemesi:

```bash
npm run build    # dist/ klasörünü üretir
npm run preview  # derlemeyi önizle
```

## Teknoloji

- React 18 + TypeScript
- Vite
- Kalıcılık: tarayıcı `localStorage`

## Veri Modeli

```
Şirket (Company)
 └── Proje (Project)
      └── Cari (Cari)
           ├── stage: eklendi | bilgi_verildi | tekrar_arandi | davet_edildi
           └── history: İşlem geçmişi kayıtları
```

İlk açılışta panelin boş görünmemesi için örnek bir şirket, proje ve iki cari otomatik oluşturulur.
Temiz başlamak için tarayıcı konsolunda `localStorage.removeItem('finecrm:v1')` çalıştırıp sayfayı yenileyin.
