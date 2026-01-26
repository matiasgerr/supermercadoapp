import { createClient } from '@supabase/supabase-js';

// Reemplaza estos valores con los que están en Settings -> API de tu proyecto en Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPERBASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPERBASE_CLIENT_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Please check your .env.local file and ensure NEXT_PUBLIC_SUPERBASE_URL and NEXT_PUBLIC_SUPERBASE_CLIENT_KEY are set.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función para obtener comercios filtrados por categoría (incluyendo sus productos)
export async function getComerciosPorCategoria(categoriaNombre: string) {
  try {
    // 1. Buscamos el ID de la categoría
    const { data: catData, error: catError } = await supabase
      .from('categorias')
      .select('id')
      .ilike('nombre', categoriaNombre)
      .single();

    if (catError || !catData) {
      console.error('Error buscando categoría:', catError);
      return [];
    }

    // 2. Traemos comercios y productos
    const { data, error } = await supabase
      .from('comercios')
      .select('*, productos(*)')
      .eq('categoria_id', catData.id);

    if (error) {
      console.error('Error buscando comercios:', error);
      return [];
    }

    return data;
  } catch (err) {
    console.error('Error inesperado:', err);
    return [];
  }
}

// Función básica para obtener todos los comercios (sin filtrar)
export async function getComercios() {
  const { data, error } = await supabase
    .from('comercios')
    .select('*');
    
  if (error) {
    console.error('Error:', error);
    return [];
  }
  return data;
}
