import { createClient } from '@supabase/supabase-js';

// Reemplaza estos valores con los que están en Settings -> API de tu proyecto en Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPERBASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPERBASE_CLIENT_KEY;
const missingSupabaseEnvMessage =
  "Missing Supabase environment variables. Please check your .env.local file and ensure NEXT_PUBLIC_SUPERBASE_URL and NEXT_PUBLIC_SUPERBASE_CLIENT_KEY are set.";

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error(missingSupabaseEnvMessage);
  }

  return supabase;
}

const hasDataArray = (value: unknown): value is { data: unknown[] } => {
  if (!value || typeof value !== "object") return false;
  if (!("data" in value)) return false;
  const data = (value as { data: unknown }).data;
  return Array.isArray(data);
};

export async function getCategorias() {
  if (!supabaseUrl || !supabaseAnonKey) return [];

  const headers: HeadersInit = {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
    Accept: "application/json",
  };

  const base = supabaseUrl.replace(/\/+$/, "");
  const restBase = base.endsWith("/rest/v1") ? base : `${base}/rest/v1`;
  const url = `${restBase}/categorias?select=*&order=id.asc`;

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) return [];

    const json = await res.json();
    if (Array.isArray(json)) return json;
    if (hasDataArray(json)) return json.data;
  } catch {
    return [];
  }

  return [];
}

// Función para obtener comercios filtrados por categoría (incluyendo sus productos)
export async function getComerciosPorCategoria(categoriaNombre: string) {
  try {
    const client = requireSupabase();

    // 1. Buscamos el ID de la categoría
    const { data: catData, error: catError } = await client
      .from('categorias')
      .select('id')
      .ilike('nombre', categoriaNombre)
      .single();

    if (catError || !catData) {
      console.error('Error buscando categoría:', catError);
      return [];
    }

    // 2. Traemos comercios y productos
    const { data, error } = await client
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
  const client = requireSupabase();
  const { data, error } = await client
    .from('comercios')
    .select('*');
    
  if (error) {
    console.error('Error:', error);
    return [];
  }
  return data;
}
