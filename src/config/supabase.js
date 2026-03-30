import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('❌ SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórios no .env')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
