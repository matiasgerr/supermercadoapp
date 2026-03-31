"use client";

import Link from "next/link";
import Icon from "@mdi/react";
import { mdiPencil } from "@mdi/js";
import type { Categoria, Comercio } from "../type/gestion";

type SideBarProps = {
  categorias: Categoria[];
  categoriaSeleccionada: Categoria | null;
  comercios: Comercio[];
  localSeleccionadoId: number | null;
  onSeleccionarCategoria: (categoria: Categoria) => void;
  onSeleccionarLocal: (localId: number) => void;
  onEditarComercio: (comercio: Comercio) => void;
};

export const SideBar: React.FC<SideBarProps> = ({
  categorias,
  categoriaSeleccionada,
  comercios,
  localSeleccionadoId,
  onSeleccionarCategoria,
  onSeleccionarLocal,
  onEditarComercio,
}) => {
  return (
    <div className="w-64 bg-gray-900 text-white p-4 flex flex-col gap-4">
      <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Categorías</h2>
      {categorias.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSeleccionarCategoria(cat)}
          className={`text-left p-3 rounded-lg transition capitalize ${categoriaSeleccionada?.id === cat.id ? "bg-blue-600" : "hover:bg-gray-800"}`}
        >
          {cat.nombre}
        </button>
      ))}

      <div className="mt-4 flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase">Tus Locales</h3>
        {categoriaSeleccionada && comercios.length > 0 ? (
          comercios.map((local) => (
            <div
              key={local.id}
              className={`flex items-center justify-between transition rounded ${localSeleccionadoId === local.id ? "bg-gray-700 font-bold" : "hover:bg-gray-800"}`}
            >
              <button
                onClick={() => onSeleccionarLocal(local.id)}
                className="text-left text-sm p-2 flex-1"
              >
                {local.nombre}
              </button>
              <button
                onClick={() => onEditarComercio(local)}
                className="text-blue-500 p-2"
              >
                <Icon path={mdiPencil} size={0.8} />
              </button>
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-400 p-2">Seleccione una categoria</div>
        )}
      </div>

      <Link href="/" className="mt-auto w-full bg-gray-800 p-3 rounded-lg text-center">
        Volver al Inicio
      </Link>
    </div>
  );
};
