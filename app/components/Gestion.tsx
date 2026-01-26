import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

type Producto = {
    nombre: string;
    precio: number;
    cantidad: number;
    stock: number;
};

type Comercio = {
    id: number;
    nombre: string;
    categoria: string;
    productos: Producto[];
};

type PanelGestionProps = {
    categoria: string;
    setCategoria: (c: string) => void;
    comercios: Comercio[]; // Ya no es opcional
    setComercios: React.Dispatch<React.SetStateAction<Comercio[]>>;
};

const PanelGestion: React.FC<PanelGestionProps> = ({ categoria, setCategoria, comercios, setComercios }) => {
    const navigate = useNavigate();
    const [nombreNuevoLocal, setNombreNuevoLocal] = useState("");
    const [localSeleccionadoId, setLocalSeleccionadoId] = useState<number | null>(null);
    const [nuevoProducto, setNuevoProducto] = useState<Producto>({
        nombre: "",
        precio: 0,
        cantidad: 0,
        stock: 0,
    });
    // 1. Lógica para agregar Local
    const agregarLocal = () => {
        if (!nombreNuevoLocal.trim()) return;

        const nuevoLocal: Comercio = {
            id: Date.now(), // ID único simple
            nombre: nombreNuevoLocal,
            categoria: categoria, // Se guarda en la categoría donde estás parado
            productos: []
        };

        setComercios([...comercios, nuevoLocal]);
        setNombreNuevoLocal(""); // Limpiamos el input
    };

    // 2. Filtramos comercios para mostrar solo los de esta categoría
    const comerciosFiltrados = comercios.filter(c => c.categoria === categoria);

    // 3. Obtenemos el local que el usuario clickeó para ver sus productos
    const localActivo = comercios.find(c => c.id === localSeleccionadoId);


    //manejo de la logica para agregar productos
    const manejarAgregarProducto = () => {
        if (!localSeleccionadoId || !nuevoProducto.nombre.trim()) return;
        const listaActualizada = comercios.map((comercio) => {
            if (comercio.id === localSeleccionadoId) {
                return {
                    ...comercio,
                    productos: [...comercio.productos, nuevoProducto],
                };
            }
            return comercio;
        });
        setComercios(listaActualizada);
        setNuevoProducto({ nombre: "", precio: 0, cantidad: 0, stock: 0 }); // Limpiar el formulario
    }

    return (
        <div className="flex h-screen bg-white">
            {/* Sidebar Izquierdo */}
            <div className="w-64 bg-gray-900 text-white p-4 flex flex-col gap-4">
                <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Categorías</h2>
                {['Farmacia', 'Supermercado', 'Supermercado Mayorista'].map(cat => (
                    <button
                        key={cat}
                        onClick={() => { setCategoria(cat); setLocalSeleccionadoId(null); }}
                        className={`text-left p-3 rounded-lg transition ${categoria === cat ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
                    >
                        {cat}
                    </button>
                ))}

                {/* LISTADO DE LOCALES EN EL SIDEBAR */}
                <div className="mt-4 flex flex-col gap-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase">Tus Locales</h3>
                    {comerciosFiltrados.map(local => (
                        <div key={local.id} className="flex items-center justify-between group">
                            <button
                                onClick={() => setLocalSeleccionadoId(local.id)}
                                className={`flex-1 text-sm p-2 rounded ${localSeleccionadoId === local.id ? 'bg-gray-700 font-bold' : 'hover:bg-gray-800'}`}
                            >
                                {local.nombre}
                            </button>
                            <button
                                className="opacity-0 group-hover:opacity-100 bg-green-600 p-1 text-xs rounded ml-1"
                                title="Añadir producto"
                            >
                                +
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="mt-auto w-full bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg transition text-center"
                >
                    Volver al Inicio
                </button>
            </div>

            {/* Área Principal */}
            <div className="flex-1 p-8 overflow-y-auto">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">{categoria}</h2>

                {/* Formulario de Registro */}
                <div className="bg-gray-50 p-6 rounded-xl mb-8 border border-gray-200">
                    <h3 className="font-semibold mb-4 ">Registrar Nuevo Local en {categoria}</h3>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={nombreNuevoLocal}
                            onChange={(e) => setNombreNuevoLocal(e.target.value)}
                            placeholder="Ej: Farmacia del Sol"
                            className="flex-1 p-2 border rounded text-[#000]"
                        />
                        <button onClick={agregarLocal} className="bg-blue-600 text-white px-6 py-2 rounded">
                            Agregar Local
                        </button>
                    </div>
                </div>

                {/* Tabla de Productos */}
                <div className="bg-white rounded-lg shadow border border-gray-100">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold">
                            {localActivo ? `Productos de: ${localActivo.nombre}` : 'Selecciona un local'}
                        </h3>
                    </div>

                    {/* FORMULARIO DE PRODUCTO (Aparece solo si hay un local seleccionado) */}
                    {localActivo && (
                        <div className="p-4 bg-green-50 border-b flex flex-wrap gap-2">
                            <input
                                placeholder="Nombre Producto"
                                value={nuevoProducto.nombre}
                                onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
                                className="flex-1 p-2 border rounded"
                            />
                            <input
                                type="number"
                                placeholder="Precio"
                                value={nuevoProducto.precio || ""}
                                onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: Number(e.target.value) })}
                                className="w-24 p-2 border rounded"
                            />
                            <input
                                type="number"
                                placeholder="Cantidad"
                                value={nuevoProducto.cantidad || ""}
                                onChange={(e) => setNuevoProducto({ ...nuevoProducto, cantidad: Number(e.target.value) })}
                                className="w-24 p-2 border rounded"
                            />
                            <input
                                type="number"
                                placeholder="Stock"
                                value={nuevoProducto.stock || ""}
                                onChange={(e) => setNuevoProducto({ ...nuevoProducto, stock: Number(e.target.value) })}
                                className="w-24 p-2 border rounded"
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
                            {localActivo && localActivo.productos.length > 0 ? (
                                localActivo.productos.map((prod, i) => (
                                    <tr key={i} className="hover:bg-gray-50 text-black">
                                        <td className="p-3 border">{prod.nombre}</td>
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