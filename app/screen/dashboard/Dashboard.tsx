import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase, getComerciosPorCategoria } from "../../hook/superbaseClient"; // Asegúrate de que esta ruta sea correcta
import { useDeleteComercio } from "../../hook/useComercioDelete";
import { mdiDelete, mdiPencil, mdiStar } from '@mdi/js'; 
import Icon from "@mdi/react";
import EditModal from "../../components/editModal";
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
    // const { tipo } = useParams(); // YA NO USAMOS ESTO DE LA URL
    
    // ESTADOS NUEVOS PARA MANEJAR LA NAVEGACIÓN INTERNA
    const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<{ id: number; nombre: string } | null>(null);

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

    const { deleteComercio } = useDeleteComercio();

    // --- CARGAR CATEGORÍAS AL INICIO ---
    useEffect(() => {
        const cargarCategorias = async () => {
            const { data, error } = await supabase
                .from('categorias')
                .select('*')
                .order('id', { ascending: true });
            
            if (!error && data) {
                setCategorias(data);
                // Opcional: Seleccionar la primera por defecto si quieres
                // if (data.length > 0) setCategoriaSeleccionada(data[0]);
            }
        };
        cargarCategorias();
    }, []);

    // --- LÓGICA DE CARGA DE COMERCIOS (READ) ---
    const traerDatos = async () => {
        if (!categoriaSeleccionada) return;

        // Ya tenemos el ID, así que consultamos directo por ID, más eficiente
        const { data, error } = await supabase
            .from('comercios')
            .select('*, productos(*)')
            .eq('categoria_id', categoriaSeleccionada.id);

        if (!error && data) {
            setComercios(data);
        }
    };

    useEffect(() => {
        traerDatos();
        setLocalSeleccionadoId(null); // Resetear selección de local al cambiar categoría
    }, [categoriaSeleccionada]); 

    // --- LÓGICA DE LOCALES (CREATE) ---
    const agregarLocal = async () => {
        if (!nombreNuevoLocal.trim() || !categoriaSeleccionada) return;

        const { error } = await supabase
            .from('comercios')
            .insert([{ 
                nombre: nombreNuevoLocal, 
                categoria_id: categoriaSeleccionada.id 
            }]);

        if (!error) {
            setNombreNuevoLocal("");
            await traerDatos(); 
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

    const actualizarComercio = async () => {
        if (!comercioAEditar || !nuevoNombreComercio.trim()) return;

        const { error } = await supabase
            .from('comercios')
            .update({ nombre: nuevoNombreComercio })
            .eq('id', comercioAEditar.id);

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
            await traerDatos(); // Recargar lista
            setShowModaledit(false);
            setComercioAEditar(null);
            if (localSeleccionadoId === comercioAEditar.id) {
                setLocalSeleccionadoId(null);
            }
        }
    };

    const localActivo = comercios.find(c => c.id === localSeleccionadoId);
    const [showModaledit, setShowModaledit] = useState(false);

    return (
        <div className="flex h-screen bg-white">
            {/* Sidebar Izquierdo */}
            <div className="w-64 bg-gray-900 text-white p-4 flex flex-col gap-4">
                <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Categorías</h2>
                {categorias.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setCategoriaSeleccionada(cat)}
                        className={`text-left p-3 rounded-lg transition capitalize ${categoriaSeleccionada?.id === cat.id ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
                    >
                        {cat.nombre}
                    </button>
                ))}

                <div className="mt-4 flex flex-col gap-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase">Tus Locales</h3>
                    {comercios.map(local => (
                        <div key={local.id} className={`flex items-center justify-between transition ${localSeleccionadoId === local.id ? 'bg-gray-700 font-bold' : 'hover:bg-gray-800'}`}>
                        <button
                            onClick={() => setLocalSeleccionadoId(local.id)}
                            className={` text-left text-sm p-2 rounded '}`}
                        >
                       
                            {local.nombre}
                       
                            </button>
                             <button
                            onClick={() => {
                                setComercioAEditar(local);
                                setNuevoNombreComercio(local.nombre);
                                setShowModaledit(true);
                            }}
                            className="text-blue-500 hover:text-shadow-blue-400 z-10 "
                            >
                            <Icon path={mdiPencil} size={1.2} />
                        </button>
                        </div>
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
                <h2 className="text-3xl font-bold text-gray-800 mb-6 capitalize">
                    {categoriaSeleccionada ? `Gestión de ${categoriaSeleccionada.nombre}` : 'Selecciona una Categoría'}
                </h2>

                {categoriaSeleccionada ? (
                    <>
                        {/* Formulario de Registro de Local */}
                        <div className="bg-gray-50 p-6 rounded-xl mb-8 border border-gray-200">
                            <h3 className="font-semibold mb-4 text-black">Registrar Nuevo Local en {categoriaSeleccionada.nombre}</h3>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    value={nombreNuevoLocal}
                                    onChange={(e) => setNombreNuevoLocal(e.target.value)}
                                    placeholder={`Ej: ${categoriaSeleccionada.nombre} del Sol`}
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
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <p className="text-xl">Selecciona una categoría para comenzar</p>
                    </div>
                )}
            </div>
            
            <EditModal 
                isOpen={showModaledit} 
                onClose={() => {
                    setShowModaledit(false);
                    setComercioAEditar(null);
                }}
                title={comercioAEditar ? `Editar ${comercioAEditar.nombre}` : 'Editar Comercio'}
            >
                <div className="flex flex-col gap-5">
                        <span className="text-gray-700 font-semibold">Nombre del Local</span>
                    <label className="flex justify-between items-center ">
                        <input 
                            type="text" 
                            value={nuevoNombreComercio} 
                            onChange={(e) => setNuevoNombreComercio(e.target.value)}
                            className="mt-1 block w-3/4 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2 border"
                        />
                          <button 
                            onClick={borrarComercio}
                            className="flex items-center gap-1 text-red-500 hover:text-red-700 font-medium px-3 py-2 rounded hover:bg-red-50"
                        >
                            <Icon path={mdiDelete} size={0.8} />
                        </button>
                        <button
                            onClick={() => setNuevoNombreComercio("")}
                            className="text-gray-400 hover:text-gray-600"
                            title="Borrar texto"
                        >
                            <span className="text-xl">&times;</span>
                        </button>
                    </label>

                    <div className="flex  items-end mt-4">
                      

                        <div className="flex gap-2">
                            <button 
                                onClick={() => setShowModaledit(false)} 
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={actualizarComercio} 
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            </EditModal>
        </div>
    );
};

export default PanelGestion;