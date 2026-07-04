import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from './supabaseConfig'

// Importado SÓ pelos módulos src/data/api/*, que por sua vez só são carregados
// via import() dinâmico em services.ts. Assim o @supabase/supabase-js fica fora
// do chunk inicial (lazy, na primeira chamada real).
export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, { auth: { persistSession: true, autoRefreshToken: true } })
  : null
