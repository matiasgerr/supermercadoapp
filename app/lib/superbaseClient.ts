import { createClient } from '@supabase/supabase-js';


// Reemplaza estos valores con los que están en Settings -> API de tu proyecto en Supabase
const supabaseUrl = process.env.SUPERBASE_URL! ;
const supabaseAnonKey = process.env.SUPERBASE_CLIENT_KEY! ;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);