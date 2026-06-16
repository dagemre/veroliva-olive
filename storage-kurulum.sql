-- Veroliva — Ürün görselleri için Supabase Storage kurulumu (Faz 2)
-- Supabase Dashboard → SQL Editor'de bir kez çalıştır. Idempotent (tekrar çalıştırılabilir).
-- Bucket: product-images (public read, yazma sadece admin → public.is_admin()).
-- Admin editöründeki "Şişe/Galeri Görseli Yükle" bunu kullanır.

-- 1) Bucket (public)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- 2) Politikalar (storage.objects) — varsa düşür, yeniden oluştur
drop policy if exists "product-images public read"   on storage.objects;
drop policy if exists "product-images admin insert"  on storage.objects;
drop policy if exists "product-images admin update"  on storage.objects;
drop policy if exists "product-images admin delete"  on storage.objects;

-- Herkese okuma (public bucket)
create policy "product-images public read"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Yazma/güncelleme/silme yalnızca admin (giriş yapmış + is_admin)
create policy "product-images admin insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "product-images admin update"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "product-images admin delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
