# Admin Tam Ürün Editörü + Canlı Önizleme — Tasarım

Tarih: 16 Haziran 2026
Durum: Onay bekliyor

## Amaç

Admin → Ürünler sayfasında "Düzenle" dendiğinde açılan modal şu an yalnızca fiyat,
hacim, etiket (TR/EN) ve stoğu düzenliyor. Hedef: **canlı ürün detay sayfasında
görünen her şeyin** admin panelinden düzenlenebilmesi ve düzenlerken sonucun
**canlı sayfayla birebir** önizlenmesi.

## Kapsam (fazlama)

- **Faz 1 (bu spec):** Tüm metin ve yapısal alanların editörü + canlı önizleme.
  Görsel yükleme YOK; mevcut görsel konvansiyonu (`/images/products/{slug}.webp`,
  `details.gallery` yerel yolları) korunur.
- **Faz 2 (ayrı spec/plan):** Supabase Storage'a gerçek görsel yükleme (şişe +
  galeri). Site genelindeki görsel altyapısına dokunduğu için ayrı ele alınır.

## Mevcut durum (kod gerçekleri)

- `src/components/admin/AdminProducts.tsx` — liste + `EditProduct` modalı
  (sadece price/size/badge/stock) + `AddProduct`. Stok yalnızca
  `stock_movements` insert ile değişir (trigger `stock_quantity`'yi günceller).
- `src/components/admin/AdminModal.tsx` — `max-w-lg` küçük modal; geniş editör
  için yetersiz.
- `src/app/[locale]/urun/[slug]/page.tsx` — ürün detay sayfası. Görsel gövde
  `ProductDetail()` fonksiyonunda **gömülü** (server component, ama yalnızca
  `useTranslations`/`useLocale` + sunum JSX'i kullanıyor → client'a taşınabilir).
- `src/lib/products.ts` — `ProductDetails` tipi, `DEFAULT_DETAILS`,
  `normalizeDetails(raw)` (DB jsonb snake_case `_tr`/`_en` → app tipi). **Ters
  yön (app → jsonb) serializer YOK.**
- `products` kolonları: slug, name, badge_tr/en, size, price, currency, medal,
  category, description_tr/en, details (jsonb), image_url (VAR ama kullanılmıyor),
  is_active, sort_order, stock_quantity.
- `details` jsonb yapısı: gallery[], highlights[], about_specs[], taste{},
  usage{}, nutrition{} — hepsi `_tr`/`_en` alanlı snake_case.

## Tasarım — Faz 1

### 1. Paylaşılan önizleme bileşeni

`page.tsx` içindeki `ProductDetail` gövdesi `ProductDetailView` adıyla ayrı bir
client-uyumlu bileşene çıkarılır (`src/components/product/ProductDetailView.tsx`):

- Props: `product: Product`, `relatedProducts?: Product[]`, `preview?: boolean`.
- `preview === true` iken: `PurchasePanel` (sepete ekle) ve "ilgili ürünler"
  bölümü gizlenir, breadcrumb sadeleşir. Geri kalan her bölüm aynen render edilir.
- Canlı sayfa (`page.tsx`) bu bileşeni DB ürünüyle çağırır; admin editör aynı
  bileşeni düzenlenen taslak (draft) state ile `preview` modunda çağırır.
- Sonuç: önizleme = canlı sayfa, görsel sapma riski sıfır.

Not: Bileşen `useTranslations("productPage")` kullanmaya devam eder; admin
`[locale]` altında olduğu için `NextIntlClientProvider` zaten mevcut.

### 2. Editör bileşeni

`EditProduct` yeniden yazılır (veya `ProductEditor.tsx` olarak ayrılır):

- Mevcut dar modal yerine **geniş overlay**: masaüstünde iki sütun — solda
  sekmeli form, sağda yapışkan (sticky) `ProductDetailView preview`. Mobilde
  sekmeler arasında "Önizleme" sekmesi.
- Yeni geniş kabuk için `AdminModal`'a `size="wide"` varyantı eklenir
  (`max-w-6xl` vb.) ya da editöre özel kabuk yazılır.
- Sekmeler ve alanlar:
  - **Genel:** name, slug, size, price, category, medal (none/gold/silver),
    is_active, stock (movement ile).
  - **İçerik:** badge_tr, badge_en, description_tr, description_en.
  - **Detaylar:** highlights / about_specs / usage.items / taste — her biri
    satır ekle/çıkar/sırala; her satırda icon seçici (DetailIcon anahtarları),
    TR/EN alanlar; taste için 0-5 kaydırıcılar + notes TR/EN.
  - **Besin:** nutrition.rows (label TR/EN + value), footnote TR/EN; satır
    ekle/çıkar.
  - **Görseller (Faz 1):** mevcut yolları (gallery dizisi) metin olarak
    düzenleme + sıralama; şişe görseli salt-okunur (konvansiyon). Yükleme Faz 2.
- Taslak state tek bir `draft` nesnesinde tutulur (`Product` + düzenlenmiş
  `details`), her değişiklik önizlemeye anında yansır.

### 3. Kaydetme

- `src/lib/products.ts` içine `serializeDetails(d: ProductDetails): Json` eklenir
  — `normalizeDetails`'in tersi, snake_case `_tr`/`_en` üretir.
- Kaydet:
  1. `products` UPDATE: name, slug, size, price, badge_tr/en, category, medal,
     is_active, description_tr/en, details (serialize edilmiş jsonb).
  2. Stok değişmişse `stock_movements` insert (reason `adjustment`) — mevcut
     mantık korunur, `stock_quantity` ASLA elle UPDATE edilmez.
- Slug değişimi: benzersizlik DB unique kısıtıyla; çakışmada hata mesajı gösterilir.
  (Slug değişimi eski URL'i kırar — editörde uyarı metni gösterilir.)
- `getProductBySlug` select listesine `category` (ve Faz 2'de `image_url`) eklenir
  ki editör/önizleme tam veri görsün.

### 4. i18n

`messages/tr.json` ve `messages/en.json` içinde `admin.products.editor.*` altına
sekme başlıkları, alan etiketleri, "satır ekle/sil", ikon adları vb. eklenir.

### 5. Build/deploy akışı

Kural (memory): ben yazarım → Emre lokalde inceler → onayla deploy. Sandbox
supabase.co'ya erişemez; bu yüzden sandbox build'inde önizleme fallback ürünle
çalışır (normal), gerçek DB testi Emre'nin lokalinde/canlıda. `database.types.ts`
şema değişmediği için yeniden üretim gerekmez (Faz 1'de yeni kolon yok).

## Faz 2 — Görsel yükleme (özet, ayrı planlanacak)

- Supabase Storage `product-images` bucket'ı + RLS (public read, admin write) →
  Emre'nin Supabase SQL editöründe çalıştıracağı SQL dosyası (admin-kurulum.sql
  benzeri).
- `next.config.ts` → `images.remotePatterns` ile `svqwldedkznirqpwxgat.supabase.co`.
- Şişe görseli: `products.image_url` kullanılır; `productImage(slug, image_url?)`
  yardımcı `image_url || /images/products/{slug}.webp` döndürür. Katalog + detay
  bu yardımcıdan beslenir; sipariş geçmişi snapshot'ları konvansiyonda kalır.
- Galeri: yüklenen public URL'ler `details.gallery`'ye yazılır.
- Dokunulacak dosyalar (tahmini): lib/admin.ts (productImage), lib/products.ts
  (select + tip), components/product/ProductCard.tsx, ProductGallery (remote),
  cart/* ve account/* görsel referansları, lib/schema.ts (JSON-LD), page.tsx (OG).

## Riskler / kararlar

- Önizleme için `ProductDetail` çıkarımı `page.tsx`'i sadeleştirir; mevcut server
  veri-çekme mantığı `page.tsx`'te kalır, sadece sunum taşınır.
- Geniş editör + canlı önizleme istemci tarafında ağır olabilir; önizleme
  debounce'lanabilir (gerekirse).
- Faz 1 yeni DB kolonu/migration gerektirmez → düşük risk.

## Test / doğrulama

- `npm run build` (lint + tip) temiz geçmeli — geçmişte round-trip/build dersleri var.
- Emre lokalde: bir ürünü tüm sekmelerden düzenle, kaydet, canlı sayfada doğrula;
  önizleme = canlı sayfa kontrolü; stok hareketi doğru işliyor mu.
