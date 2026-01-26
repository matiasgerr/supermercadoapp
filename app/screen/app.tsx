"use client";

import React, { useState, useEffect } from 'react';
import Selector from '../components/Home';
import PanelGestion from './dashboard/Dashboard';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

function App() {
  const [comercios, setComercios] = useState<any[]>([]);
  // 1. ESTADO DE LOS DATOS: Cargar desde localStorage sólo en el cliente
  useEffect(() => {
    const guardado = localStorage.getItem('mis-datos-compras');
    if (guardado) setComercios(JSON.parse(guardado));
  }, []);

  // Guardar cada vez que cambien los comercios
  useEffect(() => {
    localStorage.setItem('mis-datos-compras', JSON.stringify(comercios));
  }, [comercios]);

  // 2. ESTADO DE NAVEGACIÓN: Ya no necesitamos estados manuales si usamos rutas
  
  // Route wrapper that navigates and passes props
  const InicioRoute: React.FC = () => {
    return <Selector />;
  };

  const GestionRoute: React.FC = () => {
    return (
      <PanelGestion
        comercios={comercios}
        setComercios={setComercios}
      />
    );
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<InicioRoute />} />
          <Route path="/inicio" element={<InicioRoute />} />
          <Route path="/gestion/:tipo" element={<GestionRoute />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;