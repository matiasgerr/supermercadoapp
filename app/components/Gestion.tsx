import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/superbaseClient"; // Asegúrate de que esta ruta sea correcta

// Definición de tipos basada en nuestra estructura de base de datos
type Producto = {
    id?: number;
    nombre: string;
    precio: number;
    cantidad: number;
    stock: number;
};

type Comercio = {
    id: number;
    nombre: string;
    categoria_id: number;
    productos: Producto[];
};

type PanelGestionProps = {
    comercios: Comercio[];
    setComercios: React.Dispatch<React.SetStateAction<Comercio[]>>;
};

const PanelGestion: React.FC<PanelGestionProps> = ({ comercios, setComercios }) => {
    const navigate = useNavigate();
    const { tipo } = useParams(); // Obtenemos la categoría de la URL
    
    const [nombreNuevoLocal, setNombreNuevoLocal] = useState("");
    const [localSeleccionadoId, setLocalSeleccionadoId] = useState<number | null>(null);
    const [nuevoProducto, setNuevoProducto] = useState<Producto>({
        nombre: "",
        precio: 0,
        cantidad: 0,
        stock: 0,
    });

    // --- LÓGICA DE CARGA (READ) ---
    const traerDatos = async () => {
        if (!tipo) return;

        // 1. Buscamos el ID de la categoría actual por su nombre (slug)
        const { data: catData } = await supabase
            .from('categorias')
            .select('id')
            .ilike('nombre', tipo)
            .single();

        if (catData) {
            // 2. Traemos comercios y sus productos relacionados en una sola consulta
            const { data, error } = await supabase
                .from('comercios')
                .select('*, productos(*)')
                .eq('categoria_id', catData.id);

            if (!error && data) {
                setComercios(data);
            }
        }
    };

    useEffect(() => {
        traerDatos();
    }, [tipo]); // Se recarga cuando cambias de categoría en el sidebar

    // --- LÓGICA DE LOCALES (CREATE) ---
    const agregarLocal = async () => {
        if (!nombreNuevoLocal.trim() || !tipo) return;

        const { data: cat } = await supabase
            .from('categorias')
            .select('id')
            .ilike('nombre', tipo)
            .single();

        if (cat) {
            const { error } = await supabase
                .from('comercios')
                .insert([{ nombre: nombreNuevoLocal, categoria_id: cat.id }]);

            if (!error) {
                setNombreNuevoLocal("");
                await traerDatos(); // Recargamos la lista desde la nube
            }
        }
    };

    // --- LÓGICA DE PRODUCTOS (CREATE) ---
    const manejarAgregarProducto = async () => {
        if (!localSeleccionadoId || !nuevoProducto.nombre.trim()) return;

        const { error } = await supabase
            .from('productos')
            .insert([{
                comercio_id: localSeleccionadoId,
                nombre: nuevoProducto.nombre,
                precio: nuevoProducto.precio,
                cantidad: nuevoProducto.cantidad,
                stock: nuevoProducto.stock
            }]);

        if (!error) {
            setNuevoProducto({ nombre: "", precio: 0, cantidad: 0, stock: 0 });
            await traerDatos(); // Actualizamos la tabla para ver el nuevo producto
        }
    };

    const localActivo = comercios.find(c => c.id === localSeleccionadoId);

    return (
        <div className="flex h-screen bg-white">
            {/* Sidebar Izquierdo */}
            <div className="w-64 bg-gray-900 text-white p-4 flex flex-col gap-4">
                <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Categorías</h2>
                {['Farmacia', 'Supermercado', 'Supermercado Mayorista'].map(cat => (
                    <button
                        key={cat}
                        onClick={() => {
                            setLocalSeleccionadoId(null);
                            navigate(`/gestion/${cat.toLowerCase()}`); // Cambiamos la URL
                        }}
                        className={`text-left p-3 rounded-lg transition capitalize ${tipo === cat.toLowerCase() ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
                    >
                        {cat}
                    </button>
                ))}

                <div className="mt-4 flex flex-col gap-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase">Tus Locales</h3>
                    {comercios.map(local => (
                        <button
                            key={local.id}
                            onClick={() => setLocalSeleccionadoId(local.id)}
                            className={`text-left text-sm p-2 rounded transition ${localSeleccionadoId === local.id ? 'bg-gray-700 font-bold' : 'hover:bg-gray-800'}`}
                        >
                            {local.nombre}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="mt-auto w-full bg-gray-800 hover:bg-gray-700 p-3 rounded-lg text-center"
                >
                    Volver al Inicio
                </button>
            </div>

            {/* Área Principal */}
            <div className="flex-1 p-8 overflow-y-auto">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 capitalize">Gestión de {tipo}</h2>

                {/* Formulario de Registro de Local */}
                <div className="bg-gray-50 p-6 rounded-xl mb-8 border border-gray-200">
                    <h3 className="font-semibold mb-4 text-black">Registrar Nuevo Local en {tipo}</h3>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={nombreNuevoLocal}
                            onChange={(e) => setNombreNuevoLocal(e.target.value)}
                            placeholder="Ej: Farmacia del Sol"
                            className="flex-1 p-2 border rounded text-black font-medium"
                        />
                        <button onClick={agregarLocal} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">
                            Agregar Local
                        </button>
                    </div>
                </div>

                {/* Tabla de Productos */}
                <div className="bg-white rounded-lg shadow border border-gray-100">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-black">
                            {localActivo ? `Productos de: ${localActivo.nombre}` : 'Selecciona un local'}
                        </h3>
                    </div>

                    {/* Formulario de Producto */}
                    {localActivo && (
                        <div className="p-4 bg-green-50 border-b flex flex-wrap gap-2">
                            <input
                                placeholder="Nombre Producto"
                                value={nuevoProducto.nombre}
                                onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
                                className="flex-1 p-2 border rounded text-black"
                            />
                            <input
                                type="number"
                                placeholder="Precio"
                                value={nuevoProducto.precio || ""}
                                onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: Number(e.target.value) })}
                                className="w-24 p-2 border rounded text-black"
                            />
                            <input
                                type="number"
                                placeholder="Cant."
                                value={nuevoProducto.cantidad || ""}
                                onChange={(e) => setNuevoProducto({ ...nuevoProducto, cantidad: Number(e.target.value) })}
                                className="w-20 p-2 border rounded text-black"
                            />
                            <input
                                type="number"
                                placeholder="Stock"
                                value={nuevoProducto.stock || ""}
                                onChange={(e) => setNuevoProducto({ ...nuevoProducto, stock: Number(e.target.value) })}
                                className="w-20 p-2 border rounded text-black"
                            />
                            <button
                                onClick={manejarAgregarProducto}
                                className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700"
                            >
                                Añadir
                            </button>
                        </div>
                    )}

                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
                                <th className="p-3 border">Nombre</th>
                                <th className="p-3 border">Precio c/u</th>
                                <th className="p-3 border">Cantidad</th>
                                <th className="p-3 border">Stock</th>
                            </tr>
                        </thead>
                        <tbody>
                            {localActivo && localActivo.productos && localActivo.productos.length > 0 ? (
                                localActivo.productos.map((prod, i) => (
                                    <tr key={i} className="hover:bg-gray-50 text-black">
                                        <td className="p-3 border font-medium">{prod.nombre}</td>
                                        <td className="p-3 border">${prod.precio}</td>
                                        <td className="p-3 border">{prod.cantidad}</td>
                                        <td className="p-3 border">{prod.stock}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="p-10 border text-gray-400 text-center" colSpan={4}>
                                        {localSeleccionadoId
                                            ? "Este local no tiene productos cargados."
                                            : "Haz clic en un local de la barra lateral para ver sus productos..."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PanelGestion;