"use client";

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Selector from './components/Home';
import PanelGestion from './screen/dashboard/Dashboard';
import type { Comercio } from './type/gestion';
import PanelComparar from './screen/comparar/priceComparation';

function App() {
  // 1. ESTADO DE LOS DATOS: Aquí se guardan todos tus supermercados y productos
  const [comercios, setComercios] = useState<Comercio[]>(() => {
    // Intentamos buscar si ya había algo guardado en la "mochila" del navegador
    if (typeof window !== 'undefined') {
        const guardado = localStorage.getItem('mis-datos-compras');
        if (!guardado) return [];
        try {
          return JSON.parse(guardado) as Comercio[];
        } catch {
          return [];
        }
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
            path="/gestion" 
            element={<PanelGestionWrapper comercios={comercios} setComercios={setComercios} />} 
          />
          <Route 
            path="/comparar" 
            element={<PanelCompararWrapper />} 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

// Wrapper component to prevent re-mounting of PanelGestion on every render
const PanelGestionWrapper = ({
  comercios,
  setComercios,
}: {
  comercios: Comercio[];
  setComercios: React.Dispatch<React.SetStateAction<Comercio[]>>;
}) => {
    return <PanelGestion comercios={comercios} setComercios={setComercios} />;
};
const PanelCompararWrapper = () => {
    return <PanelComparar />;
};
export default App;
