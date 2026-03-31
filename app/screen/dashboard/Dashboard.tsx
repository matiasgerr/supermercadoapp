"use client";

import React, { useCallback, useEffect, useState } from "react";
import { getCategorias, supabase } from "../../hook/superbaseClient";
import { useDeleteComercio } from "../../hook/useComercioDelete";
import { mdiDelete, mdiPencil } from "@mdi/js";
import Icon from "@mdi/react";
import EditModal from "../../components/editModal";
import type { Categoria, Comercio, Producto } from "../../type/gestion";
import { SideBar } from "../../components/sideBar";

type PanelGestionProps = {
  comercios: Comercio[];
  setComercios: React.Dispatch<React.SetStateAction<Comercio[]>>;
};

const PanelGestion: React.FC<PanelGestionProps> = ({
  comercios,
  setComercios,
}) => {
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
    <div className="flex h-screen bg-white">
      {/* Sidebar Izquierdo */}
      <SideBar
        categorias={categorias}
        categoriaSeleccionada={categoriaSeleccionada}
        comercios={comercios}
        localSeleccionadoId={localSeleccionadoId}
        onSeleccionarCategoria={setCategoriaSeleccionada}
        onSeleccionarLocal={setLocalSeleccionadoId}
        onEditarComercio={(local) => {
          setComercioAEditar(local);
          setNuevoNombreComercio(local.nombre);
          setShowModaledit(true);
        }}
      />

      {/* Área Principal */}
      <div className="flex-1 p-8 overflow-y-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 capitalize">
          {categoriaSeleccionada ? `Gestión de ${categoriaSeleccionada.nombre}` : "Selecciona una Categoría"}
        </h2>

        {categoriaSeleccionada && (
          <>
            {/* Formulario Local */}
            <div className="bg-gray-50 p-6 rounded-xl mb-8 border border-gray-200">
              <h3 className="font-semibold mb-4 text-black">Registrar Nuevo Local</h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={nombreNuevoLocal}
                  onChange={(e) => setNombreNuevoLocal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && agregarLocal()}
                  placeholder="Nombre del local"
                  className="flex-1 p-2 border rounded text-black"
                />
                <button onClick={agregarLocal} className="bg-blue-600 text-white px-6 py-2 rounded font-bold">
                  Agregar
                </button>
              </div>
            </div>

            {/* Tabla y Formulario de Productos */}
            <div className="bg-white rounded-lg shadow border border-gray-100">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-black">
                  {localActivo ? `Productos de: ${localActivo.nombre}` : "Selecciona un local"}
                </h3>
              </div>

              {localActivo && (
                <div className="p-4 bg-green-50 border-b flex flex-wrap gap-2">
                  {/* INPUT CON DATALIST FILTRADO */}
                  <div className="flex-1">
                    <input
                      list="nombres-productos-list"
                      placeholder="Nombre Producto"
                      value={nuevoProducto.nombre}
                      onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
                      className="w-full p-2 border rounded text-black"
                    />
                    <datalist id="nombres-productos-list">
                      {productosExistentes.map((nombre, index) => (
                        <option key={index} value={nombre} />
                      ))}
                    </datalist>
                  </div>
                  <input
                    type="number"
                    placeholder="Precio"
                    value={nuevoProducto.precio || ""}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: Number(e.target.value) })}
                    className="w-24 p-2 border rounded text-black"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={nuevoProducto.stock || ""}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, stock: Number(e.target.value) })}
                    className="w-20 p-2 border rounded text-black"
                  />
                  <button onClick={manejarAgregarProducto} className="bg-green-600 text-white px-4 py-2 rounded font-bold">
                    Añadir
                  </button>
                </div>
              )}

              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
                    <th className="p-3 border">Nombre</th>
                    <th className="p-3 border">Precio</th>
                    <th className="p-3 border">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {localActivo?.productos?.map((prod, i) => (
                    <tr key={i} className="hover:bg-gray-50 text-black">
                      <td className="p-3 border font-medium">{prod.nombre}</td>
                      <td className="p-3 border">${prod.precio}</td>
                      <td className="p-3 border">{prod.stock}</td>
                    </tr>
                  )) || (
                    <tr><td colSpan={3} className="p-10 text-center text-gray-400">Sin productos</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal de Edición */}
      <EditModal isOpen={showModaledit} onClose={() => setShowModaledit(false)} title="Editar Comercio">
         <div className="flex flex-col gap-4 p-4">
            <input 
              className="border p-2 rounded" 
              value={nuevoNombreComercio} 
              onChange={(e) => setNuevoNombreComercio(e.target.value)} 
            />
            <div className="flex justify-end gap-2">
              <button onClick={borrarComercio} className="text-red-500"><Icon path={mdiDelete} size={1}/></button>
              <button onClick={actualizarComercio} className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
            </div>
         </div>
      </EditModal>
    </div>
  );
};

export default PanelGestion;
