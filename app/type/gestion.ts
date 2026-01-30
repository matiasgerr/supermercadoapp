// types/gestion.ts

export interface Categoria {
  id: number;
  nombre: string; // 'Farmacia', 'Supermercado', etc.
  slug?: string;   // 'farmacia', 'supermercado' (para la URL)
}

export interface Comercio {
  id: number;
  nombre: string;
  categoria_id: number; // <-- Aquí "englobamos" por ID
  productos?: Producto[];
}

export interface Producto {
  id?: number;
  comercio_id?: number; // <-- El producto sabe a qué local pertenece
  nombre: string;
  precio: number;
  cantidad: number;
  stock: number;
}
