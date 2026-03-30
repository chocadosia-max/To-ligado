import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

let client = null

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ SUPABASE_URL e/ou SUPABASE_ANON_KEY não estão definidos no .env. App rodará com BD desativado.')
} else {
  client = createClient(supabaseUrl, supabaseKey)
}

export const supabase = client
