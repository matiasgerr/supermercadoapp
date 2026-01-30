import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import type { Categoria, Comercio, Producto } from "../type/gestion";
import { getCategorias, supabase } from "../hook/superbaseClient";
import { useDeleteComercio } from "../hook/useComercioDelete";
import {  mdiPencil } from "@mdi/js";
import Icon from '@mdi/react';



type PanelGestionProps = {
  comercios: Comercio[];
  setComercios: React.Dispatch<React.SetStateAction<Comercio[]>>;
};
export const SideBar: React.FC<PanelGestionProps> = ({
  comercios,
  setComercios,
}) => {
     const navigate = useNavigate();
    
      const [categorias, setCategorias] = useState<Categoria[]>([]);
      const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);
      const [nombreNuevoLocal, setNombreNuevoLocal] = useState("");
      const [localSeleccionadoId, setLocalSeleccionadoId] = useState<number | null>(null);
      const [comercioAEditar, setComercioAEditar] = useState<Comercio | null>(null);
      const [nuevoNombreComercio, setNuevoNombreComercio] = useState("");
      const [nuevoProducto, setNuevoProducto] = useState<Producto>({
        nombre: "",
        precio: 0,
        cantidad: 0,
        stock: 0,
      });
    
      const [showModaledit, setShowModaledit] = useState(false);
      
      // CORRECCIÓN 1: Tipado correcto para evitar el error de 'never[]'
      const [productosExistentes, setProductosExistentes] = useState<string[]>([]);
    
      const { deleteComercio } = useDeleteComercio();
    
      // --- CARGAR CATEGORÍAS AL INICIO ---
      useEffect(() => {
        let cancelled = false;
        const cargarCategorias = async () => {
          const data = await getCategorias();
          if (cancelled) return;
          setCategorias(data);
    
          const savedId = localStorage.getItem("categoriaSeleccionadaId");
          if (savedId) {
            const found = data.find((c) => c.id === Number(savedId));
            if (found) setCategoriaSeleccionada(found);
          }
        };
        cargarCategorias();
        return () => { cancelled = true; };
      }, []);
    
      // --- GUARDAR SELECCIÓN EN LOCALSTORAGE ---
      useEffect(() => {
        if (categoriaSeleccionada) {
          localStorage.setItem("categoriaSeleccionadaId", categoriaSeleccionada.id.toString());
        }
      }, [categoriaSeleccionada]);
    
      // --- TRAER DATOS DE COMERCIOS ---
      const traerDatos = useCallback(async () => {
        if (!categoriaSeleccionada) return;
        const { data, error } = await supabase
          .from("comercios")
          .select("*, productos(*)")
          .eq("categoria_id", categoriaSeleccionada.id);
    
        if (!error && data) {
          setComercios(data);
        }
      }, [categoriaSeleccionada, setComercios]);
    
      useEffect(() => {
        const cargar = async () => {
          await traerDatos();
          setLocalSeleccionadoId(null);
        };
        void cargar();
      }, [categoriaSeleccionada, traerDatos]);
    
      // CORRECCIÓN 2: Filtrar productos por la CATEGORÍA del comercio
      // Esto evita que si estás en "Farmacia" te sugiera "Mayonesa"
      useEffect(() => {
        const fetchNombresProductos = async () => {
          if (!categoriaSeleccionada) return;
    
          // Hacemos un Join para traer solo productos de comercios que pertenecen a esta categoría
          const { data, error } = await supabase
            .from("productos")
            .select(`
              nombre,
              comercios!inner(categoria_id)
            `)
            .eq("comercios.categoria_id", categoriaSeleccionada.id);
    
          if (data && !error) {
            const nombresUnicos = [...new Set(data.map((p: any) => p.nombre))];
            setProductosExistentes(nombresUnicos);
          }
        };
    
        fetchNombresProductos();
      }, [categoriaSeleccionada]); // Se dispara cuando cambias de rubro (Farmacia/Súper)
    
      // --- MANEJADORES DE ACCIONES ---
      const agregarLocal = async () => {
        if (!nombreNuevoLocal.trim() || !categoriaSeleccionada) return;
        const { error } = await supabase.from("comercios").insert([
          { nombre: nombreNuevoLocal, categoria_id: categoriaSeleccionada.id },
        ]);
        if (!error) {
          setNombreNuevoLocal("");
          await traerDatos();
        }
      };
    
      const manejarAgregarProducto = async () => {
        if (!localSeleccionadoId || !nuevoProducto.nombre.trim()) return;
        const { error } = await supabase.from("productos").insert([
          {
            comercio_id: localSeleccionadoId,
            nombre: nuevoProducto.nombre,
            precio: nuevoProducto.precio,
            cantidad: nuevoProducto.cantidad,
            stock: nuevoProducto.stock,
          },
        ]);
        if (!error) {
          setNuevoProducto({ nombre: "", precio: 0, cantidad: 0, stock: 0 });
          await traerDatos();
        }
      };
    
      const actualizarComercio = async () => {
        if (!comercioAEditar || !nuevoNombreComercio.trim()) return;
        const { error } = await supabase
          .from("comercios")
          .update({ nombre: nuevoNombreComercio })
          .eq("id", comercioAEditar.id);
        if (!error) {
          await traerDatos();
          setShowModaledit(false);
          setComercioAEditar(null);
        }
      };
    
      const borrarComercio = async () => {
        if (!comercioAEditar) return;
        const exito = await deleteComercio(comercioAEditar.id);
        if (exito) {
          await traerDatos();
          setShowModaledit(false);
          setComercioAEditar(null);
          if (localSeleccionadoId === comercioAEditar.id) setLocalSeleccionadoId(null);
        }
      };
    
      const localActivo = comercios.find((c) => c.id === localSeleccionadoId);

  return (
     <div className="w-64 bg-gray-900 text-white p-4 flex flex-col gap-4">
        <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Categorías</h2>
        {categorias.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoriaSeleccionada(cat)}
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
                  onClick={() => setLocalSeleccionadoId(local.id)}
                  className="text-left text-sm p-2 flex-1"
                >
                  {local.nombre}
                </button>
                <button
                  onClick={() => {
                    setComercioAEditar(local);
                    setNuevoNombreComercio(local.nombre);
                    setShowModaledit(true);
                  }}
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

        <button onClick={() => navigate("/")} className="mt-auto w-full bg-gray-800 p-3 rounded-lg">
          Volver al Inicio
        </button>
      </div>
  )
}
