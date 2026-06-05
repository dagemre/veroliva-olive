// Supabase istemcisi (anon anahtarla — RLS politikaları geçerli).
// Server component'lerde kullanılır; Next fetch cache'i ile 5 dk ISR.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createSupabaseClient(options?: { revalidate?: number }) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: {
      // Next.js fetch cache: ürün verileri 5 dk önbellekte kalır (ISR)
      fetch: (url, init) =>
        fetch(url, {
          ...init,
          next: { revalidate: options?.revalidate ?? 300 },
        } as RequestInit),
    },
  });
}
