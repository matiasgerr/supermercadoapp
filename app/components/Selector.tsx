import React from "react";

type SelectorProps = {
  setVista: (v: string) => void;
  setCategoria: (c: string) => void;
};

const Selector: React.FC<SelectorProps> = ({ setVista, setCategoria }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
    <h1 className="text-2xl font-bold mb-8">¿Qué consulta desea realizar?</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl shadow">
      {['Farmacia', 'Supermercado', 'Supermercado Mayorista'].map((tipo) => (
        <button 
          key={tipo}
          onClick={() => { setCategoria(tipo); setVista('gestion'); }}
          className="h-40 bg-white shadow-lg rounded-xl hover:bg-blue-50 transition-colors flex flex-col items-center justify-center border-2 border-transparent hover:border-blue-500"
        >
          <span className="font-semibold text-lg text-black">{tipo}</span>
        </button>
      ))}
    </div>
    <button 
      onClick={() => setVista('comparar')}
      className="mt-12 px-8 py-3 bg-green-600 text-white rounded-full font-bold shadow-lg hover:bg-green-700"
    >
      📊 Comparar Precios
    </button>
  </div>
);

export default Selector;