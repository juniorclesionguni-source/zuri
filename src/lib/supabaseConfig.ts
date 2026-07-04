// Só leitura de env — sem importar @supabase/supabase-js, para esta flag poder
// ser usada no chunk inicial sem arrastar o cliente pesado.
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
