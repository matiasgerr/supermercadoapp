"use client";

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Selector from './components/Home';
import PanelGestion from './screen/dashboard/Dashboard';

function App() {
  // 1. ESTADO DE LOS DATOS: Aquí se guardan todos tus supermercados y productos
  const [comercios, setComercios] = useState<any[]>(() => {
    // Intentamos buscar si ya había algo guardado en la "mochila" del navegador
    if (typeof window !== 'undefined') {
        const guardado = localStorage.getItem('mis-datos-compras');
        return guardado ? JSON.parse(guardado) : [];
    }
    return [];
  });

  // 4. EFECTO: Cada vez que 'comercios' cambie, lo guardamos en LocalStorage automáticamente
  useEffect(() => {
    localStorage.setItem('mis-datos-compras', JSON.stringify(comercios));
  }, [comercios]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Selector />} />
          <Route path="/inicio" element={<Selector />} />
          <Route 
            path="/gestion/:tipo" 
            element={<PanelGestionWrapper comercios={comercios} setComercios={setComercios} />} 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

// Wrapper component to prevent re-mounting of PanelGestion on every render
const PanelGestionWrapper = ({ comercios, setComercios }: { comercios: any[], setComercios: React.Dispatch<React.SetStateAction<any[]>> }) => {
    return <PanelGestion comercios={comercios} setComercios={setComercios} />;
};

export default App;