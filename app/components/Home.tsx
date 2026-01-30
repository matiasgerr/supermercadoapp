import React from "react";
import { useNavigate } from "react-router-dom";

const Selector: React.FC = () => {
  const navigate = useNavigate();

  return (
    /* Contenedor principal con fondo adaptativo */
    <div className="flex flex-col items-center justify-center min-h-screen p-6 transition-colors duration-300 bg-gray-50 dark:bg-zinc-950">
      
      {/* Título con contraste corregido */}
      <h1 className="text-3xl font-extrabold mb-12 text-gray-800 dark:text-zinc-100 tracking-tight">
        ¿Qué acción desea realizar?
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl p-auto">
        
        {/* Card de Dashboard */}
        <button 
          onClick={() => navigate(`/gestion`)}
          className="group relative h-48 bg-white dark:bg-zinc-900 shadow-md dark:shadow-2xl rounded-2xl 
                     transition-all duration-300 border border-gray-200 dark:border-zinc-800
                     hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-xl hover:-translate-y-1
                     flex flex-col items-center justify-center gap-3 "
        >
          <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
            {/* Puedes insertar un icono aquí más adelante */}
            <span className="text-2xl">📋</span>
          </div>
          <span className="font-bold text-xl text-gray-800 dark:text-zinc-100">Dashboard</span>
        </button>

        {/* Card de Comparar */}
        <button 
          onClick={() => navigate(`/compararr`)}
          className="group relative h-48 bg-white dark:bg-zinc-900 shadow-md dark:shadow-2xl rounded-2xl 
                     transition-all duration-300 border border-gray-200 dark:border-zinc-800
                     hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-xl hover:-translate-y-1
                     flex flex-col items-center justify-center gap-3
                     disabled:opacity-50 disabled:cursor-not-allowed"
          disabled
                    // className="group relative h-48 bg-white dark:bg-zinc-900 shadow-md dark:shadow-2xl rounded-2xl 
          //            transition-all duration-300 border border-gray-200 dark:border-zinc-800
          //            hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-xl hover:-translate-y-1
          //            flex flex-col items-center justify-center gap-3"
        >
          <div className="p-3 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
            <span className="text-2xl">📊</span>
          </div>
          <span className="font-bold text-xl text-gray-800 dark:text-zinc-100">Comparar</span>
        </button>

      </div>
      
      {/* Indicador sutil de versión o estado */}
      <p className="absolute bottom-4 text-sm text-gray-500 dark:text-zinc-400 italic">
        Gestion-to-Market v1.0
      </p>
    </div>
  );
};

export default Selector;