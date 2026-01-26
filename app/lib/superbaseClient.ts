import { createClient } from '@supabase/supabase-js';

// Reemplaza estos valores con los que están en Settings -> API de tu proyecto en Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPERBASE_URL! ;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPERBASE_CLIENT_KEY! ;


export const supabase = createClient(supabaseUrl, supabaseAnonKey);