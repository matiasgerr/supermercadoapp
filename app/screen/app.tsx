"use client";

import React, { useState, useEffect } from 'react';
import Selector from '../components/Home';
import PanelGestion from './dashboard/Dashboard';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import type { Comercio } from '../type/gestion';

function App() {
  const [comercios, setComercios] = useState<Comercio[]>(() => {
    const guardado = localStorage.getItem('mis-datos-compras');
    if (!guardado) return [];
    try {
      return JSON.parse(guardado) as Comercio[];
    } catch {
      return [];
    }
  });

  // Guardar cada vez que cambien los comercios
  useEffect(() => {
    localStorage.setItem('mis-datos-compras', JSON.stringify(comercios));
  }, [comercios]);

  // 2. ESTADO DE NAVEGACIÓN: Ya no necesitamos estados manuales si usamos rutas

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Selector />} />
          <Route path="/inicio" element={<Selector />} />
          <Route
            path="/gestion/:tipo"
            element={
              <PanelGestion comercios={comercios} setComercios={setComercios} />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
