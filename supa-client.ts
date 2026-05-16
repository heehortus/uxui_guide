import { createClient } from "@supabase/supabase-js";

export const makeBrowserClient = () => {
  const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
  const supabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
  const client = createClient(supabaseUrl, supabaseKey);
  return client;
};