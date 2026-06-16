-- =====================================================================
--  VEROLIVA ADMIN — Ayarlar ve Yorumlar için veritabanı kurulumu
--  Supabase Dashboard → SQL Editor → bu bloğu yapıştır → Run
--  Tek seferlik. İki kez çalıştırmak güvenli (IF NOT EXISTS / drop policy).
-- =====================================================================

-- ───────────────────────────────────────────────────────────────────
-- 1) site_settings  (Ayarlar paneli: duyuru barı, iletişim, IBAN)
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.site_settings (
  id                int primary key default 1,
  announcement_tr   text,
  announcement_en   text,
  contact_email     text,
  contact_phone     text,
  contact_address   text,
  iban              text,
  bank_account_name text,
  updated_at        timestamptz not null default now(),
  constraint site_settings_single_row check (id = 1)
);

insert into public.site_settings (id) values (1)
  on conflict (id) do nothing;

alter table public.site_settings enable row level security;

drop policy if exists "public read site_settings" on public.site_settings;
create policy "public read site_settings"
  on public.site_settings for select
  using (true);

drop policy if exists "admin write site_settings" on public.site_settings;
create policy "admin write site_settings"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- ───────────────────────────────────────────────────────────────────
-- 2) reviews  (Yorumlar paneli: ürün değerlendirmeleri + moderasyon)
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid references public.products(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  author_name text not null,
  rating      int  not null check (rating between 1 and 5),
  title       text,
  body        text not null,
  status      text not null default 'pending'
              check (status in ('pending','approved','rejected')),
  created_at  timestamptz not null default now()
);

create index if not exists reviews_product_idx on public.reviews(product_id);
create index if not exists reviews_status_idx  on public.reviews(status);

alter table public.reviews enable row level security;

-- Herkes onaylı yorumları görür; admin hepsini görür
drop policy if exists "read approved reviews" on public.reviews;
create policy "read approved reviews"
  on public.reviews for select
  using (status = 'approved' or public.is_admin());

-- Giriş yapmış kullanıcı kendi adına yorum bırakır (onay bekler)
drop policy if exists "auth insert reviews" on public.reviews;
create policy "auth insert reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

-- Moderasyon: sadece admin günceller / siler
drop policy if exists "admin update reviews" on public.reviews;
create policy "admin update reviews"
  on public.reviews for update
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin delete reviews" on public.reviews;
create policy "admin delete reviews"
  on public.reviews for delete
  using (public.is_admin());
