import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anonKey) {
  console.warn(
    "[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. " +
      "Set them in .env.local. See .env.example."
  );
}

export const supabase = createClient(url ?? "", anonKey ?? "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const ADMIN_EMAIL =
  (import.meta.env.VITE_ADMIN_EMAIL as string | undefined)?.toLowerCase() ??
  "shoaib@capistor.com";

export type DbProduct = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string | null;
  position: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type DbProductImage = {
  id: string;
  product_id: string;
  url: string;
  alt: string;
  caption: string | null;
  position: number;
  created_at: string;
};

export type DbSubscriber = {
  id: string;
  email: string;
  source: string | null;
  confirmed: boolean;
  created_at: string;
};

export type ProductWithImages = DbProduct & {
  images: DbProductImage[];
};
